-- Credits
CREATE TABLE public.user_credits (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 50 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_credits TO authenticated;
GRANT ALL ON public.user_credits TO service_role;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own credits" ON public.user_credits FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Generation history
CREATE TABLE public.image_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  final_prompt TEXT,
  style TEXT,
  aspect_ratio TEXT,
  batch_id UUID,
  batch_size INTEGER NOT NULL DEFAULT 1,
  used_reference BOOLEAN NOT NULL DEFAULT false,
  image_path TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX image_generations_user_created_idx ON public.image_generations (user_id, created_at DESC);
GRANT SELECT, DELETE ON public.image_generations TO authenticated;
GRANT ALL ON public.image_generations TO service_role;
ALTER TABLE public.image_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own generations" ON public.image_generations FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can delete own generations" ON public.image_generations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

INSERT INTO public.user_credits (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

CREATE OR REPLACE FUNCTION public.spend_image_credits(_user_id UUID, _amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  remaining INTEGER;
BEGIN
  IF _amount IS NULL OR _amount < 1 THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.user_credits (user_id) VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.user_credits
     SET balance = balance - _amount, updated_at = now()
   WHERE user_id = _user_id AND balance >= _amount
  RETURNING balance INTO remaining;

  RETURN remaining;
END;
$$;
REVOKE ALL ON FUNCTION public.spend_image_credits(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spend_image_credits(UUID, INTEGER) TO service_role;

-- Users may read their own generated images (stored under <user_id>/...)
CREATE POLICY "Users can read own generated images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'generated-images' AND (storage.foldername(name))[1] = auth.uid()::text);
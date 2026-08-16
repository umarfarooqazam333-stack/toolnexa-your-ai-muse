REVOKE ALL ON FUNCTION public.spend_image_credits(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_credits() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_image_credits(UUID, INTEGER) TO service_role;
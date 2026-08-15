
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email,''),'@',1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'sparkles',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER categories_touch BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- TOOLS
CREATE TABLE public.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  features text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  pricing_model text NOT NULL DEFAULT 'freemium' CHECK (pricing_model IN ('free','freemium','paid')),
  pricing_info text NOT NULL DEFAULT '',
  website_url text NOT NULL,
  logo_url text,
  rating numeric(2,1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  review_count int NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_popular boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT','DISCOVERED','PENDING_REVIEW','APPROVED','PUBLISHED','REJECTED')),
  source text,
  source_url text,
  last_verified date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tools_category_idx ON public.tools(category_id);
CREATE INDEX tools_status_idx ON public.tools(status);
CREATE INDEX tools_pricing_idx ON public.tools(pricing_model);
CREATE INDEX tools_tags_idx ON public.tools USING gin(tags);
GRANT SELECT ON public.tools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tools TO authenticated;
GRANT ALL ON public.tools TO service_role;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published tools are public" ON public.tools FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Admins read all tools" ON public.tools FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage tools" ON public.tools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER tools_touch BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SAVED TOOLS
CREATE TABLE public.saved_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_id)
);
CREATE INDEX saved_tools_user_idx ON public.saved_tools(user_id);
GRANT SELECT, INSERT, DELETE ON public.saved_tools TO authenticated;
GRANT ALL ON public.saved_tools TO service_role;
ALTER TABLE public.saved_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved tools" ON public.saved_tools FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- PROMPTS
CREATE TABLE public.prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  idea text NOT NULL,
  prompt_type text NOT NULL CHECK (prompt_type IN ('image','video','thumbnail','character','anime','realistic')),
  content text NOT NULL,
  provider text NOT NULL DEFAULT 'local-engine',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX prompts_user_idx ON public.prompts(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompts TO authenticated;
GRANT ALL ON public.prompts TO service_role;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prompts" ON public.prompts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DISCOVERED TOOLS (admin review workflow)
CREATE TABLE public.discovered_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website_url text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  suggested_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'DISCOVERED' CHECK (status IN ('DISCOVERED','PENDING_REVIEW','APPROVED','PUBLISHED','REJECTED')),
  source text NOT NULL DEFAULT 'unknown',
  source_url text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  published_tool_id uuid REFERENCES public.tools(id) ON DELETE SET NULL,
  last_verified date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discovered_tools TO authenticated;
GRANT ALL ON public.discovered_tools TO service_role;
ALTER TABLE public.discovered_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage discovered tools" ON public.discovered_tools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER discovered_touch BEFORE UPDATE ON public.discovered_tools
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ADMIN ACTIONS AUDIT
CREATE TABLE public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_actions TO authenticated;
GRANT ALL ON public.admin_actions TO service_role;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view actions" ON public.admin_actions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins log actions" ON public.admin_actions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') AND admin_id = auth.uid());

-- SEED CATEGORIES
INSERT INTO public.categories (slug, name, description, icon, sort_order) VALUES
('ai-image','AI Image','Generate, edit and upscale images with AI image models.','image',1),
('ai-video','AI Video','Create and edit video with generative AI, avatars and motion tools.','video',2),
('ai-writing','AI Writing','Draft, edit and refine text with AI writing assistants.','pen-line',3),
('ai-coding','AI Coding','Write, review and ship code faster with AI developer tools.','code',4),
('ai-voice','AI Voice','Text to speech, voice cloning, transcription and AI audio.','mic',5),
('ai-education','AI Education','Learn, study and research with AI-powered education tools.','graduation-cap',6),
('ai-pdf','AI PDF','Chat with documents, summarise and extract data from PDFs.','file-text',7),
('ai-design','AI Design','Design interfaces, brands and graphics with AI assistance.','palette',8),
('free-ai-tools','Free AI Tools','AI tools that are completely free to use.','gift',9);

-- SEED TOOLS (real tools, official URLs; ratings/reviews intentionally empty)
INSERT INTO public.tools (slug,name,short_description,description,category_id,features,tags,pricing_model,pricing_info,website_url,is_featured,is_popular,source,source_url,last_verified)
SELECT v.slug, v.name, v.short_description, v.description, c.id, v.features, v.tags, v.pricing_model, v.pricing_info, v.website_url, v.is_featured, v.is_popular, 'editorial', v.website_url, CURRENT_DATE
FROM (VALUES
('midjourney','Midjourney','Text-to-image generator known for highly stylised, artistic output.','Midjourney is a generative image service that turns text prompts into high quality images. It is widely used for concept art, illustration and stylised visuals, and is available through its web app and Discord.','ai-image',ARRAY['Text to image','Image variations','Style references','Upscaling'],ARRAY['image generation','art','concept art'],'paid','Subscription plans; no permanent free tier.','https://www.midjourney.com',true,true),
('dall-e-3','DALL·E 3','OpenAI''s image generation model, available inside ChatGPT.','DALL·E 3 is OpenAI''s text-to-image model. It is accessible through ChatGPT and the OpenAI API, and is known for closely following detailed prompt instructions.','ai-image',ARRAY['Text to image','Prompt following','In-chat editing','API access'],ARRAY['image generation','openai'],'freemium','Included with paid ChatGPT plans and available via the OpenAI API.','https://openai.com/index/dall-e-3/',true,true),
('stable-diffusion','Stable Diffusion','Open image models from Stability AI that can run locally or via API.','Stable Diffusion is a family of open image generation models from Stability AI. The models can be self-hosted, fine-tuned, or used through the Stability API and third-party interfaces.','ai-image',ARRAY['Open models','Self-hosting','Fine-tuning','API access'],ARRAY['open source','image generation'],'freemium','Open models are free to self-host; hosted API is credit based.','https://stability.ai',false,true),
('leonardo-ai','Leonardo AI','Image generation platform with fine-tuned models and asset tools.','Leonardo AI is a creative platform for generating images with a library of fine-tuned models, aimed at game assets, marketing visuals and concept design.','ai-image',ARRAY['Model library','Canvas editor','Upscaling','Image to image'],ARRAY['image generation','game assets'],'freemium','Free daily credits with paid subscription tiers.','https://leonardo.ai',false,true),
('adobe-firefly','Adobe Firefly','Adobe''s generative AI for images, integrated across Creative Cloud.','Adobe Firefly provides generative image, text effect and fill capabilities, and is integrated into Photoshop, Illustrator and other Adobe applications.','ai-image',ARRAY['Text to image','Generative fill','Text effects','Creative Cloud integration'],ARRAY['adobe','image generation','design'],'freemium','Free generative credits, with more credits on paid Adobe plans.','https://firefly.adobe.com',false,false),
('ideogram','Ideogram','Image generator with strong handling of text inside images.','Ideogram is a text-to-image tool noted for rendering legible typography within generated images, which makes it useful for posters and logo exploration.','ai-image',ARRAY['Text in images','Style presets','Image editing','Remix'],ARRAY['typography','image generation'],'freemium','Free tier with limited generations; paid plans add capacity.','https://ideogram.ai',false,false),
('runway','Runway','Generative video suite for text-to-video and video editing.','Runway offers generative video models along with editing tools such as inpainting, motion brush and green screen, aimed at filmmakers and creators.','ai-video',ARRAY['Text to video','Image to video','Video editing tools','Motion brush'],ARRAY['video generation','editing'],'freemium','Limited free credits with paid subscription tiers.','https://runwayml.com',true,true),
('pika','Pika','Video generation tool for short AI generated clips.','Pika turns text prompts and images into short video clips, with controls for motion and editing regions of a video.','ai-video',ARRAY['Text to video','Image to video','Region editing','Lip sync'],ARRAY['video generation'],'freemium','Free credits with paid plans for more generations.','https://pika.art',false,true),
('luma-dream-machine','Luma Dream Machine','Video generation model from Luma AI.','Dream Machine by Luma AI generates video clips from text and images, with a focus on natural motion and camera movement.','ai-video',ARRAY['Text to video','Image to video','Camera motion','Extend clips'],ARRAY['video generation'],'freemium','Free generations per month with paid tiers.','https://lumalabs.ai/dream-machine',false,false),
('synthesia','Synthesia','AI avatar video platform for training and business content.','Synthesia creates presenter-style videos using AI avatars and synthetic voices in many languages, commonly used for training, onboarding and product videos.','ai-video',ARRAY['AI avatars','Multilingual voiceover','Templates','Screen recording'],ARRAY['avatar','corporate video'],'paid','Paid subscription plans; free demo video available.','https://www.synthesia.io',false,true),
('heygen','HeyGen','Avatar video generation and AI video translation.','HeyGen generates avatar-led videos and can translate existing videos into other languages with matched lip movement.','ai-video',ARRAY['AI avatars','Video translation','Lip sync','Voice cloning'],ARRAY['avatar','translation'],'freemium','Free trial credits with paid monthly plans.','https://www.heygen.com',false,true),
('kling-ai','Kling AI','Video generation model from Kuaishou.','Kling AI generates video clips from text and images, supporting longer generations and motion controls.','ai-video',ARRAY['Text to video','Image to video','Motion control','Extended duration'],ARRAY['video generation'],'freemium','Daily free credits with paid membership tiers.','https://klingai.com',false,false),
('capcut','CapCut','Video editor with built-in AI editing features.','CapCut is a video editor from ByteDance with AI-assisted features such as auto captions, background removal and templates, available on desktop, web and mobile.','ai-video',ARRAY['Auto captions','Background removal','Templates','Multi-platform'],ARRAY['editing','social video'],'freemium','Free to use with an optional Pro subscription.','https://www.capcut.com',false,true),
('chatgpt','ChatGPT','OpenAI''s conversational assistant for writing, analysis and more.','ChatGPT is a general purpose AI assistant used for writing, brainstorming, coding help, data analysis and research, with image and voice input on supported plans.','ai-writing',ARRAY['Conversational chat','File analysis','Image input','Custom GPTs'],ARRAY['assistant','writing','openai'],'freemium','Free tier available; paid plans add higher limits and more models.','https://chatgpt.com',true,true),
('claude','Claude','Anthropic''s AI assistant, strong at long-form text and documents.','Claude is Anthropic''s assistant, used for long-form writing, document analysis and coding, with a large context window for working across long inputs.','ai-writing',ARRAY['Long context','Document analysis','Projects','Artifacts'],ARRAY['assistant','writing','anthropic'],'freemium','Free tier with paid Pro and team plans.','https://claude.ai',true,true),
('jasper','Jasper','AI writing platform aimed at marketing teams.','Jasper is a marketing-focused AI writing platform with brand voice controls, templates and campaign workflows.','ai-writing',ARRAY['Brand voice','Marketing templates','Campaign workflows','Team collaboration'],ARRAY['marketing','copywriting'],'paid','Paid subscription plans; free trial available.','https://www.jasper.ai',false,false),
('copy-ai','Copy.ai','AI copywriting and go-to-market workflow tool.','Copy.ai generates marketing copy and automates go-to-market workflows such as outbound sequences and content briefs.','ai-writing',ARRAY['Copywriting templates','Workflow automation','Brand voice','Integrations'],ARRAY['copywriting','marketing'],'freemium','Free plan with limited credits; paid plans available.','https://www.copy.ai',false,false),
('grammarly','Grammarly','Writing assistant for grammar, clarity and tone.','Grammarly checks grammar and spelling, suggests clarity and tone improvements, and offers generative writing assistance across apps and browsers.','ai-writing',ARRAY['Grammar checking','Tone suggestions','Generative rewriting','Browser extension'],ARRAY['editing','proofreading'],'freemium','Free plan with paid Pro and business tiers.','https://www.grammarly.com',false,true),
('notion-ai','Notion AI','AI assistant built into the Notion workspace.','Notion AI writes, summarises and answers questions using the content in a Notion workspace, integrated directly into pages and databases.','ai-writing',ARRAY['In-document writing','Workspace search','Summaries','Translation'],ARRAY['productivity','notes'],'paid','Sold as an add-on or included in higher Notion plans.','https://www.notion.com/product/ai',false,false),
('github-copilot','GitHub Copilot','AI pair programmer inside your editor.','GitHub Copilot suggests code completions, answers questions in chat and can work across a repository from supported editors and github.com.','ai-coding',ARRAY['Code completion','Chat in editor','Pull request assistance','Multi-editor support'],ARRAY['coding','ide','github'],'freemium','Free tier with limited completions; paid individual and business plans.','https://github.com/features/copilot',true,true),
('cursor','Cursor','AI-first code editor built on VS Code.','Cursor is a code editor with deep AI integration, including codebase-aware chat, multi-file edits and agentic changes.','ai-coding',ARRAY['Codebase-aware chat','Multi-file edits','Agent mode','VS Code extensions'],ARRAY['coding','editor'],'freemium','Free tier with limits; paid Pro and business plans.','https://cursor.com',true,true),
('windsurf','Windsurf','AI coding assistant and agentic editor from Codeium.','Windsurf provides AI autocomplete, chat and agentic editing across a codebase, with editor and plugin options.','ai-coding',ARRAY['Autocomplete','Agentic editing','Chat','IDE plugins'],ARRAY['coding','editor'],'freemium','Free tier available with paid plans.','https://windsurf.com',false,false),
('replit','Replit','Browser IDE with AI agent for building and deploying apps.','Replit is a cloud development environment with an AI agent that can scaffold, edit and deploy applications directly from the browser.','ai-coding',ARRAY['Cloud IDE','AI agent','Instant deployment','Collaboration'],ARRAY['coding','cloud ide'],'freemium','Free plan with paid Core and team plans.','https://replit.com',false,true),
('tabnine','Tabnine','AI code completion with privacy and self-hosting options.','Tabnine offers AI code completion and chat with options for private deployment, aimed at teams with strict code privacy requirements.','ai-coding',ARRAY['Code completion','Private deployment','Team models','IDE plugins'],ARRAY['coding','privacy'],'freemium','Free basic tier with paid Pro and enterprise plans.','https://www.tabnine.com',false,false),
('lovable','Lovable','Build full-stack web apps by describing them in chat.','Lovable turns natural language into working full-stack web applications, handling the frontend, backend and deployment.','ai-coding',ARRAY['Chat to app','Full-stack generation','Built-in backend','One-click publish'],ARRAY['app builder','no-code','coding'],'freemium','Free daily credits with paid subscription tiers.','https://lovable.dev',false,true),
('elevenlabs','ElevenLabs','High quality AI text to speech and voice cloning.','ElevenLabs produces natural sounding speech from text in many languages, with voice cloning, dubbing and an API for developers.','ai-voice',ARRAY['Text to speech','Voice cloning','Dubbing','Developer API'],ARRAY['tts','voice','audio'],'freemium','Free monthly character allowance with paid tiers.','https://elevenlabs.io',true,true),
('murf-ai','Murf AI','AI voiceover studio for presentations and videos.','Murf AI generates voiceovers from text with a library of voices, plus a studio for syncing audio to slides and video.','ai-voice',ARRAY['Voice library','Voice editing','Video sync','Team workspaces'],ARRAY['tts','voiceover'],'freemium','Free trial with paid subscription plans.','https://murf.ai',false,false),
('play-ht','PlayHT','Text to speech and voice cloning platform.','PlayHT offers realistic text-to-speech voices, voice cloning and a low latency API for conversational applications.','ai-voice',ARRAY['Text to speech','Voice cloning','Low latency API','Multilingual'],ARRAY['tts','api'],'freemium','Free tier with paid plans for higher usage.','https://play.ht',false,false),
('descript','Descript','Edit audio and video by editing the transcript.','Descript transcribes recordings and lets you edit the media by editing text, with filler word removal, overdub voices and screen recording.','ai-voice',ARRAY['Transcript editing','Filler word removal','Overdub','Screen recording'],ARRAY['podcast','editing','transcription'],'freemium','Free plan with limits; paid Hobbyist and Creator plans.','https://www.descript.com',false,true),
('suno','Suno','Generate full songs with vocals from a text prompt.','Suno creates complete music tracks including vocals and instrumentation from a text description of style and lyrics.','ai-voice',ARRAY['Text to music','Vocals','Style control','Custom lyrics'],ARRAY['music','audio generation'],'freemium','Free daily credits with paid subscription tiers.','https://suno.com',false,true),
('openai-whisper','Whisper','Open source speech recognition model from OpenAI.','Whisper is an open source automatic speech recognition model that transcribes and translates audio across many languages, and can be run locally.','ai-voice',ARRAY['Speech to text','Translation','Multilingual','Self-hostable'],ARRAY['transcription','open source','free'],'free','Open source and free to run; hosted API usage is billed separately.','https://github.com/openai/whisper',false,false),
('khanmigo','Khanmigo','AI tutor from Khan Academy for students and teachers.','Khanmigo is Khan Academy''s AI tutoring assistant, guiding students through problems and helping teachers with lesson planning.','ai-education',ARRAY['AI tutoring','Teacher tools','Guided problem solving','Curriculum aligned'],ARRAY['tutoring','students','teachers'],'paid','Low cost subscription for learners; free for many US teachers.','https://www.khanmigo.ai',false,false),
('duolingo','Duolingo','Language learning app with AI-powered practice.','Duolingo teaches languages through short gamified lessons, with AI-driven practice and conversation features on higher tiers.','ai-education',ARRAY['Gamified lessons','Speaking practice','Streaks','Many languages'],ARRAY['languages','learning'],'freemium','Free with ads; paid Super and Max subscriptions.','https://www.duolingo.com',false,true),
('quizlet','Quizlet','Study tool with AI generated practice and explanations.','Quizlet offers flashcards, practice tests and AI-generated study materials from your own notes.','ai-education',ARRAY['Flashcards','Practice tests','AI study guides','Explanations'],ARRAY['study','flashcards'],'freemium','Free study tools with a paid Plus tier.','https://quizlet.com',false,false),
('perplexity','Perplexity','AI answer engine with cited web sources.','Perplexity answers questions by searching the web and citing its sources, with focused search modes and file uploads.','ai-education',ARRAY['Cited answers','Web search','Focus modes','File upload'],ARRAY['research','search'],'freemium','Free tier with a paid Pro subscription.','https://www.perplexity.ai',true,true),
('notebooklm','NotebookLM','Google''s research assistant grounded in your own documents.','NotebookLM answers questions using only the sources you upload, and can generate summaries, study guides and audio overviews.','ai-education',ARRAY['Source grounded answers','Summaries','Audio overviews','Citations'],ARRAY['research','notes','free'],'free','Free to use with a Google account.','https://notebooklm.google.com',false,true),
('chatpdf','ChatPDF','Ask questions about any PDF document.','ChatPDF lets you upload a PDF and ask questions about its contents, returning answers with references to pages.','ai-pdf',ARRAY['Chat with PDF','Page citations','Multiple documents','Summaries'],ARRAY['pdf','documents'],'freemium','Free tier with page and upload limits; paid Plus plan.','https://www.chatpdf.com',false,true),
('adobe-acrobat-ai','Acrobat AI Assistant','Adobe''s AI assistant inside Acrobat for documents.','Acrobat AI Assistant summarises documents, answers questions and generates citations directly inside Adobe Acrobat and Reader.','ai-pdf',ARRAY['Document summaries','Q&A with citations','Works in Acrobat','Multi-document'],ARRAY['pdf','adobe'],'paid','Paid add-on subscription for Acrobat and Reader.','https://www.adobe.com/acrobat/generative-ai-pdf.html',false,false),
('humata','Humata','AI for reading and analysing long technical documents.','Humata answers questions about uploaded files with citations, aimed at research papers, contracts and technical documentation.','ai-pdf',ARRAY['Document Q&A','Citations','Multi-file search','Summaries'],ARRAY['pdf','research'],'freemium','Free pages each month with paid tiers.','https://www.humata.ai',false,false),
('pdf-ai','PDF.ai','Chat with your PDFs and extract information.','PDF.ai lets you upload documents and chat with them, extract data and generate summaries.','ai-pdf',ARRAY['Chat with documents','Data extraction','Summaries','Chrome extension'],ARRAY['pdf','documents'],'freemium','Free plan with limits; paid subscription tiers.','https://pdf.ai',false,false),
('smallpdf','Smallpdf','PDF toolkit with AI chat and conversion tools.','Smallpdf provides PDF conversion, compression, signing and editing, plus an AI assistant for chatting with documents.','ai-pdf',ARRAY['Convert and compress','E-sign','Edit PDFs','AI chat'],ARRAY['pdf','conversion'],'freemium','Limited free usage per day with a paid Pro plan.','https://smallpdf.com',false,true),
('canva-magic-studio','Canva Magic Studio','Canva''s suite of AI design and content tools.','Magic Studio brings AI features to Canva, including generative images, magic write, background removal and design resizing.','ai-design',ARRAY['Magic Write','Generative images','Background remover','Magic Resize'],ARRAY['design','graphics','templates'],'freemium','Free plan with limited AI uses; Canva Pro adds more.','https://www.canva.com/magic-studio/',true,true),
('figma','Figma','Collaborative interface design tool with AI features.','Figma is a collaborative design and prototyping tool for interfaces, with AI assisted features for search, generation and content.','ai-design',ARRAY['Interface design','Prototyping','Real-time collaboration','Design systems'],ARRAY['ui design','prototyping'],'freemium','Free starter plan with paid professional and org plans.','https://www.figma.com',false,true),
('framer','Framer','Website builder with AI assisted layout and content.','Framer is a design-driven website builder with AI features for generating pages, copy and translations, plus hosting.','ai-design',ARRAY['Visual website builder','AI page generation','CMS','Hosting'],ARRAY['websites','design'],'freemium','Free sites on a Framer subdomain; paid plans for custom domains.','https://www.framer.com',false,false),
('uizard','Uizard','Turn text and sketches into UI mockups.','Uizard generates editable UI mockups from text prompts, screenshots or hand drawn sketches.','ai-design',ARRAY['Text to UI','Screenshot import','Sketch scanning','Editable mockups'],ARRAY['wireframes','ui design'],'freemium','Free plan with limited projects; paid Pro tier.','https://uizard.io',false,false),
('looka','Looka','AI logo maker and brand kit generator.','Looka generates logo options from a few brand inputs and produces a matching brand kit of assets.','ai-design',ARRAY['Logo generation','Brand kit','Social templates','File exports'],ARRAY['logo','branding'],'paid','Free to preview designs; payment required to download assets.','https://looka.com',false,false)
) AS v(slug,name,short_description,description,category_slug,features,tags,pricing_model,pricing_info,website_url,is_featured,is_popular)
JOIN public.categories c ON c.slug = v.category_slug;

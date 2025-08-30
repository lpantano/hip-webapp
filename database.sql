-- Create enum types for claims
CREATE TYPE claim_status AS ENUM ('proposed','pending', 'verified', 'disputed', 'needs_more_evidence');
CREATE TYPE claim_category AS ENUM ('nutrition', 'fitness', 'mental_health', 'pregnancy', 'menopause', 'general_health', 'perimenopause');
CREATE TYPE evidence_score_category AS ENUM ('study_size', 'population', 'consensus', 'interpretation');
CREATE TYPE public.source_type AS ENUM (
  'webpage',
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'facebook',
  'reddit',
  'podcast',
  'book',
  'research_paper',
  'other'
);

create table public.user_roles (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  role public.app_role not null default 'user'::app_role,
  assigned_at timestamp with time zone not null default now(),
  constraint user_roles_pkey primary key (id),
  constraint user_roles_user_id_role_key unique (user_id, role),
  constraint user_roles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Create claims table
CREATE TABLE public.claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category claim_category NOT NULL,
  status claim_status NOT NULL DEFAULT 'pending',
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create publications table
CREATE TABLE public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  journal TEXT NOT NULL,
  publication_year INTEGER NOT NULL,
  doi TEXT,
  url TEXT,
  abstract TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create publication_scores table for expert evaluations
CREATE TABLE public.publication_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  expert_user_id UUID NOT NULL,
  category evidence_score_category NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(publication_id, expert_user_id, category)
);

-- Create claim_votes table
CREATE TABLE public.claim_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(claim_id, user_id)
);

-- Create claim_reactions table
CREATE TABLE public.claim_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('helpful', 'insightful', 'wantmore', 'moneysaver')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(claim_id, user_id, reaction_type)
);

-- Create sources table (add user_id as owner)
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- owner of the source row
  source_type source_type NOT NULL,
  source_url TEXT,
  source_title TEXT,
  source_description TEXT,
  author_name TEXT,
  published_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- RLS: make reads authenticated-only, require ownership for modifications
CREATE POLICY "Authenticated users can read sources"
ON public.sources
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert sources"
ON public.sources
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sources"
ON public.sources
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own sources"
ON public.sources
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_sources_claim_id ON public.sources(claim_id);
CREATE INDEX idx_sources_type ON public.sources(source_type);

-- Add trigger for updated_at
CREATE TRIGGER update_sources_updated_at
BEFORE UPDATE ON public.sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- Enable Row Level Security
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for claims
-- Make claims readable by authenticated users only; restrict create/update to owners
CREATE POLICY "Claims are viewable by authenticated users"
ON public.claims
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create claims"
ON public.claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims"
ON public.claims
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only admins can delete claims
CREATE POLICY "Only admins can delete claims"
ON public.claims
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for publications
-- Publications are auth-read; creation/update restricted to experts/admins
CREATE POLICY "Publications are viewable by authenticated users"
ON public.publications
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Experts can create publications"
ON public.publications
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'expert') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Experts can update publications"
ON public.publications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'expert') OR has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'expert') OR has_role(auth.uid(), 'admin'));

-- Create RLS policies for publication_scores
CREATE POLICY "Publication scores are viewable by authenticated users"
ON public.publication_scores
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Experts can create scores"
ON public.publication_scores
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = expert_user_id
  AND (has_role(auth.uid(), 'expert') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Experts can update their own scores"
ON public.publication_scores
FOR UPDATE
TO authenticated
USING (
  auth.uid() = expert_user_id
  AND (has_role(auth.uid(), 'expert') OR has_role(auth.uid(), 'admin'))
)
WITH CHECK (
  auth.uid() = expert_user_id
  AND (has_role(auth.uid(), 'expert') OR has_role(auth.uid(), 'admin'))
);

-- Create RLS policies for claim_votes
CREATE POLICY "Votes are viewable by authenticated users"
ON public.claim_votes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can vote on claims"
ON public.claim_votes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
ON public.claim_votes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for claim_reactions
CREATE POLICY "Reactions are viewable by authenticated users"
ON public.claim_reactions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can react to claims"
ON public.claim_reactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON public.claim_reactions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_claims_category ON public.claims(category);
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_claims_user_id ON public.claims(user_id);
CREATE INDEX idx_publications_claim_id ON public.publications(claim_id);
CREATE INDEX idx_publication_scores_publication_id ON public.publication_scores(publication_id);
CREATE INDEX idx_publication_scores_expert ON public.publication_scores(expert_user_id);
CREATE INDEX idx_claim_votes_claim_id ON public.claim_votes(claim_id);
CREATE INDEX idx_claim_reactions_claim_id ON public.claim_reactions(claim_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publication_scores_updated_at
  BEFORE UPDATE ON public.publication_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update claim vote count when votes are added/removed
CREATE OR REPLACE FUNCTION update_claim_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.claims 
    SET vote_count = vote_count + 1 
    WHERE id = NEW.claim_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.claims 
    SET vote_count = vote_count - 1 
    WHERE id = OLD.claim_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for vote counting
CREATE TRIGGER claim_vote_count_trigger_insert
  AFTER INSERT ON public.claim_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_vote_count();

CREATE TRIGGER claim_vote_count_trigger_delete
  AFTER DELETE ON public.claim_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_vote_count();


-- Create expert_applications table
CREATE TABLE public.expert_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  credentials TEXT,
  expertise_area TEXT,
  motivation TEXT,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social_media_links table for multiple social links per application
CREATE TABLE public.social_media_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.expert_applications(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'linkedin', 'twitter', 'instagram', 'tiktok', etc.
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for expert_applications
CREATE POLICY "Users can view their own applications"
ON public.expert_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
ON public.expert_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
ON public.expert_applications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.expert_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all applications"
ON public.expert_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for social_media_links
CREATE POLICY "Users can view their own social media links"
ON public.social_media_links
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.expert_applications 
  WHERE id = application_id AND user_id = auth.uid()
));

CREATE POLICY "Users can manage their own social media links"
ON public.social_media_links
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.expert_applications 
  WHERE id = application_id AND user_id = auth.uid()
));

CREATE POLICY "Admins can view all social media links"
ON public.social_media_links
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_expert_applications_user_id ON public.expert_applications(user_id);
CREATE INDEX idx_expert_applications_status ON public.expert_applications(status);
CREATE INDEX idx_social_media_links_application_id ON public.social_media_links(application_id);

-- Create trigger for updated_at
CREATE TRIGGER update_expert_applications_updated_at
  BEFORE UPDATE ON public.expert_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


--Current profile table
create table public.profiles (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  display_name text null,
  avatar_url text null,
  bio text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_user_id_key unique (user_id),
  constraint profiles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION update_updated_at_column ();

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS: users can read their own profile; admins can read all
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX idx_profiles_is_expert ON public.profiles(is_expert);

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- View to aggregate claims with nested publications (including publication_scores) and claim_reactions
CREATE OR REPLACE VIEW public.claims_full 
WITH (security_barrier) AS
SELECT
  c.id,
  c.user_id,
  c.title,
  c.description,
  c.category,
  c.status,
  c.vote_count,
  c.created_at,
  c.updated_at,
  (
    SELECT COALESCE(json_agg(p_row), '[]'::json) FROM (
      SELECT
        p.id,
        p.claim_id,
        p.title,
        p.journal,
        p.publication_year,
        p.doi,
        p.url,
        p.created_at,
        (
          SELECT COALESCE(json_agg(ps_row), '[]'::json) FROM (
            SELECT
              ps.id,
              ps.publication_id,
              ps.expert_user_id,
              ps.category,
              ps.score,
              ps.notes,
              ps.created_at,
              ps.updated_at
            FROM public.publication_scores ps
            WHERE ps.publication_id = p.id
            ORDER BY ps.created_at ASC
          ) ps_row
        ) AS publication_scores
      FROM public.publications p
      WHERE p.claim_id = c.id
      ORDER BY p.created_at ASC
    ) p_row
  ) AS publications,
  (
    SELECT COALESCE(json_agg(r_row), '[]'::json) FROM (
      SELECT
        r.id,
        r.claim_id,
        r.user_id,
        r.reaction_type,
        r.created_at
      FROM public.claim_reactions r
      WHERE r.claim_id = c.id
      ORDER BY r.created_at ASC
    ) r_row
  ) AS claim_reactions
FROM public.claims c;

-- Grant select on view to authenticated role (optional — RLS on underlying tables still applies)
GRANT SELECT ON public.claims_full TO authenticated;


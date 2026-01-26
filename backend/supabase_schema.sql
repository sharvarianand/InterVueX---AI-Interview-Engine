-- InterVueX Supabase Schema

-- Users table (Synced from Clerk)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'student' CHECK (role = 'student'),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CVs Table
CREATE TABLE IF NOT EXISTS public.cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.profiles(id),
    parsed_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview Sessions
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    mode TEXT NOT NULL,
    persona TEXT NOT NULL,
    github_url TEXT,
    deployment_url TEXT,
    project_summary TEXT,
    cv_metadata JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation (Questions and Answers)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.interview_sessions ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_intent TEXT,
    answer_text TEXT,
    evaluation_score FLOAT, -- Changed to FLOAT for better precision
    evaluation_feedback TEXT,
    behavior_flags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.interview_sessions ON DELETE CASCADE UNIQUE,
    user_id TEXT,
    overall_score FLOAT,
    verdict TEXT,
    skill_scores JSONB, -- Array of {skill: string, score: number, feedback: string}
    project_understanding_score FLOAT,
    reasoning_depth_index FLOAT,
    confidence_index FLOAT,
    behavioral_consistency FLOAT,
    improvement_roadmap JSONB, -- Array of strings
    strengths JSONB, -- Array of strings
    weaknesses JSONB, -- Array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own CVs" ON public.cvs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own CVs" ON public.cvs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON public.interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT USING (auth.uid() = user_id);

-- Conversations policy based on session ownership
CREATE POLICY "Users can view conversations from their sessions" ON public.conversations 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.interview_sessions 
        WHERE id = session_id AND user_id = auth.uid()
    )
);

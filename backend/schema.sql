-- InterVueX Database Schema
-- Database: PostgreSQL (Supabase)
-- Version: 1.0.0

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(100), -- Target job role
    experience VARCHAR(50), -- Experience level
    tech_stack TEXT[], -- Array of technologies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INTERVIEWS TABLE
-- ============================================
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'technical', 'hr', 'project', 'techstack'
    role VARCHAR(100),
    tech_stack TEXT[],
    experience VARCHAR(50),
    persona VARCHAR(50) DEFAULT 'balanced', -- 'friendly', 'balanced', 'challenging'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- QUESTIONS TABLE
-- ============================================
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    topic VARCHAR(255),
    difficulty VARCHAR(50), -- 'easy', 'medium', 'hard'
    expected_points TEXT[],
    question_order INTEGER,
    time_limit_seconds INTEGER DEFAULT 180,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ANSWERS TABLE
-- ============================================
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    answer_text TEXT,
    audio_url TEXT, -- For voice answers
    time_spent_seconds INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EVALUATIONS TABLE
-- ============================================
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
    correctness_score DECIMAL(4,2),
    depth_score DECIMAL(4,2),
    clarity_score DECIMAL(4,2),
    practical_score DECIMAL(4,2),
    confidence_score DECIMAL(4,2),
    overall_score DECIMAL(4,2),
    feedback TEXT,
    strong_points TEXT[],
    weak_points TEXT[],
    missed_concepts TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    overall_score INTEGER, -- 0-100
    skill_breakdown JSONB, -- { correctness: 80, depth: 75, ... }
    strong_areas TEXT[],
    weak_areas TEXT[],
    missed_concepts TEXT[],
    recommendation TEXT,
    readiness_level VARCHAR(50), -- 'low', 'medium', 'high'
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROGRESS METRICS TABLE
-- ============================================
CREATE TABLE progress_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_date DATE DEFAULT CURRENT_DATE,
    total_interviews INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    practice_minutes INTEGER DEFAULT 0,
    skills_improved TEXT[],
    weak_areas TEXT[],
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, metric_date)
);

-- ============================================
-- PROCTORING LOGS TABLE
-- ============================================
CREATE TABLE proctoring_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    violation_type VARCHAR(100), -- 'tab_switch', 'fullscreen_exit', 'multiple_faces', 'no_face'
    violation_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MEMORY ENGINE TABLE (for AI context)
-- ============================================
CREATE TABLE user_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    strong_topics TEXT[],
    weak_topics TEXT[],
    common_mistakes TEXT[],
    answered_questions UUID[], -- References to question IDs
    total_questions_answered INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CVS/RESUMES TABLE (for Project Viva)
-- ============================================
CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_url TEXT,
    parsed_content JSONB, -- Extracted data from resume
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_questions_interview_id ON questions(interview_id);
CREATE INDEX idx_answers_interview_id ON answers(interview_id);
CREATE INDEX idx_evaluations_answer_id ON evaluations(answer_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_progress_user_date ON progress_metrics(user_id, metric_date);
CREATE INDEX idx_proctoring_interview ON proctoring_logs(interview_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctoring_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY user_policy ON users FOR ALL USING (auth.uid()::text = clerk_id);
CREATE POLICY interviews_policy ON interviews FOR ALL USING (user_id = auth.uid());
CREATE POLICY reports_policy ON reports FOR ALL USING (user_id = auth.uid());
CREATE POLICY progress_policy ON progress_metrics FOR ALL USING (user_id = auth.uid());
CREATE POLICY memory_policy ON user_memory FOR ALL USING (user_id = auth.uid());
CREATE POLICY cvs_policy ON cvs FOR ALL USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Calculate interview duration on completion
CREATE OR REPLACE FUNCTION calculate_interview_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.ended_at IS NOT NULL THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calc_duration
    BEFORE UPDATE ON interviews
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION calculate_interview_duration();

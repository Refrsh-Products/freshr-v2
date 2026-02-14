-- Migration: Add quiz sessions for timed quiz support
-- Run this in your Supabase SQL Editor

-- Create quiz_sessions table to track timed quiz attempts
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  allocated_time_seconds INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL
);

-- Index for querying sessions by user
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_quiz_id ON quiz_sessions(quiz_id);

-- Enable Row Level Security
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: users can only manage their own sessions
CREATE POLICY "Users can manage their own sessions" ON quiz_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Extend quiz_attempts to link sessions and track late submissions
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES quiz_sessions(id);
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS is_late_submission BOOLEAN DEFAULT FALSE;

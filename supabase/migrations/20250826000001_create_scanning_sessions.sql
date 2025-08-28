-- Migration: Create scanning sessions table for prescription scanning session management
-- Date: 2025-08-26
-- Purpose: Support session recovery, progress tracking, and error handling for prescription scanning

-- Create scanning sessions table
CREATE TABLE IF NOT EXISTS scanning_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Session lifecycle tracking
    status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN (
        'uploading', 'analyzing', 'analyzed', 'validation_failed',
        'saving', 'save_failed', 'completed', 'error'
    )),
    
    -- Progress data
    uploaded_path TEXT,
    analysis_result JSONB,
    error_message TEXT,
    validation_errors TEXT[],
    prescription_id UUID REFERENCES patient__presc__prescriptions(prescription_id),
    
    -- Session management
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 hours')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scanning_sessions_user_id ON scanning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_scanning_sessions_status ON scanning_sessions(status);
CREATE INDEX IF NOT EXISTS idx_scanning_sessions_expires_at ON scanning_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_scanning_sessions_created_at ON scanning_sessions(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_scanning_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_scanning_sessions_updated_at
    BEFORE UPDATE ON scanning_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_scanning_sessions_updated_at();

-- Create Row Level Security (RLS) policies
ALTER TABLE scanning_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own sessions
CREATE POLICY policy_scanning_sessions_user_access 
    ON scanning_sessions 
    FOR ALL
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON scanning_sessions TO authenticated;
GRANT ALL ON scanning_sessions TO service_role;

-- Create cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_scanning_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM scanning_sessions 
    WHERE expires_at < NOW()
    AND status IN ('completed', 'error', 'save_failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on table and key columns
COMMENT ON TABLE scanning_sessions IS 'Session management for prescription scanning workflow with recovery support';
COMMENT ON COLUMN scanning_sessions.session_id IS 'Unique session identifier for tracking scanning progress';
COMMENT ON COLUMN scanning_sessions.user_id IS 'User performing the prescription scan';
COMMENT ON COLUMN scanning_sessions.status IS 'Current status in scanning pipeline';
COMMENT ON COLUMN scanning_sessions.analysis_result IS 'AI analysis result stored as JSONB';
COMMENT ON COLUMN scanning_sessions.expires_at IS 'Session expiry time (2 hours from creation)';
COMMENT ON COLUMN scanning_sessions.retry_count IS 'Number of retry attempts for failed operations';
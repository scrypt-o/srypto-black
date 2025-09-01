-- Scrypto Project Intelligence Database Schema
-- Purpose: Structured storage of all project knowledge for AI system

-- Core project features and implementation status
CREATE TABLE project_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL, -- patient, pharmacy, admin
  group_name TEXT NOT NULL, -- medhist, persinfo, prescriptions, etc.
  item TEXT NOT NULL, -- allergies, conditions, profile, etc.
  
  -- Implementation tracking
  spec_status TEXT DEFAULT 'draft' CHECK (spec_status IN ('draft', 'approved', 'implemented')),
  implementation_status TEXT DEFAULT 'not_started' CHECK (implementation_status IN (
    'not_started', 'in_progress', 'completed', 'tested', 'production'
  )),
  
  -- File existence tracking
  has_page BOOLEAN DEFAULT FALSE,
  has_api BOOLEAN DEFAULT FALSE, 
  has_schema BOOLEAN DEFAULT FALSE,
  has_hooks BOOLEAN DEFAULT FALSE,
  has_tests BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  implementation_date DATE,
  
  UNIQUE(domain, group_name, item)
);

-- Specifications and documentation storage
CREATE TABLE specifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id INTEGER REFERENCES project_features(id),
  
  spec_type TEXT NOT NULL CHECK (spec_type IN ('core', 'api', 'database', 'ui', 'business')),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Full specification content
  file_path TEXT, -- Original file location
  
  version TEXT DEFAULT '1.0',
  approved_by TEXT,
  approved_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Code components and file tracking
CREATE TABLE code_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id INTEGER REFERENCES project_features(id),
  
  component_type TEXT NOT NULL CHECK (component_type IN (
    'page', 'api_route', 'schema', 'hook', 'component', 'layout', 'config', 'test'
  )),
  
  file_path TEXT NOT NULL,
  file_size INTEGER,
  lines_of_code INTEGER,
  
  -- Status tracking
  exists BOOLEAN DEFAULT FALSE,
  compiles BOOLEAN DEFAULT FALSE,
  tested BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  last_checked DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(feature_id, file_path)
);

-- API endpoint verification
CREATE TABLE api_endpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id INTEGER REFERENCES project_features(id),
  
  path TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  
  -- Response tracking
  expected_status INTEGER DEFAULT 200,
  actual_status INTEGER,
  response_time_ms INTEGER,
  
  -- Security checks
  has_auth BOOLEAN DEFAULT FALSE,
  has_csrf BOOLEAN DEFAULT FALSE,
  has_validation BOOLEAN DEFAULT FALSE,
  
  -- Testing
  last_tested DATETIME,
  test_result TEXT CHECK (test_result IN ('pass', 'fail', 'partial', 'not_tested')),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(path, method)
);

-- Test coverage and results
CREATE TABLE test_coverage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id INTEGER REFERENCES project_features(id),
  
  test_type TEXT NOT NULL CHECK (test_type IN ('unit', 'integration', 'e2e', 'visual')),
  test_file TEXT,
  
  -- Results
  total_tests INTEGER DEFAULT 0,
  passing_tests INTEGER DEFAULT 0,
  failing_tests INTEGER DEFAULT 0,
  
  coverage_percentage REAL,
  last_run DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vector embeddings for semantic search
CREATE TABLE document_embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Source document
  source_type TEXT NOT NULL CHECK (source_type IN ('spec', 'code', 'test', 'documentation')),
  source_id INTEGER, -- References specs, components, etc.
  content_chunk TEXT NOT NULL,
  
  -- Embedding data (JSON array of floats)
  embedding_vector TEXT NOT NULL, -- JSON array
  embedding_model TEXT DEFAULT 'text-embedding-3-small',
  
  -- Metadata for retrieval
  tags TEXT, -- JSON array of tags
  metadata TEXT, -- JSON object with additional context
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI chat history and context
CREATE TABLE ai_interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  session_id TEXT NOT NULL,
  user_level TEXT NOT NULL CHECK (user_level IN ('developer', 'stakeholder', 'client')),
  
  -- Conversation
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  context_used TEXT, -- JSON array of relevant specs/code used
  
  -- Metadata
  response_time_ms INTEGER,
  tokens_used INTEGER,
  model_used TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Change tracking and impact analysis
CREATE TABLE change_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Request details
  requested_by TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('feature', 'bug_fix', 'enhancement', 'refactor')),
  description TEXT NOT NULL,
  
  -- AI analysis
  impact_analysis TEXT, -- AI-generated impact assessment
  affected_features TEXT, -- JSON array of feature IDs
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Status
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'ai_reviewed', 'approved', 'in_progress', 'completed', 'rejected'
  )),
  
  -- Implementation tracking
  implementation_plan TEXT,
  completion_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project metrics and KPIs
CREATE TABLE project_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  metric_date DATE NOT NULL,
  
  -- Implementation metrics
  total_features INTEGER DEFAULT 0,
  completed_features INTEGER DEFAULT 0,
  tested_features INTEGER DEFAULT 0,
  production_ready INTEGER DEFAULT 0,
  
  -- Code quality metrics
  typescript_errors INTEGER DEFAULT 0,
  lint_warnings INTEGER DEFAULT 0,
  test_coverage_percentage REAL DEFAULT 0,
  
  -- Performance metrics
  api_response_time_avg REAL,
  page_load_time_avg REAL,
  mobile_performance_score INTEGER,
  
  -- Security metrics
  security_issues INTEGER DEFAULT 0,
  auth_coverage_percentage REAL DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(metric_date)
);

-- Indexes for performance
CREATE INDEX idx_features_domain_group ON project_features(domain, group_name);
CREATE INDEX idx_features_status ON project_features(implementation_status);
CREATE INDEX idx_specifications_feature ON specifications(feature_id);
CREATE INDEX idx_components_feature ON code_components(feature_id);
CREATE INDEX idx_endpoints_feature ON api_endpoints(feature_id);
CREATE INDEX idx_embeddings_source ON document_embeddings(source_type, source_id);
CREATE INDEX idx_interactions_session ON ai_interactions(session_id);
CREATE INDEX idx_changes_status ON change_requests(status);

-- Views for common queries
CREATE VIEW v_feature_status AS
SELECT 
  f.*,
  COUNT(s.id) as spec_count,
  COUNT(c.id) as component_count,
  COUNT(a.id) as api_count,
  COUNT(t.id) as test_count
FROM project_features f
LEFT JOIN specifications s ON f.id = s.feature_id
LEFT JOIN code_components c ON f.id = c.feature_id  
LEFT JOIN api_endpoints a ON f.id = a.feature_id
LEFT JOIN test_coverage t ON f.id = t.feature_id
GROUP BY f.id;

CREATE VIEW v_implementation_progress AS
SELECT 
  domain,
  COUNT(*) as total_features,
  SUM(CASE WHEN implementation_status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN implementation_status = 'tested' THEN 1 ELSE 0 END) as tested,
  SUM(CASE WHEN implementation_status = 'production' THEN 1 ELSE 0 END) as production_ready,
  ROUND(
    (SUM(CASE WHEN implementation_status IN ('completed', 'tested', 'production') THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 
    2
  ) as completion_percentage
FROM project_features
GROUP BY domain;
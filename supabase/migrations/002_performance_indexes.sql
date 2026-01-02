-- Performance Optimization: Database Indexes
-- Migration: 002_performance_indexes

-- =============================================================================
-- NOTES TABLE INDEXES
-- =============================================================================

-- Index for org-based queries (most common filter)
CREATE INDEX IF NOT EXISTS idx_notes_org_id
  ON notes(org_id);

-- Index for user's notes queries
CREATE INDEX IF NOT EXISTS idx_notes_created_by
  ON notes(created_by);

-- Composite index for org + created_at (for recent notes query)
CREATE INDEX IF NOT EXISTS idx_notes_org_created
  ON notes(org_id, created_at DESC);

-- Index for slug-based lookups
CREATE INDEX IF NOT EXISTS idx_notes_slug
  ON notes(slug);

-- Index for public notes queries
CREATE INDEX IF NOT EXISTS idx_notes_public
  ON notes(is_public)
  WHERE is_public = true;

-- Index for share hash lookups
CREATE INDEX IF NOT EXISTS idx_notes_share_hash
  ON notes(share_hash)
  WHERE share_hash IS NOT NULL;

-- Full-text search index for title and content
CREATE INDEX IF NOT EXISTS idx_notes_search
  ON notes USING GIN (to_tsvector('english', title || ' ' || markdown));

-- Index for archived notes filtering
CREATE INDEX IF NOT EXISTS idx_notes_archived
  ON notes(is_archived, archived_at)
  WHERE is_archived = true;

-- =============================================================================
-- ANNOTATIONS TABLE INDEXES
-- =============================================================================

-- Index for note's annotations
CREATE INDEX IF NOT EXISTS idx_annotations_note_id
  ON annotations(note_id);

-- Index for user's annotations
CREATE INDEX IF NOT EXISTS idx_annotations_user_id
  ON annotations(user_id);

-- Composite index for note + user annotations
CREATE INDEX IF NOT EXISTS idx_annotations_note_user
  ON annotations(note_id, user_id);

-- Index for annotation type filtering
CREATE INDEX IF NOT EXISTS idx_annotations_type
  ON annotations(type);

-- Index for block-based queries
CREATE INDEX IF NOT EXISTS idx_annotations_block_id
  ON annotations(block_id);

-- =============================================================================
-- USERS TABLE INDEXES
-- =============================================================================

-- Index for org membership queries
CREATE INDEX IF NOT EXISTS idx_users_org_id
  ON users(org_id);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email
  ON users(email);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role
  ON users(role);

-- Composite index for org + role
CREATE INDEX IF NOT EXISTS idx_users_org_role
  ON users(org_id, role);

-- =============================================================================
-- ORGANIZATIONS TABLE INDEXES
-- =============================================================================

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_organizations_slug
  ON organizations(slug);

-- Index for plan-based queries
CREATE INDEX IF NOT EXISTS idx_organizations_plan
  ON organizations(plan);

-- =============================================================================
-- PARTIAL INDEXES FOR COMMON FILTERS
-- =============================================================================

-- Index for active (non-archived) notes per org
CREATE INDEX IF NOT EXISTS idx_notes_active_org
  ON notes(org_id, created_at DESC)
  WHERE is_archived = false;

-- Index for recent notes (last 30 days)
CREATE INDEX IF NOT EXISTS idx_notes_recent
  ON notes(created_at DESC)
  WHERE created_at > NOW() - INTERVAL '30 days';

-- =============================================================================
-- PERFORMANCE STATISTICS
-- =============================================================================

-- Enable statistics for query planner
ALTER TABLE notes ALTER COLUMN org_id SET STATISTICS 1000;
ALTER TABLE notes ALTER COLUMN created_at SET STATISTICS 1000;
ALTER TABLE annotations ALTER COLUMN note_id SET STATISTICS 1000;
ALTER TABLE users ALTER COLUMN org_id SET STATISTICS 1000;

-- =============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- =============================================================================

-- View for org statistics (cached for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS org_stats AS
SELECT
  org_id,
  COUNT(DISTINCT id) as total_notes,
  COUNT(DISTINCT created_by) as active_users,
  COUNT(DISTINCT id) FILTER (WHERE is_public = true) as public_notes,
  COUNT(DISTINCT id) FILTER (WHERE is_archived = true) as archived_notes,
  MAX(created_at) as last_note_created,
  MIN(created_at) as first_note_created
FROM notes
GROUP BY org_id;

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_stats_org_id
  ON org_stats(org_id);

-- Refresh materialized view (schedule this in cron)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY org_stats;

-- =============================================================================
-- FUNCTION TO ANALYZE INDEX USAGE
-- =============================================================================

CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE (
  schemaname text,
  tablename text,
  indexname text,
  index_size text,
  index_scans bigint,
  tuples_read bigint,
  tuples_fetched bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname::text,
    tablename::text,
    indexname::text,
    pg_size_pretty(pg_relation_size(indexrelid))::text as index_size,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FUNCTION TO FIND MISSING INDEXES
-- =============================================================================

CREATE OR REPLACE FUNCTION find_missing_indexes()
RETURNS TABLE (
  tablename text,
  seq_scans bigint,
  idx_scans bigint,
  recommendation text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    relname::text as tablename,
    seq_scan as seq_scans,
    idx_scan as idx_scans,
    CASE
      WHEN seq_scan > 1000 AND idx_scan < seq_scan * 0.1
      THEN 'Consider adding indexes - high sequential scans'
      WHEN seq_scan > 10000
      THEN 'URGENT: Add indexes - very high sequential scans'
      ELSE 'Indexes seem adequate'
    END::text as recommendation
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY seq_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VACUUM AND ANALYZE
-- =============================================================================

-- Run VACUUM ANALYZE to update statistics
VACUUM ANALYZE notes;
VACUUM ANALYZE annotations;
VACUUM ANALYZE users;
VACUUM ANALYZE organizations;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON INDEX idx_notes_org_id IS 'Primary filter for notes queries by organization';
COMMENT ON INDEX idx_notes_search IS 'Full-text search index for title and content';
COMMENT ON MATERIALIZED VIEW org_stats IS 'Cached organization statistics for analytics dashboard';
COMMENT ON FUNCTION analyze_index_usage() IS 'Helper function to analyze which indexes are being used';
COMMENT ON FUNCTION find_missing_indexes() IS 'Helper function to identify tables that might benefit from additional indexes';

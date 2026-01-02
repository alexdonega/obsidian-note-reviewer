-- Database Query Optimization & Performance Analysis
-- Run these queries to identify and fix performance bottlenecks

-- ============================================================================
-- 1. QUERY PERFORMANCE ANALYSIS
-- ============================================================================

-- Identify slow queries (requires pg_stat_statements extension)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 20 slowest queries by average execution time
SELECT
  query,
  calls,
  total_exec_time / calls AS avg_time_ms,
  total_exec_time,
  min_exec_time,
  max_exec_time,
  stddev_exec_time,
  rows / calls AS avg_rows
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY avg_time_ms DESC
LIMIT 20;

-- Top 20 most frequently executed queries
SELECT
  query,
  calls,
  total_exec_time / calls AS avg_time_ms,
  total_exec_time,
  (total_exec_time / SUM(total_exec_time) OVER ()) * 100 AS pct_total_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY calls DESC
LIMIT 20;

-- Queries with high I/O (shared block reads/writes)
SELECT
  query,
  calls,
  shared_blks_hit,
  shared_blks_read,
  shared_blks_written,
  ROUND((shared_blks_hit::numeric / NULLIF(shared_blks_hit + shared_blks_read, 0)) * 100, 2) AS cache_hit_ratio
FROM pg_stat_statements
WHERE shared_blks_read > 0 OR shared_blks_written > 0
ORDER BY (shared_blks_read + shared_blks_written) DESC
LIMIT 20;

-- ============================================================================
-- 2. INDEX USAGE ANALYSIS
-- ============================================================================

-- Unused indexes (never scanned)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Low-usage indexes (scan ratio < 1%)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  ROUND((idx_scan::numeric / NULLIF(seq_scan + idx_scan, 0)) * 100, 2) AS scan_ratio
FROM pg_stat_user_indexes
JOIN pg_stat_user_tables USING (schemaname, tablename)
WHERE schemaname = 'public'
  AND (idx_scan::numeric / NULLIF(seq_scan + idx_scan, 0)) < 0.01
ORDER BY pg_relation_size(indexrelid) DESC;

-- Missing indexes (tables with high sequential scans)
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  ROUND((seq_scan::numeric / NULLIF(seq_scan + idx_scan, 0)) * 100, 2) AS seq_scan_ratio,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 1000
  AND (seq_scan::numeric / NULLIF(seq_scan + idx_scan, 0)) > 0.5
ORDER BY seq_tup_read DESC
LIMIT 20;

-- Index bloat estimation
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  ROUND(100 * (pg_relation_size(indexrelid)::numeric / NULLIF(pg_total_relation_size(relid), 0)), 2) AS bloat_pct
FROM pg_stat_user_indexes
JOIN pg_class ON pg_class.oid = indexrelid
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- ============================================================================
-- 3. TABLE OPTIMIZATION
-- ============================================================================

-- Table bloat and dead tuples
SELECT
  schemaname,
  tablename,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  ROUND(100 * (n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0)), 2) AS dead_ratio,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;

-- Tables that need VACUUM
SELECT
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup,
  ROUND(100 * (n_dead_tup::numeric / NULLIF(n_live_tup, 0)), 2) AS dead_ratio,
  last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_dead_tup > 1000
  AND (n_dead_tup::numeric / NULLIF(n_live_tup, 0)) > 0.1
ORDER BY n_dead_tup DESC;

-- Tables that need ANALYZE
SELECT
  schemaname,
  tablename,
  last_analyze,
  last_autoanalyze,
  n_mod_since_analyze,
  n_live_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_mod_since_analyze > 1000
ORDER BY n_mod_since_analyze DESC;

-- ============================================================================
-- 4. CACHE HIT RATIO
-- ============================================================================

-- Overall cache hit ratio (should be > 99%)
SELECT
  'Overall' AS type,
  SUM(heap_blks_read) AS heap_read,
  SUM(heap_blks_hit) AS heap_hit,
  ROUND(SUM(heap_blks_hit)::numeric / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0) * 100, 2) AS cache_hit_ratio
FROM pg_statio_user_tables
WHERE schemaname = 'public';

-- Cache hit ratio per table
SELECT
  schemaname,
  tablename,
  heap_blks_read,
  heap_blks_hit,
  ROUND(heap_blks_hit::numeric / NULLIF(heap_blks_hit + heap_blks_read, 0) * 100, 2) AS cache_hit_ratio,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_statio_user_tables
JOIN pg_stat_user_tables USING (schemaname, tablename)
WHERE schemaname = 'public'
  AND (heap_blks_read + heap_blks_hit) > 0
ORDER BY cache_hit_ratio ASC;

-- Index cache hit ratio
SELECT
  schemaname,
  tablename,
  indexname,
  idx_blks_read,
  idx_blks_hit,
  ROUND(idx_blks_hit::numeric / NULLIF(idx_blks_hit + idx_blks_read, 0) * 100, 2) AS cache_hit_ratio
FROM pg_statio_user_indexes
WHERE schemaname = 'public'
  AND (idx_blks_read + idx_blks_hit) > 0
ORDER BY cache_hit_ratio ASC;

-- ============================================================================
-- 5. CONNECTION & LOCK MONITORING
-- ============================================================================

-- Active connections by database
SELECT
  datname,
  COUNT(*) AS connections,
  COUNT(*) FILTER (WHERE state = 'active') AS active,
  COUNT(*) FILTER (WHERE state = 'idle') AS idle,
  COUNT(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_txn
FROM pg_stat_activity
GROUP BY datname
ORDER BY connections DESC;

-- Long-running queries (> 1 minute)
SELECT
  pid,
  usename,
  datname,
  state,
  query_start,
  NOW() - query_start AS duration,
  LEFT(query, 100) AS query_preview
FROM pg_stat_activity
WHERE state != 'idle'
  AND (NOW() - query_start) > INTERVAL '1 minute'
ORDER BY duration DESC;

-- Blocking queries
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_query,
  blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
  ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- ============================================================================
-- 6. OPTIMIZATION ACTIONS
-- ============================================================================

-- VACUUM tables with high dead tuple ratio
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
      AND n_dead_tup > 1000
      AND (n_dead_tup::numeric / NULLIF(n_live_tup, 0)) > 0.1
  LOOP
    EXECUTE format('VACUUM ANALYZE %I.%I', r.schemaname, r.tablename);
    RAISE NOTICE 'Vacuumed table: %.%', r.schemaname, r.tablename;
  END LOOP;
END $$;

-- REINDEX tables with bloat
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, indexname
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
      AND idx_scan > 1000
      AND pg_relation_size(indexrelid) > 10485760 -- > 10MB
  LOOP
    EXECUTE format('REINDEX INDEX CONCURRENTLY %I.%I', r.schemaname, r.indexname);
    RAISE NOTICE 'Reindexed: %.%', r.schemaname, r.indexname;
  END LOOP;
END $$;

-- Update table statistics
ANALYZE;

-- ============================================================================
-- 7. CREATE MISSING INDEXES (Based on slow queries)
-- ============================================================================

-- Add index for note search queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_search_vector
  ON notes USING gin(to_tsvector('english', title || ' ' || content));

-- Add composite index for user notes with status filter
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_user_status_created
  ON notes(user_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

-- Add index for organization notes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_org_created
  ON notes(organization_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Add partial index for active annotations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_annotations_note_active
  ON annotations(note_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Add index for user activity queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_user_created
  ON activities(user_id, created_at DESC);

-- Add index for tag searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_note_tags_tag
  ON note_tags(tag_id);

-- ============================================================================
-- 8. MONITORING FUNCTIONS
-- ============================================================================

-- Function: Get table statistics
CREATE OR REPLACE FUNCTION get_table_stats(table_name text)
RETURNS TABLE (
  metric text,
  value numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'total_size_mb'::text, pg_total_relation_size(table_name::regclass)::numeric / 1024 / 1024
  UNION ALL
  SELECT 'table_size_mb', pg_table_size(table_name::regclass)::numeric / 1024 / 1024
  UNION ALL
  SELECT 'index_size_mb', pg_indexes_size(table_name::regclass)::numeric / 1024 / 1024
  UNION ALL
  SELECT 'row_count', (SELECT reltuples FROM pg_class WHERE relname = table_name)
  UNION ALL
  SELECT 'dead_rows', n_dead_tup FROM pg_stat_user_tables WHERE tablename = table_name
  UNION ALL
  SELECT 'live_rows', n_live_tup FROM pg_stat_user_tables WHERE tablename = table_name;
END;
$$ LANGUAGE plpgsql;

-- Function: Get slow queries in last hour
CREATE OR REPLACE FUNCTION get_slow_queries(time_window interval DEFAULT '1 hour')
RETURNS TABLE (
  query text,
  avg_time_ms numeric,
  calls bigint,
  total_time_ms numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pss.query,
    ROUND((pss.total_exec_time / pss.calls)::numeric, 2) AS avg_time_ms,
    pss.calls,
    ROUND(pss.total_exec_time::numeric, 2) AS total_time_ms
  FROM pg_stat_statements pss
  WHERE pss.query NOT LIKE '%pg_stat_statements%'
    AND (pss.total_exec_time / pss.calls) > 100 -- Slower than 100ms
  ORDER BY avg_time_ms DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function: Estimate index bloat
CREATE OR REPLACE FUNCTION estimate_index_bloat()
RETURNS TABLE (
  schema_name text,
  table_name text,
  index_name text,
  bloat_ratio numeric,
  index_size_mb numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname::text,
    tablename::text,
    indexname::text,
    ROUND((pg_relation_size(indexrelid)::numeric / NULLIF(pg_total_relation_size(relid), 0)) * 100, 2) AS bloat_ratio,
    ROUND(pg_relation_size(indexrelid)::numeric / 1024 / 1024, 2) AS index_size_mb
  FROM pg_stat_user_indexes
  JOIN pg_class ON pg_class.oid = indexrelid
  WHERE schemaname = 'public'
    AND pg_relation_size(indexrelid) > 1048576 -- > 1MB
  ORDER BY bloat_ratio DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. PERFORMANCE TUNING RECOMMENDATIONS
-- ============================================================================

-- PostgreSQL configuration recommendations
COMMENT ON DATABASE postgres IS '
Performance Tuning Recommendations:

1. Memory Settings (for 4GB RAM system):
   shared_buffers = 1GB
   effective_cache_size = 3GB
   maintenance_work_mem = 256MB
   work_mem = 16MB

2. Checkpoint Settings:
   checkpoint_completion_target = 0.9
   wal_buffers = 16MB
   max_wal_size = 2GB

3. Query Planner:
   random_page_cost = 1.1 (for SSD)
   effective_io_concurrency = 200

4. Autovacuum:
   autovacuum_max_workers = 4
   autovacuum_naptime = 10s

5. Connection Pooling:
   Use PgBouncer with pool_mode = transaction
   max_client_conn = 1000
   default_pool_size = 25
';

-- ============================================================================
-- 10. RESET STATISTICS (Use with caution)
-- ============================================================================

-- Reset query statistics
-- SELECT pg_stat_statements_reset();

-- Reset table statistics
-- SELECT pg_stat_reset();

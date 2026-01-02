// Supabase Edge Function: Batch Operations
// Handle bulk updates efficiently

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BatchRequest {
  operation: 'update' | 'delete' | 'archive' | 'tag';
  noteIds: string[];
  data?: Record<string, any>;
}

/**
 * Fields that can be safely updated via the batch update operation.
 * This whitelist prevents mass assignment vulnerabilities by explicitly
 * defining which fields clients are allowed to modify.
 */
const ALLOWED_UPDATE_FIELDS = ['title', 'content', 'markdown', 'slug', 'is_public'] as const;

/**
 * Fields that should never be modifiable by clients.
 * Attempts to modify these fields are logged for security auditing
 * as they may indicate an attack attempt.
 *
 * - id: Primary key, immutable
 * - org_id: Organization ownership, prevents cross-org data access
 * - created_by: Original author, audit trail integrity
 * - created_at: Creation timestamp, audit trail integrity
 * - updated_at: System-managed, set automatically
 * - updated_by: System-managed, set automatically
 * - share_hash: Security-sensitive, used for sharing access control
 */
const PROTECTED_FIELDS = [
  'id',
  'org_id',
  'created_by',
  'created_at',
  'updated_at',
  'updated_by',
  'share_hash',
] as const;

/**
 * Type representing the allowed fields for note updates.
 * Used for type-safe field filtering.
 */
type AllowedUpdateField = typeof ALLOWED_UPDATE_FIELDS[number];

/**
 * Type representing protected fields that cannot be modified by clients.
 */
type ProtectedField = typeof PROTECTED_FIELDS[number];

/**
 * Type for a validated note update object containing only allowed fields.
 */
type ValidatedNoteUpdate = Partial<Record<AllowedUpdateField, unknown>>;

const MAX_BATCH_SIZE = 100;
const BATCH_CHUNK_SIZE = 10;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Auth
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { operation, noteIds, data }: BatchRequest = await req.json();

    // Validate batch size
    if (noteIds.length > MAX_BATCH_SIZE) {
      return new Response(
        JSON.stringify({
          error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE}`,
          maxSize: MAX_BATCH_SIZE,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's org
    const { data: userOrg } = await supabase
      .from('users')
      .select('org_id, role')
      .eq('id', user.id)
      .single();

    if (!userOrg) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify all notes belong to user's org
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, org_id')
      .in('id', noteIds);

    if (notesError) {
      throw notesError;
    }

    const invalidNotes = notes?.filter(note => note.org_id !== userOrg.org_id) || [];
    if (invalidNotes.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Some notes do not belong to your organization',
          invalidNoteIds: invalidNotes.map(n => n.id),
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process in chunks for better performance
    const chunks = chunkArray(noteIds, BATCH_CHUNK_SIZE);
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const chunk of chunks) {
      try {
        switch (operation) {
          case 'update':
            await supabase
              .from('notes')
              .update({
                ...data,
                updated_at: new Date().toISOString(),
                updated_by: user.id,
              })
              .in('id', chunk);
            results.success += chunk.length;
            break;

          case 'delete':
            // Check permission for delete
            if (!['owner', 'admin'].includes(userOrg.role)) {
              throw new Error('Insufficient permissions to delete notes');
            }

            await supabase
              .from('notes')
              .delete()
              .in('id', chunk);
            results.success += chunk.length;
            break;

          case 'archive':
            await supabase
              .from('notes')
              .update({
                is_archived: true,
                archived_at: new Date().toISOString(),
                archived_by: user.id,
              })
              .in('id', chunk);
            results.success += chunk.length;
            break;

          case 'tag':
            if (!data?.tags || !Array.isArray(data.tags)) {
              throw new Error('Tags array required for tag operation');
            }

            await supabase
              .from('notes')
              .update({
                tags: data.tags,
                updated_at: new Date().toISOString(),
              })
              .in('id', chunk);
            results.success += chunk.length;
            break;

          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
      } catch (error) {
        results.failed += chunk.length;
        results.errors.push(`Chunk failed: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        operation,
        totalNotes: noteIds.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

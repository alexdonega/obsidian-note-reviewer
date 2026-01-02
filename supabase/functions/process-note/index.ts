// Supabase Edge Function: Process Note
// Heavy CPU operations offloaded to edge

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, createRateLimitResponse } from '../_shared/rate-limiter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessRequest {
  noteId: string;
  operations: ('sanitize' | 'markdown' | 'extract-links' | 'generate-summary')[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check (20 requests per minute for process operations)
    const rateLimitResult = await checkRateLimit(user.id, 'process');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const { noteId, operations }: ProcessRequest = await req.json();

    // Fetch note
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single();

    if (fetchError || !note) {
      return new Response(
        JSON.stringify({ error: 'Note not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has access to this note
    const { data: userOrg } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!userOrg || userOrg.org_id !== note.org_id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processedContent = note.content;
    const metadata: Record<string, any> = {};

    // Execute operations
    for (const operation of operations) {
      switch (operation) {
        case 'sanitize':
          processedContent = sanitizeHTML(processedContent);
          break;

        case 'markdown':
          processedContent = markdownToHTML(processedContent);
          break;

        case 'extract-links':
          metadata.links = extractLinks(processedContent);
          break;

        case 'generate-summary':
          metadata.summary = generateSummary(processedContent);
          break;
      }
    }

    // Update note
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        content: processedContent,
        metadata: { ...note.metadata, ...metadata },
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        noteId,
        operations,
        metadata,
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

// Helper functions
function sanitizeHTML(html: string): string {
  // Remove dangerous tags and attributes
  const dangerous = /<script|<iframe|<object|<embed|javascript:|on\w+=/gi;
  return html.replace(dangerous, '');
}

function markdownToHTML(markdown: string): string {
  // Simple markdown to HTML conversion
  let html = markdown;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;

  return html;
}

function extractLinks(content: string): string[] {
  const linkRegex = /https?:\/\/[^\s<>"]+/g;
  return Array.from(new Set(content.match(linkRegex) || []));
}

function generateSummary(content: string, maxLength: number = 200): string {
  // Simple extractive summary - first N characters
  const text = content.replace(/<[^>]*>/g, '').trim();
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength).trim() + '...';
}

import { supabase, type Note } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type NoteInsert = Database['public']['Tables']['notes']['Insert'];
type NoteUpdate = Database['public']['Tables']['notes']['Update'];

export class NotesService {
  /**
   * Create a new note
   */
  async create(note: NoteInsert): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .single();

    if (error) throw new Error(`Failed to create note: ${error.message}`);
    return data;
  }

  /**
   * Get note by slug
   */
  async getBySlug(orgId: string, slug: string): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('org_id', orgId)
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found
      throw new Error(`Failed to get note: ${error.message}`);
    }
    return data;
  }

  /**
   * Get note by share hash (public access)
   */
  async getByShareHash(hash: string): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('share_hash', hash)
      .eq('is_public', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get shared note: ${error.message}`);
    }
    return data;
  }

  /**
   * Get all notes for an organization
   */
  async listByOrg(orgId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('org_id', orgId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to list notes: ${error.message}`);
    return data || [];
  }

  /**
   * Update a note
   */
  async update(id: string, updates: NoteUpdate): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update note: ${error.message}`);
    return data;
  }

  /**
   * Delete a note
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete note: ${error.message}`);
  }

  /**
   * Subscribe to real-time changes on a note
   */
  subscribeToNote(noteId: string, callback: (note: Note) => void) {
    return supabase
      .channel(`note:${noteId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${noteId}`
        },
        (payload) => callback(payload.new as Note)
      )
      .subscribe();
  }

  /**
   * Generate a unique share hash for public sharing
   */
  async generateShareHash(noteId: string): Promise<string> {
    const hash = Math.random().toString(36).substring(2, 15);

    await this.update(noteId, {
      is_public: true,
      share_hash: hash
    });

    return hash;
  }

  /**
   * Revoke public sharing
   */
  async revokeShare(noteId: string): Promise<void> {
    await this.update(noteId, {
      is_public: false,
      share_hash: null
    });
  }
}

export const notesService = new NotesService();

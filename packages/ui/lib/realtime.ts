import { supabase } from './supabase';
import { log } from './logger';
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

// Realtime event types
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export interface PresenceUser {
  userId: string;
  email: string;
  name?: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  lastActive: number;
}

// Real-time manager
class RealtimeManager {
  private channels = new Map<string, RealtimeChannel>();
  private presenceCallbacks = new Map<string, Set<(users: PresenceUser[]) => void>>();

  // Subscribe to table changes
  subscribeToTable<T>(
    table: string,
    callback: (event: RealtimeEvent, payload: T) => void,
    filter?: { column: string; value: any }
  ): RealtimeSubscription {
    const channelName = filter
      ? `${table}:${filter.column}=eq.${filter.value}`
      : table;

    // Reuse existing channel if available
    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);

      // Subscribe to changes
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
          },
          (payload) => {
            const event = payload.eventType as RealtimeEvent;
            const data = payload.new as T || payload.old as T;

            log.debug('Realtime event', { table, event, data });
            callback(event, data);
          }
        )
        .subscribe((status) => {
          log.info('Realtime subscription status', { channel: channelName, status });
        });
    }

    return {
      channel,
      unsubscribe: () => this.unsubscribe(channelName),
    };
  }

  // Subscribe to specific note changes
  subscribeToNote<T>(
    noteId: string,
    callback: (event: RealtimeEvent, payload: T) => void
  ): RealtimeSubscription {
    return this.subscribeToTable('notes', callback, { column: 'id', value: noteId });
  }

  // Subscribe to organization's notes
  subscribeToOrgNotes<T>(
    orgId: string,
    callback: (event: RealtimeEvent, payload: T) => void
  ): RealtimeSubscription {
    return this.subscribeToTable('notes', callback, { column: 'org_id', value: orgId });
  }

  // Subscribe to note annotations
  subscribeToAnnotations<T>(
    noteId: string,
    callback: (event: RealtimeEvent, payload: T) => void
  ): RealtimeSubscription {
    return this.subscribeToTable('annotations', callback, { column: 'note_id', value: noteId });
  }

  // Presence tracking
  async trackPresence(
    channelName: string,
    user: PresenceUser,
    onPresenceChange?: (users: PresenceUser[]) => void
  ): Promise<RealtimeSubscription> {
    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: user.userId,
          },
        },
      });
      this.channels.set(channelName, channel);
    }

    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel!.presenceState<PresenceUser>();
        const users = this.extractPresenceUsers(state);

        log.debug('Presence synced', { channel: channelName, count: users.length });

        // Notify callbacks
        const callbacks = this.presenceCallbacks.get(channelName);
        if (callbacks) {
          callbacks.forEach(cb => cb(users));
        }

        onPresenceChange?.(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        log.debug('User joined', { channel: channelName, userId: key, count: newPresences.length });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        log.debug('User left', { channel: channelName, userId: key, count: leftPresences.length });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          await channel!.track({
            ...user,
            lastActive: Date.now(),
          });

          log.info('Presence tracking started', { channel: channelName, userId: user.userId });
        }
      });

    // Store callback
    if (onPresenceChange) {
      if (!this.presenceCallbacks.has(channelName)) {
        this.presenceCallbacks.set(channelName, new Set());
      }
      this.presenceCallbacks.get(channelName)!.add(onPresenceChange);
    }

    return {
      channel,
      unsubscribe: () => {
        this.unsubscribe(channelName);
        if (onPresenceChange) {
          this.presenceCallbacks.get(channelName)?.delete(onPresenceChange);
        }
      },
    };
  }

  // Update presence state (cursor, selection, etc.)
  async updatePresence(channelName: string, updates: Partial<PresenceUser>): Promise<void> {
    const channel = this.channels.get(channelName);
    if (!channel) {
      log.warn('Channel not found for presence update', { channelName });
      return;
    }

    await channel.track({
      ...updates,
      lastActive: Date.now(),
    });
  }

  // Broadcast custom event
  async broadcast(
    channelName: string,
    event: string,
    payload: any
  ): Promise<void> {
    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);
      await channel.subscribe();
    }

    await channel.send({
      type: 'broadcast',
      event,
      payload,
    });

    log.debug('Broadcast sent', { channel: channelName, event, payload });
  }

  // Listen to broadcasts
  onBroadcast(
    channelName: string,
    event: string,
    callback: (payload: any) => void
  ): RealtimeSubscription {
    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);

      channel
        .on('broadcast', { event }, ({ payload }) => {
          log.debug('Broadcast received', { channel: channelName, event, payload });
          callback(payload);
        })
        .subscribe();
    }

    return {
      channel,
      unsubscribe: () => this.unsubscribe(channelName),
    };
  }

  // Unsubscribe from channel
  private async unsubscribe(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.unsubscribe();
      this.channels.delete(channelName);
      this.presenceCallbacks.delete(channelName);
      log.info('Unsubscribed from channel', { channelName });
    }
  }

  // Unsubscribe from all channels
  async unsubscribeAll(): Promise<void> {
    const unsubscribePromises = Array.from(this.channels.keys()).map(
      channelName => this.unsubscribe(channelName)
    );
    await Promise.all(unsubscribePromises);
    log.info('Unsubscribed from all channels');
  }

  // Get current presence users
  getPresenceUsers(channelName: string): PresenceUser[] {
    const channel = this.channels.get(channelName);
    if (!channel) return [];

    const state = channel.presenceState<PresenceUser>();
    return this.extractPresenceUsers(state);
  }

  // Extract users from presence state
  private extractPresenceUsers(state: RealtimePresenceState<PresenceUser>): PresenceUser[] {
    const users: PresenceUser[] = [];

    Object.entries(state).forEach(([userId, presences]) => {
      if (presences.length > 0) {
        // Get most recent presence for this user
        const presence = presences[presences.length - 1] as PresenceUser;
        users.push(presence);
      }
    });

    return users;
  }

  // Connection status
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    // Check if any channel is subscribed
    for (const channel of this.channels.values()) {
      const state = channel.state;
      if (state === 'joined') return 'connected';
      if (state === 'joining') return 'connecting';
    }
    return 'disconnected';
  }

  // Get active channels
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

// Export singleton
export const realtime = new RealtimeManager();

// React hooks for real-time features
export function useRealtimeNote<T>(noteId: string, onUpdate: (note: T) => void) {
  return realtime.subscribeToNote(noteId, (event, payload) => {
    if (event === 'UPDATE') {
      onUpdate(payload);
    }
  });
}

export function useRealtimePresence(
  channelName: string,
  user: PresenceUser,
  onPresenceChange: (users: PresenceUser[]) => void
) {
  return realtime.trackPresence(channelName, user, onPresenceChange);
}

export function useRealtimeBroadcast(
  channelName: string,
  event: string,
  onMessage: (payload: any) => void
) {
  return realtime.onBroadcast(channelName, event, onMessage);
}

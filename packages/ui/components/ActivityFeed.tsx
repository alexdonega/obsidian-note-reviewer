import React, { useState, useEffect } from 'react';
import { realtime } from '../lib/realtime';
import { supabase } from '../lib/supabase';
import { log } from '../lib/logger';

export type ActivityType =
  | 'note:created'
  | 'note:updated'
  | 'note:deleted'
  | 'note:shared'
  | 'annotation:created'
  | 'annotation:updated'
  | 'annotation:deleted'
  | 'user:joined'
  | 'user:left'
  | 'comment:created';

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetId?: string;
  targetTitle?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

interface ActivityFeedProps {
  orgId: string;
  noteId?: string;
  limit?: number;
  realtime?: boolean;
}

export function ActivityFeed({ orgId, noteId, limit = 50, realtime: enableRealtime = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();

    if (enableRealtime) {
      setupRealtimeSubscription();
    }

    return () => {
      // Cleanup subscriptions
    };
  }, [orgId, noteId, enableRealtime]);

  async function loadActivities() {
    try {
      setLoading(true);

      let query = supabase
        .from('activities')
        .select('*')
        .eq('org_id', orgId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (noteId) {
        query = query.eq('target_id', noteId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      log.error('Failed to load activities', error);
    } finally {
      setLoading(false);
    }
  }

  function setupRealtimeSubscription() {
    const channelName = noteId ? `activities:note:${noteId}` : `activities:org:${orgId}`;

    realtime.onBroadcast(channelName, 'activity', (payload: Activity) => {
      setActivities(prev => [payload, ...prev].slice(0, limit));
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const icon = getActivityIcon(activity.type);
  const message = getActivityMessage(activity);
  const timeAgo = getTimeAgo(activity.timestamp);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
      {/* User avatar */}
      <div className="flex-shrink-0">
        {activity.userAvatar ? (
          <img
            src={activity.userAvatar}
            alt={activity.userName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {activity.userName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Activity content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <p className="text-sm">
              <span className="font-medium">{activity.userName}</span>
              {' '}
              {message}
            </p>
          </div>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {timeAgo}
          </time>
        </div>

        {/* Target preview */}
        {activity.targetTitle && (
          <p className="mt-1 text-sm text-muted-foreground truncate">
            {activity.targetTitle}
          </p>
        )}

        {/* Metadata preview */}
        {activity.metadata?.preview && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {activity.metadata.preview}
          </p>
        )}
      </div>
    </div>
  );
}

function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    'note:created': '📝',
    'note:updated': '✏️',
    'note:deleted': '🗑️',
    'note:shared': '🔗',
    'annotation:created': '💬',
    'annotation:updated': '✏️',
    'annotation:deleted': '🗑️',
    'user:joined': '👋',
    'user:left': '👋',
    'comment:created': '💭',
  };

  return icons[type] || '📌';
}

function getActivityMessage(activity: Activity): string {
  const messages: Record<ActivityType, string> = {
    'note:created': 'created a note',
    'note:updated': 'updated a note',
    'note:deleted': 'deleted a note',
    'note:shared': 'shared a note',
    'annotation:created': 'added an annotation',
    'annotation:updated': 'updated an annotation',
    'annotation:deleted': 'removed an annotation',
    'user:joined': 'joined the workspace',
    'user:left': 'left the workspace',
    'comment:created': 'commented',
  };

  return messages[activity.type] || 'performed an action';
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

// Activity logger service
export class ActivityLogger {
  static async log(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<void> {
    try {
      const fullActivity: Activity = {
        ...activity,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      // Save to database
      await supabase.from('activities').insert(fullActivity);

      // Broadcast real-time
      const channelName = activity.targetId
        ? `activities:note:${activity.targetId}`
        : `activities:org:${(activity as any).orgId}`;

      await realtime.broadcast(channelName, 'activity', fullActivity);

      log.debug('Activity logged', { type: activity.type });
    } catch (error) {
      log.error('Failed to log activity', error);
    }
  }

  static async logNoteCreated(userId: string, userName: string, noteId: string, noteTitle: string, orgId: string): Promise<void> {
    await this.log({
      type: 'note:created',
      userId,
      userName,
      targetId: noteId,
      targetTitle: noteTitle,
      metadata: { orgId },
    });
  }

  static async logNoteUpdated(userId: string, userName: string, noteId: string, noteTitle: string, preview: string): Promise<void> {
    await this.log({
      type: 'note:updated',
      userId,
      userName,
      targetId: noteId,
      targetTitle: noteTitle,
      metadata: { preview },
    });
  }

  static async logAnnotationCreated(userId: string, userName: string, noteId: string, noteTitle: string, text: string): Promise<void> {
    await this.log({
      type: 'annotation:created',
      userId,
      userName,
      targetId: noteId,
      targetTitle: noteTitle,
      metadata: { preview: text },
    });
  }
}

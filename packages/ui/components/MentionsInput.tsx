/**
 * MentionsInput Component
 *
 * Textarea with @mention autocomplete for tagging users in comments.
 * Uses react-mentions library with Supabase user search.
 */

import React, { useState, useCallback } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export interface MentionData {
  id: string;
  display: string;
  avatar?: string;
}

interface MentionsInputProps {
  value: string;
  onChange: (value: string, mentions: MentionData[]) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
}

interface SupabaseUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

const DEFAULT_MENTION_STYLE = {
  backgroundColor: '#dbeafe',
  padding: '2px 4px',
  borderRadius: '4px',
  fontWeight: 500,
  color: '#1e40af',
};

const DEFAULT_INPUT_STYLE = {
  control: {
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: 'normal',
  },
  input: {
    backgroundColor: 'transparent',
    color: 'inherit',
    padding: '4px 0',
  },
  highlighter: {
    backgroundColor: 'transparent',
    color: 'inherit',
    padding: '4px 0',
  },
  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginTop: '4px',
      maxHeight: '200px',
      overflowY: 'auto',
    },
    item: {
      padding: '8px 12px',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    itemFocused: {
      backgroundColor: '#f3f4f6',
    },
  },
};

/**
 * Transform mention data for storage
 * Converts @__id__ markup format to array of mentioned user IDs
 */
export const parseMentions = (content: string): string[] => {
  const mentionRegex = /@__([^_]+)__/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

/**
 * Transform mention data for display
 * Converts @__id__ markup to @display_name format
 */
export const displayTransform = (
  id: string,
  display: string | undefined
): string => {
  return `@__${id}__`;
};

export const MentionsInputComponent: React.FC<MentionsInputProps> = ({
  value,
  onChange,
  placeholder = 'Type @ to mention someone...',
  className = '',
  rows = 4,
  disabled = false,
}) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<MentionData[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Search users from Supabase based on query
   */
  const searchUsers = useCallback(async (query: string, callback: (users: MentionData[]) => void) => {
    if (!user) {
      callback([]);
      return;
    }

    setLoading(true);

    try {
      // Search for users by email or name
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, avatar_url')
        .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      const mentionData: MentionData[] = (data as SupabaseUser[]).map((u) => ({
        id: u.id,
        display: u.name || u.email,
        avatar: u.avatar_url || undefined,
      }));

      setUsers(mentionData);
      callback(mentionData);
    } catch (err) {
      console.error('Failed to search users:', err);
      callback([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Handle input changes and extract mentions
   */
  const handleChange = useCallback(
    (event: any, newValue: string, newPlainTextValue: string, newMentions: any[]) => {
      const mentions: MentionData[] = newMentions.map((m: any) => ({
        id: m.id,
        display: m.display,
        avatar: m.avatar,
      }));

      onChange(newValue, mentions);
    },
    [onChange]
  );

  /**
   * Render individual suggestion with avatar and display name
   */
  const renderSuggestion = useCallback(
    (
      suggestion: MentionData,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focused: boolean
    ) => (
      <div
        className={`flex items-center gap-2 px-3 py-2 ${
          focused ? 'bg-muted' : ''
        }`}
      >
        {suggestion.avatar ? (
          <img
            src={suggestion.avatar}
            alt={suggestion.display}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {suggestion.display.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-sm">{highlightedDisplay}</span>
      </div>
    ),
    []
  );

  /**
   * Display transform for rendering mentions in input
   */
  const handleDisplayTransform = useCallback(
    (id: string, display: string | undefined) => {
      return display || id;
    },
    []
  );

  return (
    <div className={`mentions-input ${className}`}>
      <MentionsInput
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        style={DEFAULT_INPUT_STYLE}
        classNames={`mentions-input-field`}
        allowSpaceInQuery
        a11ySuggestionsListLabel="Suggested users"
      >
        <Mention
          trigger="@"
          data={searchUsers}
          renderSuggestion={renderSuggestion}
          displayTransform={displayTransform}
          markup="@__{{id}}__"
          className="mention-highlight"
          style={DEFAULT_MENTION_STYLE}
          appendSpaceOnAdd
        />
      </MentionsInput>
      {loading && (
        <div className="text-xs text-muted-foreground mt-1">
          Searching users...
        </div>
      )}
    </div>
  );
};

export default MentionsInputComponent;

import React, { useState, useEffect, useRef } from 'react';
import { realtime, type PresenceUser } from '../lib/realtime';
import { log } from '../lib/logger';

interface LiveCursorsProps {
  noteId: string;
  currentUser: {
    userId: string;
    name: string;
    email: string;
    avatar?: string;
  };
  containerRef: React.RefObject<HTMLElement>;
}

interface CursorPosition {
  x: number;
  y: number;
  user: PresenceUser;
}

export function LiveCursors({ noteId, currentUser, containerRef }: LiveCursorsProps) {
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const channelName = `note:${noteId}`;

  useEffect(() => {
    let presenceSubscription: any;
    let typingStartSub: any;
    let typingStopSub: any;

    const setupRealtime = async () => {
      // Track presence with cursor position
      presenceSubscription = await realtime.trackPresence(
        channelName,
        {
          userId: currentUser.userId,
          email: currentUser.email,
          name: currentUser.name,
          avatar: currentUser.avatar,
          lastActive: Date.now(),
        },
        (users) => {
          // Update cursors for all users except current
          const newCursors = new Map<string, CursorPosition>();

          users.forEach(user => {
            if (user.userId !== currentUser.userId && user.cursor) {
              newCursors.set(user.userId, {
                x: user.cursor.x,
                y: user.cursor.y,
                user,
              });
            }
          });

          setCursors(newCursors);
        }
      );

      // Listen for typing indicators
      typingStartSub = realtime.onBroadcast(
        channelName,
        'typing:start',
        (payload: { userId: string }) => {
          if (payload.userId !== currentUser.userId) {
            setTypingUsers(prev => new Set(prev).add(payload.userId));
          }
        }
      );

      typingStopSub = realtime.onBroadcast(
        channelName,
        'typing:stop',
        (payload: { userId: string }) => {
          setTypingUsers(prev => {
            const next = new Set(prev);
            next.delete(payload.userId);
            return next;
          });
        }
      );
    };

    setupRealtime();

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update presence with cursor position
      realtime.updatePresence(channelName, {
        cursor: { x, y },
        lastActive: Date.now(),
      });
    };

    // Track selection
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      realtime.updatePresence(channelName, {
        selection: {
          start: range.startOffset,
          end: range.endOffset,
        },
        lastActive: Date.now(),
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('selectionchange', handleSelectionChange);
    }

    return () => {
      presenceSubscription?.unsubscribe();
      typingStartSub?.unsubscribe();
      typingStopSub?.unsubscribe();

      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('selectionchange', handleSelectionChange);
      }
    };
  }, [noteId, currentUser, containerRef, channelName]);

  return (
    <>
      {/* Render cursors */}
      {Array.from(cursors.values()).map(({ x, y, user }) => (
        <Cursor
          key={user.userId}
          x={x}
          y={y}
          user={user}
          isTyping={typingUsers.has(user.userId)}
        />
      ))}

      {/* Typing indicator banner */}
      {typingUsers.size > 0 && (
        <TypingIndicatorBanner
          users={Array.from(cursors.values())
            .filter(c => typingUsers.has(c.user.userId))
            .map(c => c.user)}
        />
      )}
    </>
  );
}

interface CursorProps {
  x: number;
  y: number;
  user: PresenceUser;
  isTyping: boolean;
}

function Cursor({ x, y, user, isTyping }: CursorProps) {
  const cursorColor = getUserColor(user.userId);

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-100"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-2px, -2px)',
      }}
    >
      {/* Cursor icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673L13.5644 5.37513C14.3913 4.62138 15.6943 5.09556 15.9314 6.17411L18.0448 15.6362C18.2595 16.6161 17.2657 17.4033 16.3685 16.9506L12.9068 15.0877C12.4815 14.8665 11.9647 14.8996 11.5689 15.1735L8.00376 17.5566C7.17523 18.1162 6.05166 17.5261 5.99253 16.537L5.65376 12.3673Z"
          fill={cursorColor}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* User label */}
      <div
        className="absolute top-6 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap shadow-lg"
        style={{ backgroundColor: cursorColor }}
      >
        <div className="flex items-center gap-1">
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.name || user.email}
              className="w-4 h-4 rounded-full"
            />
          )}
          <span>{user.name || user.email}</span>
          {isTyping && (
            <span className="inline-flex gap-0.5 ml-1">
              <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicatorBanner({ users }: { users: PresenceUser[] }) {
  const names = users.map(u => u.name || u.email).join(', ');

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg text-sm">
      <span className="font-medium">{names}</span>
      {' '}
      {users.length === 1 ? 'is' : 'are'} typing...
    </div>
  );
}

// Generate consistent color for user
function getUserColor(userId: string): string {
  const colors = [
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // emerald
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
  ];

  // Hash user ID to get consistent color
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

// Selection highlight component
interface LiveSelectionsProps {
  noteId: string;
  currentUser: { userId: string };
  editorRef: React.RefObject<HTMLElement>;
}

export function LiveSelections({ noteId, currentUser, editorRef }: LiveSelectionsProps) {
  const [selections, setSelections] = useState<Map<string, { start: number; end: number; user: PresenceUser }>>(new Map());
  const channelName = `note:${noteId}`;

  useEffect(() => {
    let subscription: any;

    const setupPresence = async () => {
      subscription = await realtime.trackPresence(
        channelName,
        {
          userId: currentUser.userId,
          email: '',
          lastActive: Date.now(),
        },
        (users) => {
          const newSelections = new Map();

          users.forEach(user => {
            if (user.userId !== currentUser.userId && user.selection) {
              newSelections.set(user.userId, {
                start: user.selection.start,
                end: user.selection.end,
                user,
              });
            }
          });

          setSelections(newSelections);
        }
      );
    };

    setupPresence();

    return () => {
      subscription?.unsubscribe();
    };
  }, [noteId, currentUser, channelName]);

  return (
    <>
      {Array.from(selections.values()).map(({ start, end, user }) => (
        <SelectionHighlight
          key={user.userId}
          start={start}
          end={end}
          user={user}
          editorRef={editorRef}
        />
      ))}
    </>
  );
}

function SelectionHighlight({
  start,
  end,
  user,
  editorRef,
}: {
  start: number;
  end: number;
  user: PresenceUser;
  editorRef: React.RefObject<HTMLElement>;
}) {
  const color = getUserColor(user.userId);

  // Calculate position based on text offsets
  // This is simplified - in production you'd use Range API
  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        backgroundColor: `${color}20`,
        borderLeft: `2px solid ${color}`,
      }}
    />
  );
}

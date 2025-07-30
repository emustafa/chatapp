import React from 'react';
import { ChatThread } from '../types';
import { layoutStyles } from '../styles/layout';
import { theme } from '../styles/theme';

interface ChatThreadListProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
  isLoading: boolean;
  error: string | null;
}

const ChatThreadList: React.FC<ChatThreadListProps> = ({
  threads,
  activeThreadId,
  onThreadSelect,
  onNewThread,
  isLoading,
  error
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div style={layoutStyles.sidebar}>
      {/* Header */}
      <div style={{
        padding: theme.spacing.lg,
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background
      }}>
        <button
          onClick={onNewThread}
          style={{
            ...layoutStyles.button,
            width: '100%',
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.sm
          }}
        >
          <span>+</span> New Chat
        </button>
      </div>

      {/* Thread List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: theme.spacing.sm
      }}>
        {error ? (
          <div style={{
            textAlign: 'center',
            padding: theme.spacing.lg,
            color: theme.colors.danger,
            backgroundColor: '#fff3cd',
            border: `1px solid ${theme.colors.warning}`,
            borderRadius: theme.borderRadius.sm,
            margin: theme.spacing.sm
          }}>
            {error}
          </div>
        ) : isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: theme.spacing.lg,
            color: theme.colors.textSecondary
          }}>
            Loading chats...
          </div>
        ) : threads.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: `${theme.spacing.xxl} ${theme.spacing.lg}`,
            color: theme.colors.textSecondary
          }}>
            <p>No chats yet</p>
            <p style={{ 
              fontSize: theme.typography.fontSize.xs, 
              marginTop: theme.spacing.sm 
            }}>
              Start a new conversation!
            </p>
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.threadId}
              onClick={() => onThreadSelect(thread.threadId)}
              style={{
                padding: theme.spacing.sm,
                marginBottom: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: activeThreadId === thread.threadId ? theme.colors.primary + '20' : theme.colors.background,
                border: `1px solid ${activeThreadId === thread.threadId ? theme.colors.primary : theme.colors.border}`,
                cursor: 'pointer',
                transition: theme.transitions.fast
              }}
              onMouseEnter={(e) => {
                if (activeThreadId !== thread.threadId) {
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeThreadId !== thread.threadId) {
                  e.currentTarget.style.backgroundColor = theme.colors.background;
                }
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: theme.spacing.xs
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.textPrimary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  marginRight: theme.spacing.sm
                }}>
                  {thread.title}
                </h4>
                <span style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.textSecondary,
                  flexShrink: 0
                }}>
                  {formatDate(thread.updatedAt)}
                </span>
              </div>
              
              {thread.lastMessage && (
                <p style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.textSecondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: theme.typography.lineHeight.tight
                }}>
                  {thread.lastMessage}
                </p>
              )}
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: theme.spacing.xs
              }}>
                <span style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.textMuted
                }}>
                  {thread.messageCount} messages
                </span>
                {thread.status !== 'active' && (
                  <span style={{
                    fontSize: '10px',
                    color: theme.colors.textMuted,
                    backgroundColor: theme.colors.backgroundSecondary,
                    padding: `2px ${theme.spacing.xs}`,
                    borderRadius: theme.borderRadius.lg
                  }}>
                    {thread.status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatThreadList;
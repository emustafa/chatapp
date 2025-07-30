import { CSSProperties } from 'react';
import { theme } from './theme';

export const layoutStyles = {
  // Main app container
  appContainer: {
    backgroundColor: theme.colors.background,
    minHeight: '100vh',
    color: theme.colors.textPrimary,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    fontFamily: theme.typography.fontFamily.primary,
  } satisfies CSSProperties,

  // Header
  header: {
    textAlign: 'center' as const,
    padding: `${theme.spacing.lg} 0`,
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottom: `1px solid ${theme.colors.border}`,
    width: '100%',
  } satisfies CSSProperties,

  headerTitle: {
    color: theme.colors.textPrimary,
    margin: 0,
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.semibold,
  } satisfies CSSProperties,

  // Auth section
  authContainer: {
    textAlign: 'center' as const,
    padding: '50px',
    color: theme.colors.textPrimary,
  } satisfies CSSProperties,

  authTitle: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  } satisfies CSSProperties,

  // Main content area
  mainContent: {
    display: 'flex',
    height: 'calc(100vh - 80px)',
    width: '100%',
    maxWidth: '1200px',
  } satisfies CSSProperties,

  // Sidebar
  sidebar: {
    width: '300px',
    borderRight: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.backgroundSecondary,
    display: 'flex',
    flexDirection: 'column' as const,
  } satisfies CSSProperties,

  // Chat area
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    backgroundColor: theme.colors.background,
  } satisfies CSSProperties,

  // Button styles
  button: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.textLight,
    border: 'none',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    transition: theme.transitions.fast,
  } satisfies CSSProperties,

  buttonSecondary: {
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.border}`,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    transition: theme.transitions.fast,
  } satisfies CSSProperties,

  // Loading styles
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    color: theme.colors.textSecondary,
  } satisfies CSSProperties,

  // Status indicator
  statusIndicator: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
  } satisfies CSSProperties,

  statusOnline: {
    backgroundColor: theme.colors.online,
  } satisfies CSSProperties,

  statusOffline: {
    backgroundColor: theme.colors.offline,
  } satisfies CSSProperties,

  statusConnecting: {
    backgroundColor: theme.colors.connecting,
  } satisfies CSSProperties,
};
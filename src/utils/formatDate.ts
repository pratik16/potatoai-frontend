import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function formatChatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

export function formatMessageTime(dateStr: string): string {
  return format(new Date(dateStr), 'HH:mm');
}

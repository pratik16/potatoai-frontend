/** Normalize OAuth avatar URLs (size + field aliases from API). */
export function normalizeAvatarUrl(url: string): string {
  if (url.includes('googleusercontent.com')) {
    return url.replace(/=s\d+(-[a-z])?$/i, '=s256-c');
  }

  if (url.includes('avatars.githubusercontent.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('s', '256');
      return parsed.toString();
    } catch {
      return url;
    }
  }

  return url;
}

export function resolveAvatarUrl(
  user: { avatar_url?: string | null; picture?: string | null } | null | undefined,
): string | null {
  const raw = user?.avatar_url ?? user?.picture ?? null;
  if (!raw) return null;
  return normalizeAvatarUrl(raw);
}

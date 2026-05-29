import type { User } from '../types/auth.types';
import { resolveAvatarUrl } from './avatarUrl';

type ApiUser = User & {
  fullName?: string | null;
  picture?:  string | null;
};

/** Map login/OAuth API user payload into Redux User shape. */
export function normalizeAuthUser(raw: ApiUser): User {
  return {
    ...raw,
    full_name:  raw.full_name ?? raw.fullName ?? raw.name ?? null,
    avatar_url: resolveAvatarUrl(raw),
    username:   raw.username ?? null,
  };
}

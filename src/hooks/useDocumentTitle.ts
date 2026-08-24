import { useEffect } from 'react';

/**
 * Sets `document.title` directly (not via react-helmet-async). Only 4 public
 * pages render a <Helmet>; every authenticated route relies on this instead,
 * so the tab title never gets stuck on whatever the last mounted Helmet set
 * (e.g. "Sign in — PotatoAIHub | PotatoChat" after login).
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

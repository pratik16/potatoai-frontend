export function formatCredits(credits: number): string {
  if (credits >= 1000) return `${(credits / 1000).toFixed(1)}k`;
  return credits.toFixed(0);
}

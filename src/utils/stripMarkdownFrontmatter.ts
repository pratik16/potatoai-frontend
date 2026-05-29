/** Remove YAML frontmatter (--- ... ---) from .md / .mdc agent files. */
export function stripMarkdownFrontmatter(raw: string): string {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith('---')) return raw;
  const end = trimmed.indexOf('---', 3);
  if (end === -1) return raw;
  return trimmed.slice(end + 3).trimStart();
}

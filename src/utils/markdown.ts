/**
 * Reduce a Markdown string to plain text for card previews.
 * Not a full parser — just enough to keep heading/list/emphasis markers
 * from showing up as literal characters in truncated previews.
 */
export const stripMarkdown = (markdown: string): string =>
  markdown
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/`([^`]*)`/g, '$1') // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images → alt text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → label
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/^>\s?/gm, '') // blockquotes
    .replace(/^\s*[-*+]\s+/gm, '') // bullet list markers
    .replace(/^\s*\d+\.\s+/gm, '') // ordered list markers
    .replace(/(\*{1,3}|_{1,3}|~~)(\S(?:.*?\S)?)\1/g, '$2') // bold/italic/strikethrough
    .replace(/\s*\n+\s*/g, ' ')
    .trim();

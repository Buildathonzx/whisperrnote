// Lightweight preprocessor to preserve single line breaks for markdown rendering
// It avoids modifying fenced code blocks (```...```)

export function preProcessMarkdown(md?: string): string {
  if (!md) return '';

  // Normalize CRLF to LF
  const normalized = md.replace(/\r\n/g, '\n');

  // Split into segments: code fence blocks (captured) and non-code parts
  const parts = normalized.split(/(^```[\s\S]*?^```)/gm);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    // If this part is a fenced code block, skip processing
    if (part.startsWith('```')) continue;

    // Process non-code part: add two trailing spaces to lines that are followed by a non-blank line
    const lines = part.split('\n');
    for (let j = 0; j < lines.length - 1; j++) {
      const nextLine = lines[j + 1];
      if (nextLine.trim() === '') {
        // Next line is blank -> paragraph break, do not add trailing spaces
        continue;
      }
      // If current line already ends with two spaces, skip
      if (/ {2}$/.test(lines[j])) continue;
      // Append two spaces to create a markdown line break
      lines[j] = lines[j] + '  ';
    }
    parts[i] = lines.join('\n');
  }

  return parts.join('');
}

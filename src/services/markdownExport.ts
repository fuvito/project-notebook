import type { JSONContent } from '@tiptap/core';
import type { NotebookBlock } from '../types/schema.ts';

function inlineToMd(nodes: JSONContent[]): string {
  return nodes
    .map((node) => {
      if (node.type !== 'text') return '';
      const text = node.text ?? '';
      const marks = (node.marks ?? []) as Array<{ type: string }>;
      const bold = marks.some((m) => m.type === 'bold');
      const italic = marks.some((m) => m.type === 'italic');
      if (bold && italic) return `***${text}***`;
      if (bold) return `**${text}**`;
      if (italic) return `*${text}*`;
      return text;
    })
    .join('');
}

export function blocksToMarkdown(title: string, blocks: NotebookBlock[]): string {
  const lines: string[] = [`# ${title}`, ''];

  let prevWasBullet = false;

  for (const block of blocks) {
    if (prevWasBullet && block.type !== 'bullet') lines.push('');
    prevWasBullet = block.type === 'bullet';

    switch (block.type) {
      case 'heading':
        lines.push(`${'#'.repeat(block.level)} ${block.text}`);
        lines.push('');
        break;
      case 'paragraph': {
        const text = block.inlineContent
          ? inlineToMd(block.inlineContent as JSONContent[])
          : block.text;
        lines.push(text);
        lines.push('');
        break;
      }
      case 'bullet': {
        const text = block.inlineContent
          ? inlineToMd(block.inlineContent as JSONContent[])
          : block.text;
        lines.push(`- ${text}`);
        break;
      }
      case 'link': {
        lines.push(`[${block.title}](${block.url})`);
        if (block.description) lines.push(`> ${block.description}`);
        lines.push('');
        break;
      }
    }
  }

  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return `${lines.join('\n')}\n`;
}

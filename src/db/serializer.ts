import type { JSONContent } from '@tiptap/core';
import type { NotebookBlock } from '../types/schema.ts';

// ── blocks → TipTap doc ───────────────────────────────────────────────────────

export function blocksToTipTap(blocks: NotebookBlock[]): JSONContent {
  const nodes: JSONContent[] = [];
  let bulletBuffer: NotebookBlock[] = [];

  const bulletContent = (b: NotebookBlock): JSONContent[] => {
    if (b.type !== 'bullet') return [];
    if (b.inlineContent) return b.inlineContent as JSONContent[];
    return b.text ? [{ type: 'text', text: b.text }] : [];
  };

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    nodes.push({
      type: 'bulletList',
      content: bulletBuffer.map((b) => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: bulletContent(b) }],
      })),
    });
    bulletBuffer = [];
  };

  for (const block of blocks) {
    if (block.type !== 'bullet') flushBullets();
    switch (block.type) {
      case 'heading':
        nodes.push({
          type: 'heading',
          attrs: { level: block.level },
          content: block.text ? [{ type: 'text', text: block.text }] : [],
        });
        break;
      case 'paragraph':
        nodes.push({
          type: 'paragraph',
          content: block.inlineContent
            ? (block.inlineContent as JSONContent[])
            : block.text ? [{ type: 'text', text: block.text }] : [],
        });
        break;
      case 'bullet':
        bulletBuffer.push(block);
        break;
      case 'link':
        nodes.push({
          type: 'linkCard',
          attrs: {
            blockId: block.id,
            url: block.url,
            title: block.title,
            savedAt: block.savedAt,
            description: block.description ?? null,
          },
        });
        break;
    }
  }
  flushBullets();

  if (nodes.length === 0) nodes.push({ type: 'paragraph' });
  return { type: 'doc', content: nodes };
}

// ── TipTap doc → blocks ───────────────────────────────────────────────────────

function nodeText(node: JSONContent): string {
  if (node.type === 'text') return node.text ?? '';
  return (node.content ?? []).map(nodeText).join('');
}

function hasMarks(node: JSONContent): boolean {
  if (node.type === 'text') return (node.marks?.length ?? 0) > 0;
  return (node.content ?? []).some(hasMarks);
}

export function tipTapToBlocks(doc: JSONContent): NotebookBlock[] {
  const blocks: NotebookBlock[] = [];

  for (const node of doc.content ?? []) {
    switch (node.type) {
      case 'heading': {
        const raw = node.attrs?.level as unknown;
        const level = (raw === 1 || raw === 2 || raw === 3 ? raw : 1) as 1 | 2 | 3;
        const text = nodeText(node).slice(0, 500);
        if (text) blocks.push({ id: crypto.randomUUID(), type: 'heading', level, text });
        break;
      }
      case 'paragraph': {
        const text = nodeText(node).slice(0, 50_000);
        if (text) blocks.push({
          id: crypto.randomUUID(),
          type: 'paragraph',
          text,
          ...(hasMarks(node) ? { inlineContent: node.content } : {}),
        });
        break;
      }
      case 'bulletList':
        for (const item of node.content ?? []) {
          const text = nodeText(item).slice(0, 5_000);
          const para = item.content?.[0];
          if (text) blocks.push({
            id: crypto.randomUUID(),
            type: 'bullet',
            text,
            ...(para && hasMarks(para) ? { inlineContent: para.content } : {}),
          });
        }
        break;
      case 'linkCard': {
        const a = node.attrs ?? {};
        const url = String(a.url ?? '');
        const title = String(a.title ?? '');
        if (!url || !title) break;
        blocks.push({
          id: String(a.blockId ?? crypto.randomUUID()),
          type: 'link',
          url,
          title,
          savedAt: Number(a.savedAt ?? 0),
          ...(a.description ? { description: String(a.description) } : {}),
        });
        break;
      }
    }
  }

  return blocks;
}

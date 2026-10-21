import { describe, it, expect } from 'vitest';
import { blocksToTipTap, tipTapToBlocks } from './serializer.ts';
import type { NotebookBlock } from '../types/schema.ts';

// ── blocksToTipTap ────────────────────────────────────────────────────────────

describe('blocksToTipTap', () => {
  it('returns a doc with a single empty paragraph for empty blocks', () => {
    const doc = blocksToTipTap([]);
    expect(doc.type).toBe('doc');
    expect(doc.content).toEqual([{ type: 'paragraph' }]);
  });

  it('converts a heading block', () => {
    const doc = blocksToTipTap([{ id: 'h1', type: 'heading', level: 2, text: 'Hello' }]);
    expect(doc.content?.[0]).toEqual({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Hello' }],
    });
  });

  it('converts a paragraph block', () => {
    const doc = blocksToTipTap([{ id: 'p1', type: 'paragraph', text: 'Some notes' }]);
    expect(doc.content?.[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Some notes' }],
    });
  });

  it('groups consecutive bullet blocks into a single bulletList', () => {
    const blocks: NotebookBlock[] = [
      { id: 'b1', type: 'bullet', text: 'First' },
      { id: 'b2', type: 'bullet', text: 'Second' },
    ];
    const doc = blocksToTipTap(blocks);
    expect(doc.content).toHaveLength(1);
    expect(doc.content?.[0]?.type).toBe('bulletList');
    expect(doc.content?.[0]?.content).toHaveLength(2);
  });

  it('flushes bullets when a non-bullet block follows', () => {
    const blocks: NotebookBlock[] = [
      { id: 'b1', type: 'bullet', text: 'Item' },
      { id: 'p1', type: 'paragraph', text: 'After' },
    ];
    const doc = blocksToTipTap(blocks);
    expect(doc.content?.[0]?.type).toBe('bulletList');
    expect(doc.content?.[1]?.type).toBe('paragraph');
  });

  it('converts a link block to linkCard node', () => {
    const block: NotebookBlock = {
      id: 'lnk1',
      type: 'link',
      url: 'https://example.com',
      title: 'Example',
      savedAt: 1000,
      description: 'A site',
    };
    const doc = blocksToTipTap([block]);
    expect(doc.content?.[0]).toEqual({
      type: 'linkCard',
      attrs: {
        blockId: 'lnk1',
        url: 'https://example.com',
        title: 'Example',
        savedAt: 1000,
        description: 'A site',
      },
    });
  });

  it('uses null for missing link description', () => {
    const block: NotebookBlock = {
      id: 'lnk2',
      type: 'link',
      url: 'https://example.com',
      title: 'Example',
      savedAt: 1000,
    };
    const doc = blocksToTipTap([block]);
    expect(doc.content?.[0]?.attrs?.description).toBeNull();
  });
});

// ── tipTapToBlocks ────────────────────────────────────────────────────────────

describe('tipTapToBlocks', () => {
  it('returns empty array for empty doc', () => {
    expect(tipTapToBlocks({ type: 'doc', content: [] })).toEqual([]);
  });

  it('converts a heading node', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Hi' }] }],
    };
    const blocks = tipTapToBlocks(doc);
    expect(blocks[0]).toMatchObject({ type: 'heading', level: 3, text: 'Hi' });
  });

  it('defaults heading level to 1 for unknown level', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 99 }, content: [{ type: 'text', text: 'X' }] }],
    };
    expect(tipTapToBlocks(doc)[0]).toMatchObject({ type: 'heading', level: 1 });
  });

  it('converts a paragraph node', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Notes' }] }],
    };
    expect(tipTapToBlocks(doc)[0]).toMatchObject({ type: 'paragraph', text: 'Notes' });
  });

  it('skips empty paragraphs', () => {
    const doc = { type: 'doc', content: [{ type: 'paragraph', content: [] }] };
    expect(tipTapToBlocks(doc)).toHaveLength(0);
  });

  it('converts a bulletList into individual bullet blocks', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'bulletList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'B' }] }] },
        ],
      }],
    };
    const blocks = tipTapToBlocks(doc);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ type: 'bullet', text: 'A' });
    expect(blocks[1]).toMatchObject({ type: 'bullet', text: 'B' });
  });

  it('converts a linkCard node', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'linkCard',
        attrs: { blockId: 'lnk1', url: 'https://ex.com', title: 'Ex', savedAt: 999, description: 'Desc' },
      }],
    };
    const blocks = tipTapToBlocks(doc);
    expect(blocks[0]).toMatchObject({
      id: 'lnk1',
      type: 'link',
      url: 'https://ex.com',
      title: 'Ex',
      savedAt: 999,
      description: 'Desc',
    });
  });

  it('omits description when null', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'linkCard',
        attrs: { blockId: 'lnk2', url: 'https://ex.com', title: 'Ex', savedAt: 1, description: null },
      }],
    };
    const block = tipTapToBlocks(doc)[0];
    expect(block).not.toHaveProperty('description');
  });

  it('skips linkCard nodes without url or title', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'linkCard', attrs: { url: '', title: '' } }],
    };
    expect(tipTapToBlocks(doc)).toHaveLength(0);
  });
});

  it('preserves paragraph inlineContent with link mark on round-trip', () => {
    const inlineContent = [
      { type: 'text', text: 'See ' },
      { type: 'text', text: 'https://example.com', marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }] },
    ];
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: inlineContent }],
    };
    const blocks = tipTapToBlocks(doc);
    expect(blocks[0]).toMatchObject({ type: 'paragraph', text: 'See https://example.com' });
    expect((blocks[0] as { inlineContent?: unknown }).inlineContent).toEqual(inlineContent);

    const restored = blocksToTipTap(blocks);
    expect(restored.content?.[0]).toEqual({ type: 'paragraph', content: inlineContent });
  });

  it('preserves bullet inlineContent with link mark on round-trip', () => {
    const inlineContent = [
      { type: 'text', text: 'https://example.com', marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }] },
    ];
    const doc = {
      type: 'doc',
      content: [{
        type: 'bulletList',
        content: [{
          type: 'listItem',
          content: [{ type: 'paragraph', content: inlineContent }],
        }],
      }],
    };
    const blocks = tipTapToBlocks(doc);
    expect(blocks[0]).toMatchObject({ type: 'bullet', text: 'https://example.com' });
    expect((blocks[0] as { inlineContent?: unknown }).inlineContent).toEqual(inlineContent);

    const restored = blocksToTipTap(blocks);
    expect(restored.content?.[0]?.content?.[0]?.content?.[0]).toEqual({
      type: 'paragraph',
      content: inlineContent,
    });
  });

// ── round-trip ────────────────────────────────────────────────────────────────

describe('round-trip: blocks → TipTap → blocks', () => {
  const originals: NotebookBlock[] = [
    { id: 'h1', type: 'heading', level: 1, text: 'Title' },
    { id: 'p1', type: 'paragraph', text: 'Intro paragraph' },
    { id: 'b1', type: 'bullet', text: 'First item' },
    { id: 'b2', type: 'bullet', text: 'Second item' },
    { id: 'lnk1', type: 'link', url: 'https://example.com', title: 'Example', savedAt: 1000 },
  ];

  it('preserves block count', () => {
    const result = tipTapToBlocks(blocksToTipTap(originals));
    expect(result).toHaveLength(originals.length);
  });

  it('preserves types', () => {
    const result = tipTapToBlocks(blocksToTipTap(originals));
    expect(result.map((b) => b.type)).toEqual(originals.map((b) => b.type));
  });

  it('preserves link block id', () => {
    const result = tipTapToBlocks(blocksToTipTap(originals));
    const link = result.find((b) => b.type === 'link');
    expect(link?.id).toBe('lnk1');
  });
});

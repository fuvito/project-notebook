import { describe, expect, it } from 'vitest';
import type { NotebookBlock } from '../types/schema.ts';
import { blocksToMarkdown } from './markdownExport.ts';

// ── helpers ───────────────────────────────────────────────────────────────────

const h = (level: 1 | 2 | 3, text: string): NotebookBlock =>
  ({ id: 'h', type: 'heading', level, text });

const p = (text: string): NotebookBlock =>
  ({ id: 'p', type: 'paragraph', text });

const b = (text: string): NotebookBlock =>
  ({ id: 'b', type: 'bullet', text });

const lnk = (title: string, url: string, description?: string): NotebookBlock => ({
  id: 'l',
  type: 'link',
  url,
  title,
  savedAt: 0,
  ...(description !== undefined ? { description } : {}),
});

// ── blocksToMarkdown ──────────────────────────────────────────────────────────

describe('blocksToMarkdown', () => {
  it('returns only the title heading for empty blocks', () => {
    const md = blocksToMarkdown('My Note', []);
    expect(md).toBe('# My Note\n');
  });

  it('ends with a single newline', () => {
    const md = blocksToMarkdown('T', [p('hello')]);
    expect(md.endsWith('\n')).toBe(true);
    expect(md.endsWith('\n\n')).toBe(false);
  });

  it('renders H1 heading', () => {
    expect(blocksToMarkdown('T', [h(1, 'Section')])).toContain('# Section');
  });

  it('renders H2 heading', () => {
    expect(blocksToMarkdown('T', [h(2, 'Sub')])).toContain('## Sub');
  });

  it('renders H3 heading', () => {
    expect(blocksToMarkdown('T', [h(3, 'Deep')])).toContain('### Deep');
  });

  it('renders a paragraph as plain text', () => {
    const md = blocksToMarkdown('T', [p('Hello world')]);
    expect(md).toContain('Hello world');
  });

  it('renders a bullet with "- " prefix', () => {
    const md = blocksToMarkdown('T', [b('First item')]);
    expect(md).toContain('- First item');
  });

  it('renders consecutive bullets without blank lines between them', () => {
    const md = blocksToMarkdown('T', [b('A'), b('B'), b('C')]);
    expect(md).toContain('- A\n- B\n- C');
  });

  it('renders a link card as [title](url)', () => {
    const md = blocksToMarkdown('T', [lnk('Example', 'https://example.com')]);
    expect(md).toContain('[Example](https://example.com)');
  });

  it('appends description as a blockquote when present', () => {
    const md = blocksToMarkdown('T', [lnk('Site', 'https://example.com', 'Useful reference')]);
    expect(md).toContain('[Site](https://example.com)\n> Useful reference');
  });

  it('omits blockquote when description is absent', () => {
    const md = blocksToMarkdown('T', [lnk('Site', 'https://example.com')]);
    expect(md).not.toContain('>');
  });

  it('renders bold inline content as **text**', () => {
    const block: NotebookBlock = {
      id: 'p',
      type: 'paragraph',
      text: 'hello world',
      inlineContent: [
        { type: 'text', text: 'hello ', marks: [] },
        { type: 'text', text: 'world', marks: [{ type: 'bold' }] },
      ],
    };
    const md = blocksToMarkdown('T', [block]);
    expect(md).toContain('hello **world**');
  });

  it('renders italic inline content as *text*', () => {
    const block: NotebookBlock = {
      id: 'p',
      type: 'paragraph',
      text: 'hi',
      inlineContent: [{ type: 'text', text: 'hi', marks: [{ type: 'italic' }] }],
    };
    const md = blocksToMarkdown('T', [block]);
    expect(md).toContain('*hi*');
  });

  it('renders bold+italic inline content as ***text***', () => {
    const block: NotebookBlock = {
      id: 'p',
      type: 'paragraph',
      text: 'hi',
      inlineContent: [{
        type: 'text',
        text: 'hi',
        marks: [{ type: 'bold' }, { type: 'italic' }],
      }],
    };
    const md = blocksToMarkdown('T', [block]);
    expect(md).toContain('***hi***');
  });

  it('renders bold inline content in bullet items', () => {
    const block: NotebookBlock = {
      id: 'b',
      type: 'bullet',
      text: 'item',
      inlineContent: [{ type: 'text', text: 'item', marks: [{ type: 'bold' }] }],
    };
    const md = blocksToMarkdown('T', [block]);
    expect(md).toContain('- **item**');
  });

  it('produces a blank line after headings, paragraphs, and link cards', () => {
    const md = blocksToMarkdown('T', [h(1, 'S'), p('Para'), lnk('L', 'https://x.com')]);
    // Each block should be followed by a blank line before the next block
    expect(md).toContain('# S\n\nPara\n\n[L](https://x.com)');
  });

  it('full mixed document renders correctly', () => {
    const blocks: NotebookBlock[] = [
      h(1, 'Overview'),
      p('Introduction text.'),
      b('Point one'),
      b('Point two'),
      lnk('Ref', 'https://ref.example.com', 'Important reference'),
    ];
    const md = blocksToMarkdown('Project Alpha', blocks);
    const expected = `${[
      '# Project Alpha',
      '',
      '# Overview',
      '',
      'Introduction text.',
      '',
      '- Point one',
      '- Point two',
      '',
      '[Ref](https://ref.example.com)',
      '> Important reference',
    ].join('\n')}\n`;
    expect(md).toBe(expected);
  });
});

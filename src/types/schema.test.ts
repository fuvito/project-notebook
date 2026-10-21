import { describe, it, expect } from 'vitest';
import {
  SafeUrlSchema,
  NotebookBlockSchema,
  NotebookSchema,
  ExportedDataSchema,
} from './schema.ts';

// ── SafeUrlSchema ─────────────────────────────────────────────────────────────

describe('SafeUrlSchema', () => {
  it('accepts http URLs', () => {
    expect(SafeUrlSchema.safeParse('http://example.com').success).toBe(true);
  });

  it('accepts https URLs with path and query', () => {
    expect(SafeUrlSchema.safeParse('https://example.com/path?q=1#frag').success).toBe(true);
  });

  it('rejects javascript: scheme', () => {
    expect(SafeUrlSchema.safeParse('javascript:alert(1)').success).toBe(false);
  });

  it('rejects data: scheme', () => {
    expect(SafeUrlSchema.safeParse('data:text/html,<h1>hi</h1>').success).toBe(false);
  });

  it('rejects file: scheme', () => {
    expect(SafeUrlSchema.safeParse('file:///etc/passwd').success).toBe(false);
  });

  it('rejects plain strings', () => {
    expect(SafeUrlSchema.safeParse('not a url').success).toBe(false);
  });

  it('rejects URLs over 2048 characters', () => {
    expect(SafeUrlSchema.safeParse(`https://example.com/${'a'.repeat(2040)}`).success).toBe(false);
  });
});

// ── NotebookBlockSchema ───────────────────────────────────────────────────────

describe('NotebookBlockSchema — heading', () => {
  it('accepts valid levels 1, 2, 3', () => {
    for (const level of [1, 2, 3] as const) {
      expect(
        NotebookBlockSchema.safeParse({ id: 'b1', type: 'heading', level, text: 'Hi' }).success,
      ).toBe(true);
    }
  });

  it('rejects level 4', () => {
    expect(
      NotebookBlockSchema.safeParse({ id: 'b1', type: 'heading', level: 4, text: 'Hi' }).success,
    ).toBe(false);
  });

  it('rejects text over 500 chars', () => {
    expect(
      NotebookBlockSchema.safeParse({ id: 'b1', type: 'heading', level: 1, text: 'x'.repeat(501) }).success,
    ).toBe(false);
  });
});

describe('NotebookBlockSchema — link', () => {
  const base = { id: 'b2', type: 'link', url: 'https://example.com', title: 'Example', savedAt: 1000 };

  it('accepts a valid link block', () => {
    expect(NotebookBlockSchema.safeParse(base).success).toBe(true);
  });

  it('accepts a link with optional description', () => {
    expect(NotebookBlockSchema.safeParse({ ...base, description: 'Some notes' }).success).toBe(true);
  });

  it('rejects a javascript: URL', () => {
    expect(NotebookBlockSchema.safeParse({ ...base, url: 'javascript:void(0)' }).success).toBe(false);
  });

  it('rejects empty title', () => {
    expect(NotebookBlockSchema.safeParse({ ...base, title: '' }).success).toBe(false);
  });

  it('rejects negative savedAt', () => {
    expect(NotebookBlockSchema.safeParse({ ...base, savedAt: -1 }).success).toBe(false);
  });
});

describe('NotebookBlockSchema — paragraph and bullet', () => {
  it('accepts a paragraph block', () => {
    expect(
      NotebookBlockSchema.safeParse({ id: 'b3', type: 'paragraph', text: 'Hello' }).success,
    ).toBe(true);
  });

  it('accepts a bullet block', () => {
    expect(
      NotebookBlockSchema.safeParse({ id: 'b4', type: 'bullet', text: 'Item' }).success,
    ).toBe(true);
  });

  it('rejects an unknown block type', () => {
    expect(
      NotebookBlockSchema.safeParse({ id: 'b5', type: 'table', text: 'x' }).success,
    ).toBe(false);
  });
});

// ── NotebookSchema ────────────────────────────────────────────────────────────

const validNotebook = {
  id: 'nb-1',
  title: 'My Project',
  createdAt: 1000,
  updatedAt: 2000,
  content: { version: 1, blocks: [] },
};

describe('NotebookSchema', () => {
  it('accepts a minimal valid notebook', () => {
    expect(NotebookSchema.safeParse(validNotebook).success).toBe(true);
  });

  it('accepts a notebook with blocks', () => {
    const nb = {
      ...validNotebook,
      content: {
        version: 1,
        blocks: [
          { id: 'b1', type: 'heading', level: 1, text: 'Intro' },
          { id: 'b2', type: 'paragraph', text: 'Notes here' },
        ],
      },
    };
    expect(NotebookSchema.safeParse(nb).success).toBe(true);
  });

  it('rejects empty title', () => {
    expect(NotebookSchema.safeParse({ ...validNotebook, title: '' }).success).toBe(false);
  });

  it('rejects title over 200 chars', () => {
    expect(NotebookSchema.safeParse({ ...validNotebook, title: 'x'.repeat(201) }).success).toBe(false);
  });

  it('rejects wrong content version', () => {
    expect(
      NotebookSchema.safeParse({ ...validNotebook, content: { version: 2, blocks: [] } }).success,
    ).toBe(false);
  });

  it('rejects negative timestamps', () => {
    expect(NotebookSchema.safeParse({ ...validNotebook, createdAt: -1 }).success).toBe(false);
  });
});

// ── ExportedDataSchema ────────────────────────────────────────────────────────

describe('ExportedDataSchema', () => {
  it('accepts a valid export with no notebooks', () => {
    expect(
      ExportedDataSchema.safeParse({ exportVersion: 1, exportedAt: 1000, notebooks: [] }).success,
    ).toBe(true);
  });

  it('accepts a valid export with notebooks', () => {
    expect(
      ExportedDataSchema.safeParse({
        exportVersion: 1,
        exportedAt: 1000,
        notebooks: [validNotebook],
      }).success,
    ).toBe(true);
  });

  it('rejects wrong exportVersion', () => {
    expect(
      ExportedDataSchema.safeParse({ exportVersion: 2, exportedAt: 1000, notebooks: [] }).success,
    ).toBe(false);
  });
});

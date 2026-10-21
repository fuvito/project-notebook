import { describe, expect, it } from 'vitest';
import type { ExportedData, Notebook } from '../types/schema.ts';
import { buildExportPayload, parseImport, readImportFile } from './backup.ts';

// ── fixtures ──────────────────────────────────────────────────────────────────

const nb = (id: string): Notebook => ({
  id,
  title: `Notebook ${id}`,
  createdAt: 1000,
  updatedAt: 2000,
  content: { version: 1, blocks: [] },
});

const validPayload = (notebooks: Notebook[] = [nb('a'), nb('b')]): ExportedData => ({
  exportVersion: 1,
  exportedAt: Date.now(),
  notebooks,
});

// ── buildExportPayload ────────────────────────────────────────────────────────

describe('buildExportPayload', () => {
  it('sets exportVersion to 1', () => {
    expect(buildExportPayload([]).exportVersion).toBe(1);
  });

  it('includes the supplied notebooks', () => {
    const result = buildExportPayload([nb('x')]);
    expect(result.notebooks).toHaveLength(1);
    expect(result.notebooks[0]?.id).toBe('x');
  });

  it('sets exportedAt to a recent timestamp', () => {
    const before = Date.now();
    const { exportedAt } = buildExportPayload([]);
    const after = Date.now();
    expect(exportedAt).toBeGreaterThanOrEqual(before);
    expect(exportedAt).toBeLessThanOrEqual(after);
  });
});

// ── parseImport ───────────────────────────────────────────────────────────────

describe('parseImport', () => {
  it('accepts a valid export payload', () => {
    const result = parseImport(validPayload());
    expect(result.ok).toBe(true);
  });

  it('returns the parsed notebooks on success', () => {
    const result = parseImport(validPayload([nb('z')]));
    if (!result.ok) throw new Error('expected ok');
    expect(result.data.notebooks[0]?.id).toBe('z');
  });

  it('rejects a wrong exportVersion', () => {
    const bad = { ...validPayload(), exportVersion: 2 };
    const result = parseImport(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects a missing exportVersion field', () => {
    const { exportVersion: _, ...bad } = validPayload();
    expect(parseImport(bad).ok).toBe(false);
  });

  it('rejects a missing exportedAt field', () => {
    const { exportedAt: _, ...bad } = validPayload();
    expect(parseImport(bad).ok).toBe(false);
  });

  it('rejects a notebook with an invalid URL scheme in a link block', () => {
    const withBadLink: Notebook = {
      ...nb('badlink'),
      content: {
        version: 1,
        blocks: [{
          id: 'l1',
          type: 'link',
          url: 'javascript:alert(1)',
          title: 'Evil',
          savedAt: 0,
        }],
      },
    };
    const result = parseImport(validPayload([withBadLink]));
    expect(result.ok).toBe(false);
  });

  it('rejects a data: URL in a link block', () => {
    const withDataUrl: Notebook = {
      ...nb('datalink'),
      content: {
        version: 1,
        blocks: [{
          id: 'l2',
          type: 'link',
          url: 'data:text/html,<h1>hi</h1>',
          title: 'Data',
          savedAt: 0,
        }],
      },
    };
    expect(parseImport(validPayload([withDataUrl])).ok).toBe(false);
  });

  it('rejects more than 500 notebooks', () => {
    const tooMany = Array.from({ length: 501 }, (_, i) => nb(`n${i}`));
    expect(parseImport(validPayload(tooMany)).ok).toBe(false);
  });

  it('rejects non-object input', () => {
    expect(parseImport(null).ok).toBe(false);
    expect(parseImport('string').ok).toBe(false);
    expect(parseImport(42).ok).toBe(false);
  });

  it('returns an error string on failure', () => {
    const result = parseImport({});
    if (result.ok) throw new Error('expected failure');
    expect(typeof result.error).toBe('string');
    expect(result.error.length).toBeGreaterThan(0);
  });
});

// ── readImportFile ────────────────────────────────────────────────────────────

describe('readImportFile', () => {
  const makeFile = (content: string, name = 'backup.json', type = 'application/json') =>
    new File([content], name, { type });

  it('accepts a valid JSON file', async () => {
    const json = JSON.stringify(validPayload());
    const result = await readImportFile(makeFile(json));
    expect(result.ok).toBe(true);
  });

  it('rejects a file that is not valid JSON', async () => {
    const result = await readImportFile(makeFile('not json at all'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/json/i);
  });

  it('rejects a file over 10 MB', async () => {
    const bigContent = 'x'.repeat(10 * 1024 * 1024 + 1);
    const result = await readImportFile(makeFile(bigContent));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/too large/i);
  });

  it('rejects valid JSON that fails schema validation', async () => {
    const json = JSON.stringify({ exportVersion: 99, exportedAt: 0, notebooks: [] });
    const result = await readImportFile(makeFile(json));
    expect(result.ok).toBe(false);
  });
});

// ── round-trip ────────────────────────────────────────────────────────────────

describe('round-trip: buildExportPayload → JSON → parseImport', () => {
  it('preserves all notebooks and their content', () => {
    const notebooks = [nb('a'), nb('b')];
    const payload = buildExportPayload(notebooks);
    const json = JSON.stringify(payload);
    const result = parseImport(JSON.parse(json));
    if (!result.ok) throw new Error('expected ok');
    expect(result.data.notebooks).toHaveLength(2);
    expect(result.data.notebooks.map((n) => n.id)).toEqual(['a', 'b']);
  });
});

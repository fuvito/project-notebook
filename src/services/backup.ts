import { ExportedDataSchema, type ExportedData, type Notebook } from '../types/schema.ts';

const MAX_IMPORT_BYTES = 10 * 1024 * 1024; // 10 MB

export type ImportResult =
  | { ok: true; data: ExportedData }
  | { ok: false; error: string };

export function buildExportPayload(notebooks: Notebook[]): ExportedData {
  return {
    exportVersion: 1,
    exportedAt: Date.now(),
    notebooks,
  };
}

export function downloadExport(notebooks: Notebook[]): void {
  const payload = buildExportPayload(notebooks);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date(payload.exportedAt).toISOString().slice(0, 10);
  a.download = `project-notebook-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImport(raw: unknown): ImportResult {
  const result = ExportedDataSchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? 'Invalid format';
    return { ok: false, error: msg };
  }
  return { ok: true, data: result.data };
}

export async function readImportFile(file: File): Promise<ImportResult> {
  if (file.size > MAX_IMPORT_BYTES) {
    return { ok: false, error: 'File too large (max 10 MB)' };
  }
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, error: 'Could not read file' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not valid JSON' };
  }
  return parseImport(parsed);
}

import { z } from 'zod';

// ── URL validation ────────────────────────────────────────────────────────────
// Only http/https are allowed. Rejects javascript:, data:, file:, blob:, etc.
// Validated via URL constructor so the check matches actual browser behaviour.

export const SafeUrlSchema = z
  .string()
  .max(2048)
  .refine(
    (val) => {
      try {
        const { protocol } = new URL(val);
        return protocol === 'http:' || protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must use http or https' },
  );

// ── Block schemas ─────────────────────────────────────────────────────────────

export const HeadingBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  text: z.string().max(500),
});

export const ParagraphBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal('paragraph'),
  text: z.string().max(50_000),
  inlineContent: z.array(z.any()).optional(),
});

export const BulletBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal('bullet'),
  text: z.string().max(5_000),
  inlineContent: z.array(z.any()).optional(),
});

export const LinkBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal('link'),
  url: SafeUrlSchema,
  title: z.string().min(1).max(500),
  description: z.string().max(5_000).optional(),
  savedAt: z.number().int().min(0),
});

export const NotebookBlockSchema = z.discriminatedUnion('type', [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  BulletBlockSchema,
  LinkBlockSchema,
]);

// ── Notebook ──────────────────────────────────────────────────────────────────

export const NotebookContentSchema = z.object({
  version: z.literal(1),
  blocks: z.array(NotebookBlockSchema).max(1_000),
});

export const NotebookSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  createdAt: z.number().int().min(0),
  updatedAt: z.number().int().min(0),
  content: NotebookContentSchema,
});

// ── Export / import format ────────────────────────────────────────────────────

export const ExportedDataSchema = z.object({
  exportVersion: z.literal(1),
  exportedAt: z.number().int().min(0),
  notebooks: z.array(NotebookSchema).max(500),
});

// ── TypeScript types ──────────────────────────────────────────────────────────

export type HeadingBlock = z.infer<typeof HeadingBlockSchema>;
export type ParagraphBlock = z.infer<typeof ParagraphBlockSchema>;
export type BulletBlock = z.infer<typeof BulletBlockSchema>;
export type LinkBlock = z.infer<typeof LinkBlockSchema>;
export type NotebookBlock = z.infer<typeof NotebookBlockSchema>;
export type NotebookContent = z.infer<typeof NotebookContentSchema>;
export type Notebook = z.infer<typeof NotebookSchema>;
export type ExportedData = z.infer<typeof ExportedDataSchema>;

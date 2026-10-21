import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import type { Editor } from '@tiptap/core';
import { getNotebook, saveNotebook } from '../db/repository.ts';
import { blocksToTipTap, tipTapToBlocks } from '../db/serializer.ts';
import { LinkCardExtension } from '../extensions/LinkCard.tsx';
import { CaptureBar } from './CaptureBar.tsx';
import { openUrl } from '../browser/tabs.ts';

// ── Styles ────────────────────────────────────────────────────────────────────

const INDIGO = '#4F46E5';
const INDIGO_LIGHT = '#EEF2FF';
const BORDER = '#E5E7EB';
const TEXT_MUTED = '#6B7280';

const styles = {
  wrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    background: '#fff',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    padding: '0.25rem 0.75rem',
    borderBottom: `1px solid ${BORDER}`,
    flexShrink: 0,
    flexWrap: 'wrap' as const,
  },
  toolbarBtn: (active: boolean) => ({
    background: active ? INDIGO_LIGHT : 'none',
    color: active ? INDIGO : TEXT_MUTED,
    border: 'none',
    borderRadius: '4px',
    padding: '0.2rem 0.4rem',
    fontSize: '0.75rem',
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    lineHeight: 1.4,
    minWidth: '1.6rem',
    textAlign: 'center' as const,
  }),
  toolbarDivider: {
    width: '1px',
    height: '1rem',
    background: BORDER,
    margin: '0 0.25rem',
    flexShrink: 0,
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  editorScroll: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '0.75rem 1rem',
  },
  outlinePanel: {
    width: '160px',
    flexShrink: 0,
    borderLeft: `1px solid ${BORDER}`,
    overflowY: 'auto' as const,
    padding: '0.5rem',
    background: '#FAFAFA',
  },
  outlineTitle: {
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: TEXT_MUTED,
    marginBottom: '0.375rem',
    padding: '0 0.25rem',
  },
  outlineItem: (level: number) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    background: 'none',
    border: 'none',
    fontSize: level === 1 ? '0.75rem' : '0.6875rem',
    fontWeight: level === 1 ? 600 : 400,
    color: TEXT_MUTED,
    padding: `0.125rem ${0.25 + (level - 1) * 0.5}rem`,
    cursor: 'pointer',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    borderRadius: '3px',
    fontFamily: 'inherit',
  }),
  statusBar: {
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 0.75rem',
    borderTop: `1px solid ${BORDER}`,
    flexShrink: 0,
  },
  statusText: (visible: boolean) => ({
    fontSize: '0.6875rem',
    color: TEXT_MUTED,
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.3s',
  }),
  loadingOverlay: {
    position: 'absolute' as const,
    inset: 0,
    background: 'rgba(255,255,255,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8125rem',
    color: TEXT_MUTED,
    zIndex: 10,
  },
};

// ── Toolbar ───────────────────────────────────────────────────────────────────

interface HeadingEntry { level: 1 | 2 | 3; text: string }

const styles_captureBtn = (active: boolean) => ({
  background: active ? '#C7D2FE' : INDIGO_LIGHT,
  color: INDIGO,
  border: `1px solid ${active ? INDIGO : 'transparent'}`,
  borderRadius: '5px',
  padding: '0.2rem 0.5rem',
  fontSize: '0.875rem',
  lineHeight: 1.4,
  cursor: 'pointer',
  fontFamily: 'inherit',
  marginLeft: 'auto',
  flexShrink: 0,
});

interface ToolbarProps {
  editor: Editor | null;
  showOutline: boolean;
  headingsCount: number;
  capturing: boolean;
  onToggleOutline(): void;
  onToggleCapture(): void;
}

function Toolbar({ editor, showOutline, headingsCount, capturing, onToggleOutline, onToggleCapture }: ToolbarProps) {
  const btn = (
    label: string,
    active: boolean,
    action: () => void,
    title?: string,
  ) => (
    <button
      type="button"
      key={label}
      style={styles.toolbarBtn(active)}
      onMouseDown={(e) => { e.preventDefault(); action(); }}
      title={title ?? label}
      aria-label={title ?? label}
      aria-pressed={active}
    >
      {label}
    </button>
  );

  const h = (level: 1 | 2 | 3) =>
    btn(
      `H${level}`,
      editor?.isActive('heading', { level }) ?? false,
      () => editor?.chain().focus().toggleHeading({ level }).run(),
      `Heading ${level}`,
    );

  return (
    <div style={styles.toolbar} role="toolbar" aria-label="Editor formatting">
      {h(1)}{h(2)}{h(3)}
      <div style={styles.toolbarDivider} />
      {btn('B', editor?.isActive('bold') ?? false,
        () => editor?.chain().focus().toggleBold().run(), 'Bold')}
      {btn('I', editor?.isActive('italic') ?? false,
        () => editor?.chain().focus().toggleItalic().run(), 'Italic')}
      {btn('•', editor?.isActive('bulletList') ?? false,
        () => editor?.chain().focus().toggleBulletList().run(), 'Bullet list')}
      {headingsCount > 0 && (
        <>
          <div style={styles.toolbarDivider} />
          {btn('≡', showOutline,
            onToggleOutline, showOutline ? 'Hide outline' : 'Show outline')}
        </>
      )}
      <button
        type="button"
        style={styles_captureBtn(capturing)}
        onClick={onToggleCapture}
        aria-label={capturing ? 'Cancel save tab' : 'Save current tab'}
        title={capturing ? 'Cancel' : 'Save current tab'}
        aria-pressed={capturing}
      >
        {capturing ? '✕' : '🔗'}
      </button>
    </div>
  );
}

// ── OutlinePanel ──────────────────────────────────────────────────────────────

interface OutlinePanelProps {
  headings: HeadingEntry[];
  editorDom: HTMLElement | null;
}

function OutlinePanel({ headings, editorDom }: OutlinePanelProps) {
  const scrollTo = (text: string) => {
    if (!editorDom) return;
    for (const el of editorDom.querySelectorAll('h1, h2, h3')) {
      if (el.textContent?.trim() === text.trim()) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
  };

  return (
    <aside style={styles.outlinePanel} aria-label="Outline">
      <div style={styles.outlineTitle}>Outline</div>
      {headings.map((h) => (
        <button
          key={`${h.level}:${h.text}`}
          type="button"
          style={styles.outlineItem(h.level)}
          onClick={() => scrollTo(h.text)}
          title={h.text}
        >
          {h.text}
        </button>
      ))}
    </aside>
  );
}

// ── pure helpers ─────────────────────────────────────────────────────────────

function extractHeadings(doc: JSONContent): HeadingEntry[] {
  return (doc.content ?? [])
    .filter((n) => n.type === 'heading')
    .map((n) => ({
      level: (n.attrs?.level as 1 | 2 | 3) ?? 1,
      text: (n.content ?? []).map((c) => c.text ?? '').join(''),
    }))
    .filter((h) => h.text);
}

// ── NotebookEditor ────────────────────────────────────────────────────────────

export interface NotebookEditorProps {
  notebookId: string;
}

const SCROLL_KEY = (id: string) => `pn_scroll_${id}`;

function saveScrollPos(notebookId: string, top: number): void {
  try { localStorage.setItem(SCROLL_KEY(notebookId), String(Math.round(top))); } catch { /* ignore */ }
}

function loadScrollPos(notebookId: string): number {
  try { return Number(localStorage.getItem(SCROLL_KEY(notebookId)) ?? '0'); } catch { return 0; }
}

export function NotebookEditor({ notebookId }: NotebookEditorProps) {
  const [contentReady, setContentReady] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [headings, setHeadings] = useState<HeadingEntry[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDocRef = useRef<JSONContent | null>(null);
  const isLoadingRef = useRef(true);

  const doSave = useCallback(
    async (doc: JSONContent) => {
      setSaveStatus('saving');
      try {
        const nb = await getNotebook(notebookId);
        if (nb) {
          await saveNotebook({
            ...nb,
            content: { version: 1, blocks: tipTapToBlocks(doc) },
            updatedAt: Date.now(),
          });
        }
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 1500);
      } catch {
        setSaveStatus('idle');
      }
    },
    [notebookId],
  );

  const scheduleAutosave = useCallback(
    (doc: JSONContent) => {
      latestDocRef.current = doc;
      if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        void doSave(doc);
      }, 800);
    },
    [doSave],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      LinkCardExtension,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { class: 'notebook-link', rel: 'noopener noreferrer' },
      }),
    ],
    editorProps: {
      attributes: { class: 'notebook-editor', 'data-testid': 'notebook-editor' },
    },
    onUpdate: ({ editor: e }) => {
      if (isLoadingRef.current) return;
      const doc = e.getJSON();
      setHeadings(extractHeadings(doc));
      scheduleAutosave(doc);
    },
  });

  // Load content into editor when it is ready
  useEffect(() => {
    if (!editor) return;
    isLoadingRef.current = true;
    setContentReady(false);
    getNotebook(notebookId)
      .then((nb) => {
        if (!editor.isDestroyed) {
          const content = nb ? blocksToTipTap(nb.content.blocks) : { type: 'doc', content: [{ type: 'paragraph' }] };
          editor.commands.setContent(content);
          setHeadings(extractHeadings(content));
          isLoadingRef.current = false;
          setContentReady(true);
        }
      })
      .catch(() => {
        if (!editor.isDestroyed) {
          setContentReady(true);
          isLoadingRef.current = false;
        }
      });
  }, [editor, notebookId]);

  // Restore scroll position after content loads
  useEffect(() => {
    if (!contentReady || !scrollRef.current) return;
    const saved = loadScrollPos(notebookId);
    if (saved > 0) scrollRef.current.scrollTop = saved;
  }, [contentReady, notebookId]);

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        if (latestDocRef.current) void doSave(latestDocRef.current);
      }
      if (scrollTimerRef.current !== null) clearTimeout(scrollTimerRef.current);
    };
  }, [doSave]);

  const editorDom = editor?.view?.dom instanceof HTMLElement ? editor.view.dom : null;

  useEffect(() => {
    if (!editorDom) return;
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
      if (anchor?.href) {
        e.preventDefault();
        openUrl(anchor.href);
      }
    };
    editorDom.addEventListener('click', handler);
    return () => editorDom.removeEventListener('click', handler);
  }, [editorDom]);

  return (
    <div style={styles.wrapper}>
      <Toolbar
        editor={editor}
        showOutline={showOutline}
        headingsCount={headings.length}
        capturing={capturing}
        onToggleOutline={() => setShowOutline((v) => !v)}
        onToggleCapture={() => setCapturing((v) => !v)}
      />

      {capturing && (
        <CaptureBar editor={editor} onClose={() => setCapturing(false)} />
      )}

      <div style={{ ...styles.contentArea, position: 'relative' }}>
        {!contentReady && (
          <div style={styles.loadingOverlay} aria-live="polite">
            Loading…
          </div>
        )}

        <div
          ref={scrollRef}
          style={styles.editorScroll}
          onScroll={() => {
            if (scrollTimerRef.current !== null) clearTimeout(scrollTimerRef.current);
            scrollTimerRef.current = setTimeout(() => {
              if (scrollRef.current) saveScrollPos(notebookId, scrollRef.current.scrollTop);
            }, 300);
          }}
        >
          <EditorContent editor={editor} />
        </div>

        {showOutline && headings.length > 0 && (
          <OutlinePanel headings={headings} editorDom={editorDom} />
        )}
      </div>

      <div style={styles.statusBar} aria-live="polite" aria-atomic="true">
        <span style={styles.statusText(saveStatus !== 'idle')}>
          {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
        </span>
      </div>
    </div>
  );
}

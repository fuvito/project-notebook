import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import type { Editor } from '@tiptap/core';
import { getActiveTab } from '../browser/tabs.ts';

const INDIGO = '#4F46E5';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const TEXT_MUTED = '#6B7280';
const DANGER = '#DC2626';

const styles = {
  bar: {
    borderBottom: `1px solid ${BORDER}`,
    background: '#F8FAFC',
    padding: '0.625rem 0.875rem',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  barHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barTitle: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: TEXT_MUTED,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: TEXT_MUTED,
    padding: '0.125rem 0.25rem',
    borderRadius: '3px',
    lineHeight: 1,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.6875rem',
    color: TEXT_MUTED,
    width: '3rem',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: '0.8125rem',
    padding: '0.25rem 0.4rem',
    border: `1px solid ${BORDER}`,
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'inherit',
    color: TEXT,
    background: '#fff',
    minWidth: 0,
  },
  textarea: {
    flex: 1,
    fontSize: '0.8125rem',
    padding: '0.25rem 0.4rem',
    border: `1px solid ${BORDER}`,
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'inherit',
    color: TEXT,
    background: '#fff',
    minWidth: 0,
    resize: 'none' as const,
    height: '2.5rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '0.125rem',
  },
  cancelBtn: {
    background: 'none',
    border: `1px solid ${BORDER}`,
    borderRadius: '5px',
    padding: '0.3rem 0.75rem',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    color: TEXT_MUTED,
    fontFamily: 'inherit',
  },
  saveBtn: (disabled: boolean) => ({
    background: disabled ? '#C7D2FE' : INDIGO,
    border: 'none',
    borderRadius: '5px',
    padding: '0.3rem 0.875rem',
    fontSize: '0.8125rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: '#fff',
    fontFamily: 'inherit',
    fontWeight: 600,
  }),
  stateMsg: (isError: boolean) => ({
    fontSize: '0.8125rem',
    color: isError ? DANGER : TEXT_MUTED,
    padding: '0.25rem 0',
  }),
};

export interface CaptureBarProps {
  editor: Editor | null;
  onClose(): void;
}

export function CaptureBar({ editor, onClose }: CaptureBarProps) {
  const [status, setStatus] = useState<'loading' | 'form' | 'error'>('loading');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getActiveTab()
      .then((tab) => {
        if (!tab) { setStatus('error'); return; }
        setTitle(tab.title);
        setUrl(tab.url);
        setStatus('form');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    if (status === 'form') titleRef.current?.focus();
  }, [status]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();
    const trimmedDesc = description.trim();
    if (!trimmedTitle || !trimmedUrl || !editor) return;

    editor.chain()
      .focus('end')
      .insertContent({
        type: 'linkCard',
        attrs: {
          blockId: crypto.randomUUID(),
          url: trimmedUrl,
          title: trimmedTitle,
          savedAt: Date.now(),
          description: trimmedDesc || null,
        },
      })
      .scrollIntoView()
      .run();

    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  if (status === 'loading') {
    return (
      <div style={styles.bar}>
        <div style={styles.barHeader}>
          <span style={styles.barTitle}>Save tab</span>
          <button type="button" style={styles.closeBtn} onClick={onClose} aria-label="Cancel">✕</button>
        </div>
        <p style={styles.stateMsg(false)}>Reading tab…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={styles.bar}>
        <div style={styles.barHeader}>
          <span style={styles.barTitle}>Save tab</span>
          <button type="button" style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p style={styles.stateMsg(true)}>
          Can&apos;t capture this page — only http/https tabs are supported.
        </p>
      </div>
    );
  }

  const canSave = title.trim().length > 0 && url.trim().length > 0;

  return (
    <form style={styles.bar} onKeyDown={handleKeyDown} aria-label="Save tab" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div style={styles.barHeader}>
        <span style={styles.barTitle}>Save tab</span>
        <button type="button" style={styles.closeBtn} onClick={onClose} aria-label="Cancel">✕</button>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Title</span>
        <input
          ref={titleRef}
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Link title"
          maxLength={500}
        />
      </div>

      <div style={styles.row}>
        <span style={styles.label}>URL</span>
        <input
          style={styles.input}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Link URL"
          maxLength={2048}
        />
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Note</span>
        <textarea
          style={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description…"
          aria-label="Description"
          maxLength={5000}
        />
      </div>

      <div style={styles.actions}>
        <button type="button" style={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          style={styles.saveBtn(!canSave)}
          disabled={!canSave}
          aria-label="Save link to notebook"
        >
          Save link
        </button>
      </div>
    </form>
  );
}

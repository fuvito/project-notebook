import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import type { Notebook } from '../types/schema.ts';

// ── Styles ────────────────────────────────────────────────────────────────────

const INDIGO = '#4F46E5';
const INDIGO_DARK = '#4338CA';
const SURFACE = '#F9FAFB';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const TEXT_MUTED = '#6B7280';
const DANGER = '#DC2626';

const styles = {
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '168px',
    minWidth: '168px',
    height: '100%',
    background: SURFACE,
    borderRight: `1px solid ${BORDER}`,
    fontFamily: 'Inter Variable, Inter, sans-serif',
    fontSize: '0.8125rem',
    overflow: 'hidden',
  },
  collapsedStrip: {
    width: '28px',
    minWidth: '28px',
    height: '100%',
    background: SURFACE,
    borderRight: `1px solid ${BORDER}`,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingTop: '0.5rem',
    gap: '0.5rem',
    fontFamily: 'Inter Variable, Inter, sans-serif',
  },
  collapseBtn: {
    background: 'none',
    border: 'none',
    padding: '0.25rem 0.375rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
    color: '#374151',
    fontWeight: 600,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.625rem 0.75rem 0.375rem',
    flexShrink: 0,
  },
  headerLabel: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: TEXT_MUTED,
    textTransform: 'uppercase' as const,
  },
  addBtn: {
    background: '#EEF2FF',
    border: 'none',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
    color: INDIGO,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
  },
  createRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: '0.8125rem',
    padding: '0.25rem 0.375rem',
    border: `1px solid ${INDIGO}`,
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'inherit',
    minWidth: 0,
    color: TEXT,
    background: '#fff',
  },
  iconBtn: (danger = false) => ({
    background: 'none',
    border: 'none',
    padding: '0.125rem 0.25rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    color: danger ? DANGER : TEXT_MUTED,
    flexShrink: 0,
  }),
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    margin: 0,
    padding: '0.25rem 0',
    listStyle: 'none',
  },
  empty: {
    padding: '0.5rem 0.75rem',
    color: TEXT_MUTED,
    fontSize: '0.75rem',
    fontStyle: 'italic',
  },
  itemWrap: {
    position: 'relative' as const,
  },
  itemBtn: (selected: boolean) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    background: selected ? INDIGO : 'none',
    color: selected ? '#fff' : TEXT,
    border: 'none',
    padding: '0.375rem 0.75rem',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontFamily: 'inherit',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    paddingRight: '3rem',
  }),
  actions: (selected: boolean) => ({
    position: 'absolute' as const,
    right: '0.25rem',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: '0.125rem',
    color: selected ? 'rgba(255,255,255,0.8)' : TEXT_MUTED,
  }),
  actionBtn: (selected: boolean, danger = false) => ({
    background: 'none',
    border: 'none',
    padding: '0.15rem 0.25rem',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: selected ? (danger ? '#FCA5A5' : 'rgba(255,255,255,0.9)') : (danger ? DANGER : '#4B5563'),
    lineHeight: 1,
  }),
  confirmRow: {
    padding: '0.25rem 0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    background: '#FEF2F2',
    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },
  confirmText: {
    fontSize: '0.75rem',
    color: DANGER,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  confirmBtns: {
    display: 'flex',
    gap: '0.375rem',
  },
  confirmDeleteBtn: {
    background: DANGER,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.2rem 0.5rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  confirmCancelBtn: {
    background: 'none',
    color: TEXT_MUTED,
    border: `1px solid ${BORDER}`,
    borderRadius: '4px',
    padding: '0.2rem 0.5rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  renameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: '#EEF2FF',
    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
  },
  hoverHighlight: {
    background: '#F3F4F6',
  },
};

// ── NotebookItem ──────────────────────────────────────────────────────────────

interface NotebookItemProps {
  notebook: Notebook;
  selected: boolean;
  onSelect(): void;
  onRename(newTitle: string): void;
  onDelete(): void;
}

function NotebookItem({ notebook, selected, onSelect, onRename, onDelete }: NotebookItemProps) {
  const [hovered, setHovered] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      setRenameValue(notebook.title);
      renameRef.current?.focus();
      renameRef.current?.select();
    }
  }, [renaming, notebook.title]);

  const commitRename = () => {
    const t = renameValue.trim();
    if (t && t !== notebook.title) onRename(t);
    setRenaming(false);
  };

  const handleRenameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitRename();
    else if (e.key === 'Escape') setRenaming(false);
  };

  const showActions = hovered || selected;

  return (
    <li
      style={styles.itemWrap}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-current={selected ? 'page' : undefined}
        style={{
          ...styles.itemBtn(selected),
          ...(hovered && !selected ? styles.hoverHighlight : {}),
        }}
        onClick={onSelect}
      >
        {notebook.title}
      </button>

      {showActions && !renaming && !confirmingDelete && (
        <div style={styles.actions(selected)}>
          <button
            type="button"
            title="Rename"
            style={styles.actionBtn(selected)}
            onClick={(e) => { e.stopPropagation(); setRenaming(true); }}
            aria-label={`Rename "${notebook.title}"`}
          >
            ✎
          </button>
          <button
            type="button"
            title="Delete"
            style={styles.actionBtn(selected, true)}
            onClick={(e) => { e.stopPropagation(); setConfirmingDelete(true); }}
            aria-label={`Delete "${notebook.title}"`}
          >
            ✕
          </button>
        </div>
      )}

      {renaming && (
        <div style={styles.renameRow}>
          <input
            ref={renameRef}
            style={styles.input}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKey}
            onBlur={commitRename}
            aria-label="New notebook name"
            maxLength={200}
          />
          <button
            type="button"
            style={{ ...styles.iconBtn(), color: INDIGO_DARK, fontWeight: 700 }}
            onClick={commitRename}
            aria-label="Confirm rename"
          >
            ✓
          </button>
          <button
            type="button"
            style={styles.iconBtn()}
            onClick={() => setRenaming(false)}
            aria-label="Cancel rename"
          >
            ✕
          </button>
        </div>
      )}

      {confirmingDelete && (
        <div style={styles.confirmRow}>
          <span style={styles.confirmText} title={notebook.title}>
            Delete &quot;{notebook.title}&quot;?
          </span>
          <div style={styles.confirmBtns}>
            <button
              type="button"
              style={styles.confirmDeleteBtn}
              onClick={() => { setConfirmingDelete(false); onDelete(); }}
            >
              Delete
            </button>
            <button
              type="button"
              style={styles.confirmCancelBtn}
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// ── NotebookList ──────────────────────────────────────────────────────────────

export interface NotebookListProps {
  notebooks: Notebook[];
  selectedId: string | null;
  loading: boolean;
  onSelect(id: string): void;
  onCreate(title: string): Promise<void>;
  onRename(id: string, newTitle: string): Promise<void>;
  onDelete(id: string): Promise<void>;
  collapsed?: boolean;
  onToggleCollapse?(): void;
}

export function NotebookList({
  notebooks,
  selectedId,
  loading,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  collapsed = false,
  onToggleCollapse,
}: NotebookListProps) {
  const [creating, setCreating] = useState(false);
  const [createValue, setCreateValue] = useState('');
  const createRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) {
      setCreateValue('');
      createRef.current?.focus();
    }
  }, [creating]);

  const commitCreate = async () => {
    const t = createValue.trim();
    if (t) await onCreate(t);
    setCreating(false);
  };

  const handleCreateKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void commitCreate();
    else if (e.key === 'Escape') setCreating(false);
  };

  if (collapsed) {
    return (
      <div style={styles.collapsedStrip}>
        <button
          type="button"
          style={styles.collapseBtn}
          onClick={onToggleCollapse}
          aria-label="Show notebooks"
          title="Show notebooks"
        >
          ›
        </button>
      </div>
    );
  }

  return (
    <nav aria-label="Notebooks" style={styles.nav}>
      <div style={styles.header}>
        <span style={styles.headerLabel}>Notebooks</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            type="button"
            style={styles.collapseBtn}
            onClick={onToggleCollapse}
            aria-label="Hide sidebar"
            title="Hide sidebar"
          >
            ‹
          </button>
          <button
            type="button"
            style={styles.addBtn}
            onClick={() => setCreating(true)}
            aria-label="New notebook"
            title="New notebook"
            disabled={creating}
          >
            +
          </button>
        </div>
      </div>

      {creating && (
        <div style={styles.createRow}>
          <input
            ref={createRef}
            style={styles.input}
            value={createValue}
            onChange={(e) => setCreateValue(e.target.value)}
            onKeyDown={handleCreateKey}
            placeholder="Notebook name"
            aria-label="New notebook name"
            maxLength={200}
          />
          <button
            type="button"
            style={{ ...styles.iconBtn(), color: INDIGO_DARK, fontWeight: 700 }}
            onClick={() => void commitCreate()}
            aria-label="Confirm create"
          >
            ✓
          </button>
          <button
            type="button"
            style={styles.iconBtn()}
            onClick={() => setCreating(false)}
            aria-label="Cancel create"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <p style={styles.empty}>Loading…</p>
      ) : notebooks.length === 0 ? (
        <p style={styles.empty}>No notebooks yet.</p>
      ) : (
        <ul style={styles.list}>
          {notebooks.map((nb) => (
            <NotebookItem
              key={nb.id}
              notebook={nb}
              selected={nb.id === selectedId}
              onSelect={() => onSelect(nb.id)}
              onRename={(newTitle) => void onRename(nb.id, newTitle)}
              onDelete={() => void onDelete(nb.id)}
            />
          ))}
        </ul>
      )}
    </nav>
  );
}

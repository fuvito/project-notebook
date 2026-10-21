import { useState } from 'react';
import { NotebookList } from '../../components/NotebookList.tsx';
import { NotebookEditor } from '../../components/NotebookEditor.tsx';
import { useNotebooks } from '../../hooks/useNotebooks.ts';
import {
  isFullscreenMode,
  openFullscreenWindow,
  closeCurrentWindow,
} from '../../browser/windows.ts';

const fullscreen = isFullscreenMode();

const BORDER = '#E5E7EB';
const TEXT_MUTED = '#6B7280';

const styles = {
  root: (fs: boolean) => ({
    position: 'relative' as const,
    display: 'flex',
    width: fs ? '100vw' : '720px',
    height: fs ? '100vh' : '540px',
    fontFamily: 'Inter Variable, Inter, sans-serif',
    fontSize: '0.875rem',
    color: '#111827',
    overflow: 'hidden',
  }),
  placeholder: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9CA3AF',
    fontSize: '0.8125rem',
  },
  windowBtn: {
    position: 'absolute' as const,
    top: '4px',
    right: '5px',
    zIndex: 100,
    background: 'none',
    border: `1px solid ${BORDER}`,
    borderRadius: '4px',
    padding: '0.1rem 0.3rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
    lineHeight: 1,
    color: TEXT_MUTED,
    fontFamily: 'inherit',
    opacity: 0.7,
  },
};

export default function App() {
  const { notebooks, selectedId, loading, select, create, rename, remove } = useNotebooks();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleWindowToggle = () => {
    if (fullscreen) {
      closeCurrentWindow();
    } else {
      void openFullscreenWindow();
    }
  };

  return (
    <div style={styles.root(fullscreen)}>
      <NotebookList
        notebooks={notebooks}
        selectedId={selectedId}
        loading={loading}
        onSelect={select}
        onCreate={create}
        onRename={rename}
        onDelete={remove}
        collapsed={!sidebarOpen}
        onToggleCollapse={() => setSidebarOpen((v) => !v)}
      />

      {selectedId ? (
        <NotebookEditor key={selectedId} notebookId={selectedId} />
      ) : (
        <div style={styles.placeholder}>
          {loading ? 'Loading…' : 'Select a notebook or create one to get started.'}
        </div>
      )}

      <button
        type="button"
        style={styles.windowBtn}
        onClick={handleWindowToggle}
        title={fullscreen ? 'Restore to popup' : 'Open full screen'}
        aria-label={fullscreen ? 'Restore to popup' : 'Open full screen'}
      >
        {fullscreen ? '⤡' : '⤢'}
      </button>
    </div>
  );
}

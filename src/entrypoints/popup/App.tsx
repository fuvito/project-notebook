import { useCallback, useState } from 'react';
import {
  closeCurrentWindow,
  isFullscreenMode,
  openFullscreenWindow,
} from '../../browser/windows.ts';
import { NotebookEditor, type NotebookScrollTarget } from '../../components/NotebookEditor.tsx';
import { NotebookList } from '../../components/NotebookList.tsx';
import { SearchPanel } from '../../components/SearchPanel.tsx';
import { useNotebooks } from '../../hooks/useNotebooks.ts';

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
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9CA3AF',
    fontSize: '0.8125rem',
    gap: '0.5rem',
  },
  windowBtn: {
    background: 'none',
    border: `1px solid ${BORDER}`,
    borderRadius: '4px',
    padding: '0.1rem 0.3rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
    lineHeight: 1,
    color: TEXT_MUTED,
    fontFamily: 'inherit',
  },
};

export default function App() {
  const { notebooks, selectedId, loading, select, create, rename, remove } = useNotebooks();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [pendingScroll, setPendingScroll] = useState<NotebookScrollTarget | undefined>();

  const handleWindowToggle = () => {
    if (fullscreen) {
      closeCurrentWindow();
    } else {
      void openFullscreenWindow();
    }
  };

  const handleSelectResult = useCallback(
    (notebookId: string, scrollTo?: { query: string; blockType: NotebookScrollTarget['blockType']; occurrenceIndex: number; blockId: string }) => {
      select(notebookId);
      if (scrollTo) {
        setPendingScroll((prev) => ({ ...scrollTo, version: (prev?.version ?? 0) + 1 }));
      }
    },
    [select],
  );

  const handleScrolled = useCallback(() => setPendingScroll(undefined), []);

  return (
    <div style={styles.root(fullscreen)}>
      {searchActive ? (
        <SearchPanel
          onClose={() => setSearchActive(false)}
          onSelectResult={handleSelectResult}
        />
      ) : (
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
          onSearch={() => setSearchActive(true)}
        />
      )}

      {selectedId ? (
        <NotebookEditor
          key={selectedId}
          notebookId={selectedId}
          fullscreen={fullscreen}
          onToggleWindow={handleWindowToggle}
          scrollTarget={pendingScroll}
          onScrolled={handleScrolled}
        />
      ) : (
        <div style={styles.placeholder}>
          {loading ? 'Loading…' : 'Select a notebook or create one to get started.'}
          {!fullscreen && (
            <button
              type="button"
              style={styles.windowBtn}
              onClick={handleWindowToggle}
              title="Open full screen"
              aria-label="Open full screen"
            >
              ⤢ Full screen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

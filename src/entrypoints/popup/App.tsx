import { NotebookList } from '../../components/NotebookList.tsx';
import { useNotebooks } from '../../hooks/useNotebooks.ts';

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Inter Variable, Inter, sans-serif',
    fontSize: '0.875rem',
    color: '#111827',
    overflow: 'hidden',
    minWidth: '480px',
    minHeight: '400px',
  },
  content: {
    flex: 1,
    padding: '1.25rem 1.5rem',
    overflowY: 'auto' as const,
    background: '#fff',
  },
  placeholder: {
    color: '#9CA3AF',
    fontSize: '0.8125rem',
    marginTop: '0.5rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
    color: '#111827',
  },
};

export default function App() {
  const { notebooks, selectedId, loading, select, create, rename, remove } = useNotebooks();

  const selected = notebooks.find((nb) => nb.id === selectedId) ?? null;

  return (
    <div style={styles.root}>
      <NotebookList
        notebooks={notebooks}
        selectedId={selectedId}
        loading={loading}
        onSelect={select}
        onCreate={create}
        onRename={rename}
        onDelete={remove}
      />
      <main style={styles.content}>
        {selected ? (
          <>
            <h1 style={styles.title}>{selected.title}</h1>
            <p style={styles.placeholder}>Editor coming in Phase 3.</p>
          </>
        ) : (
          <p style={styles.placeholder}>
            {loading ? 'Loading…' : 'Select a notebook or create one to get started.'}
          </p>
        )}
      </main>
    </div>
  );
}

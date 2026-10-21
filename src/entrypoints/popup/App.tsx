import { NotebookList } from '../../components/NotebookList.tsx';
import { NotebookEditor } from '../../components/NotebookEditor.tsx';
import { useNotebooks } from '../../hooks/useNotebooks.ts';

const styles = {
  root: {
    display: 'flex',
    width: '720px',
    height: '540px',
    fontFamily: 'Inter Variable, Inter, sans-serif',
    fontSize: '0.875rem',
    color: '#111827',
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9CA3AF',
    fontSize: '0.8125rem',
  },
};

export default function App() {
  const { notebooks, selectedId, loading, select, create, rename, remove } = useNotebooks();

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

      {selectedId ? (
        <NotebookEditor key={selectedId} notebookId={selectedId} />
      ) : (
        <div style={styles.placeholder}>
          {loading ? 'Loading…' : 'Select a notebook or create one to get started.'}
        </div>
      )}
    </div>
  );
}

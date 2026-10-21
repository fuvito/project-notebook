import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotebookList } from './NotebookList.tsx';
import type { Notebook } from '../types/schema.ts';

function nb(id: string, title: string): Notebook {
  return { id, title, createdAt: 1000, updatedAt: 1000, content: { version: 1, blocks: [] } };
}

const baseProps = {
  notebooks: [nb('nb-a', 'Alpha'), nb('nb-b', 'Beta')],
  selectedId: 'nb-a',
  loading: false,
  onSelect: vi.fn(),
  onCreate: vi.fn().mockResolvedValue(undefined),
  onRename: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn().mockResolvedValue(undefined),
};

function setup(overrides: Partial<typeof baseProps> = {}) {
  const props = { ...baseProps, ...overrides };
  const user = userEvent.setup();
  render(<NotebookList {...props} />);
  return { user, props };
}

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('NotebookList rendering', () => {
  it('renders all notebook titles', () => {
    setup();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('marks the selected item with aria-current="page"', () => {
    setup();
    const alpha = screen.getByRole('button', { name: 'Alpha' });
    expect(alpha).toHaveAttribute('aria-current', 'page');
    const beta = screen.getByRole('button', { name: 'Beta' });
    expect(beta).not.toHaveAttribute('aria-current');
  });

  it('shows "Loading…" while loading', () => {
    setup({ loading: true, notebooks: [] });
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state when no notebooks', () => {
    setup({ notebooks: [], selectedId: null, loading: false });
    expect(screen.getByText('No notebooks yet.')).toBeInTheDocument();
  });

  it('has a nav landmark with accessible label', () => {
    setup();
    expect(screen.getByRole('navigation', { name: 'Notebooks' })).toBeInTheDocument();
  });
});

// ── Selection ─────────────────────────────────────────────────────────────────

describe('NotebookList selection', () => {
  it('calls onSelect when clicking a notebook', async () => {
    const onSelect = vi.fn();
    const { user } = setup({ onSelect });
    await user.click(screen.getByRole('button', { name: 'Beta' }));
    expect(onSelect).toHaveBeenCalledWith('nb-b');
  });
});

// ── Create ────────────────────────────────────────────────────────────────────

describe('NotebookList create', () => {
  it('shows create input after clicking "+"', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'New notebook' }));
    expect(screen.getByRole('textbox', { name: 'New notebook name' })).toBeInTheDocument();
  });

  it('calls onCreate and closes input on Enter', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const { user } = setup({ onCreate });
    await user.click(screen.getByRole('button', { name: 'New notebook' }));
    const input = screen.getByRole('textbox', { name: 'New notebook name' });
    await user.type(input, 'My New Notebook{Enter}');
    expect(onCreate).toHaveBeenCalledWith('My New Notebook');
    expect(screen.queryByRole('textbox', { name: 'New notebook name' })).not.toBeInTheDocument();
  });

  it('cancels create on Escape', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'New notebook' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox', { name: 'New notebook name' })).not.toBeInTheDocument();
  });

  it('calls onCreate when confirm button is clicked', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const { user } = setup({ onCreate });
    await user.click(screen.getByRole('button', { name: 'New notebook' }));
    await user.type(screen.getByRole('textbox', { name: 'New notebook name' }), 'X');
    await user.click(screen.getByRole('button', { name: 'Confirm create' }));
    expect(onCreate).toHaveBeenCalledWith('X');
  });
});

// ── Rename ────────────────────────────────────────────────────────────────────

describe('NotebookList rename', () => {
  it('shows rename input when rename button is clicked', async () => {
    const { user } = setup();
    await user.hover(screen.getByRole('button', { name: 'Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Rename "Alpha"' }));
    expect(screen.getByRole('textbox', { name: 'New notebook name' })).toBeInTheDocument();
  });

  it('calls onRename with new title on Enter', async () => {
    const onRename = vi.fn().mockResolvedValue(undefined);
    const { user } = setup({ onRename });
    await user.hover(screen.getByRole('button', { name: 'Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Rename "Alpha"' }));
    const input = screen.getByRole('textbox', { name: 'New notebook name' });
    await user.clear(input);
    await user.type(input, 'Alpha Renamed{Enter}');
    expect(onRename).toHaveBeenCalledWith('nb-a', 'Alpha Renamed');
  });

  it('cancels rename on Escape', async () => {
    const { user } = setup();
    await user.hover(screen.getByRole('button', { name: 'Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Rename "Alpha"' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox', { name: 'New notebook name' })).not.toBeInTheDocument();
  });
});

// ── Delete ────────────────────────────────────────────────────────────────────

describe('NotebookList delete', () => {
  it('shows confirmation when delete button is clicked', async () => {
    const { user } = setup();
    await user.hover(screen.getByRole('button', { name: 'Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Delete "Alpha"' }));
    expect(screen.getByText(/Delete "Alpha"/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onDelete when confirming deletion', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const { user } = setup({ onDelete });
    await user.hover(screen.getByRole('button', { name: 'Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Delete "Alpha"' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith('nb-a');
  });

  it('dismisses confirmation on Cancel', async () => {
    const { user } = setup();
    await user.hover(screen.getByRole('button', { name: 'Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Delete "Alpha"' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });
});


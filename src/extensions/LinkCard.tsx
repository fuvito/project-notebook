import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { openUrl } from '../browser/tabs.ts';

const INDIGO = '#4F46E5';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const TEXT_MUTED = '#6B7280';
const SURFACE = '#F8FAFC';

function LinkCardView({ node, deleteNode, selected }: NodeViewProps) {
  const { url, title, savedAt, description } = node.attrs as {
    url: string;
    title: string;
    savedAt: number;
    description: string | null;
  };

  const domain = (() => {
    try { return new URL(url).hostname; } catch { return url; }
  })();

  const savedDate = new Date(savedAt as number).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <NodeViewWrapper>
      <div
        contentEditable={false}
        data-drag-handle
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.625rem',
          padding: '0.625rem 0.75rem',
          margin: '0.25rem 0',
          background: SURFACE,
          border: `1px solid ${selected ? INDIGO : BORDER}`,
          borderLeft: `3px solid ${INDIGO}`,
          borderRadius: '6px',
          cursor: 'default',
          userSelect: 'none',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            type="button"
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              padding: 0,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: TEXT,
              textDecoration: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onClick={(e) => { e.stopPropagation(); openUrl(url); }}
            title={url}
          >
            {title}
          </button>
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: INDIGO,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: '0.125rem',
            }}
          >
            {domain}
          </span>
          {description && (
            <p
              style={{
                fontSize: '0.75rem',
                color: TEXT_MUTED,
                margin: '0.25rem 0 0',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              } as React.CSSProperties}
            >
              {description}
            </p>
          )}
          <span style={{ fontSize: '0.6875rem', color: TEXT_MUTED, marginTop: '0.25rem', display: 'block' }}>
            Saved {savedDate}
          </span>
        </div>
        <button
          type="button"
          onClick={deleteNode}
          aria-label="Remove link"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.125rem',
            color: TEXT_MUTED,
            fontSize: '0.75rem',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>
    </NodeViewWrapper>
  );
}

export const LinkCardExtension = Node.create({
  name: 'linkCard',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      blockId: { default: null },
      url: { default: '' },
      title: { default: '' },
      savedAt: { default: 0 },
      description: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="link-card"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'link-card' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkCardView);
  },
});

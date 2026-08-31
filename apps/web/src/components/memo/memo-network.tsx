import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import type { Memo, MemoTag } from "@repo/shared";
import { formatDate } from "@/lib/format";
import { TAG_META, TAG_ORDER } from "@/lib/tag-meta";
import { TagIcon } from "./tag-icon";

type TagNodeData = {
  tag: MemoTag;
  count: number;
  expanded: boolean;
};

type MemoNodeData = {
  memo: Memo;
  onDelete: (id: string) => void;
};

type TagFlowNode = Node<TagNodeData, "tag">;
type MemoFlowNode = Node<MemoNodeData, "memo">;
type FlowNode = TagFlowNode | MemoFlowNode;

function TagNode({ data }: NodeProps<TagFlowNode>) {
  const meta = TAG_META[data.tag];

  return (
    <div
      className={`flex min-w-[130px] cursor-pointer select-none flex-col items-center gap-1.5 rounded-xl border border-border px-5 py-4 ${meta.className}`}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-transparent !bg-transparent"
      />
      <Handle
        type="source"
        position={Position.Top}
        className="!border-transparent !bg-transparent"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!border-transparent !bg-transparent"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!border-transparent !bg-transparent"
      />
      <div className="flex size-11 items-center justify-center rounded-xl bg-pure-white">
        <TagIcon name={meta.icon} className="size-5" />
      </div>
      <p className="text-body-sm font-semibold">{meta.label}</p>
      <span className="rounded-full bg-pure-white px-2 py-0.5 text-[10px] font-semibold text-ink-black/40">
        {data.count}件
      </span>
      <div className="mt-0.5 flex items-center gap-0.5 text-[9px] font-medium opacity-70">
        {data.expanded ? (
          <>
            <ChevronUp className="size-3" /> 折りたたむ
          </>
        ) : (
          <>
            <ChevronDown className="size-3" /> 展開
          </>
        )}
      </div>
    </div>
  );
}

function MemoNode({ data }: NodeProps<MemoFlowNode>) {
  const { memo, onDelete } = data;
  const meta = TAG_META[memo.tag];

  return (
    <div className="group relative w-[220px] cursor-grab rounded-xl border border-border bg-pure-white p-3 active:cursor-grabbing">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1 !w-1 !border-transparent !bg-transparent"
      />

      <div className="mb-2 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.className}`}
        >
          {meta.hashtag}
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-[9px] font-medium text-ink-black/40">
          <Clock className="size-2.5" />
          {formatDate(memo.createdAt)}
        </span>
      </div>

      <p className="line-clamp-3 break-words text-[11px] leading-relaxed text-ink-black/60">
        {memo.content}
      </p>

      {memo.url && (
        <a
          href={memo.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="mt-2 flex items-center gap-1 text-[10px] text-notion-blue"
        >
          <ExternalLink className="size-3 shrink-0" />
          <span className="max-w-[180px] truncate">{memo.url}</span>
        </a>
      )}

      {memo.mediaType === "image" && (
        <div className="mt-2 flex h-16 items-center justify-center rounded-lg border border-border bg-paper-warmth">
          <ImageIcon className="size-5 text-ink-black/20" />
        </div>
      )}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(memo.id);
        }}
        className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border border-border bg-pure-white text-ink-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-coral/10 hover:text-coral"
        aria-label="削除"
      >
        <span className="text-xs font-bold">×</span>
      </button>
    </div>
  );
}

const nodeTypes = { tag: TagNode, memo: MemoNode };

const TAG_POSITIONS: Record<MemoTag, { x: number; y: number }> = {
  tweet: { x: 0, y: 0 },
  tech: { x: 500, y: 0 },
  other: { x: 250, y: 400 },
};

const TAG_EDGE_COLORS: Record<MemoTag, string> = {
  tweet: "#62aef0",
  tech: "#0075de",
  other: "#757575",
};

const TAG_MEMO_WIDTH = 220;
const TAG_MEMO_OFFSET_X = TAG_MEMO_WIDTH / 2;
const TAG_MEMO_OFFSET_Y = 40;

function getMemoPosition(
  index: number,
  total: number,
  center: { x: number; y: number },
): { x: number; y: number } {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  const ringIndex = Math.floor(index / 8);
  const radius = 200 + ringIndex * 100;
  return {
    x: center.x + Math.cos(angle) * radius - TAG_MEMO_OFFSET_X,
    y: center.y + Math.sin(angle) * radius - TAG_MEMO_OFFSET_Y,
  };
}

export function MemoNetwork({
  memos,
  onDelete,
}: {
  memos: Memo[];
  onDelete: (id: string) => void;
}) {
  const [expandedTags, setExpandedTags] = useState<Set<MemoTag>>(new Set());

  const toggleTag = useCallback((tag: MemoTag) => {
    setExpandedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const onNodeClick: NodeMouseHandler<FlowNode> = useCallback(
    (_event, node) => {
      if (node.type === "tag") toggleTag(node.data.tag);
    },
    [toggleTag],
  );

  const { nodes, edges } = useMemo(() => {
    const tagNodes: TagFlowNode[] = TAG_ORDER.map((tag) => ({
      id: `tag-${tag}`,
      type: "tag",
      position: TAG_POSITIONS[tag],
      data: {
        tag,
        count: memos.filter((memo) => memo.tag === tag).length,
        expanded: expandedTags.has(tag),
      },
      draggable: false,
      selectable: false,
    }));

    const memoNodes: MemoFlowNode[] = [];
    const flowEdges: Edge[] = [];

    for (const tag of TAG_ORDER) {
      if (!expandedTags.has(tag)) continue;
      const tagMemos = memos.filter((memo) => memo.tag === tag);
      const center = TAG_POSITIONS[tag];

      tagMemos.forEach((memo, index) => {
        memoNodes.push({
          id: memo.id,
          type: "memo",
          position: getMemoPosition(index, tagMemos.length, center),
          data: { memo, onDelete },
          draggable: true,
        });
        flowEdges.push({
          id: `e-${tag}-${memo.id}`,
          source: `tag-${tag}`,
          target: memo.id,
          type: "smoothstep",
          style: {
            stroke: TAG_EDGE_COLORS[tag],
            strokeWidth: 1.5,
            opacity: 0.5,
          },
        });
      });
    }

    return { nodes: [...tagNodes, ...memoNodes], edges: flowEdges };
  }, [memos, onDelete, expandedTags]);

  return (
    <div className="relative h-[calc(100vh-280px)] min-h-[400px] overflow-hidden rounded-xl border border-border bg-pure-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        nodesDraggable
        elementsSelectable
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(0,0,0,0.08)"
        />
        <Controls
          className="!rounded-xl !border !border-border !bg-pure-white !shadow-none"
          showInteractive={false}
        />
        <MiniMap
          className="!rounded-xl !border !border-border !bg-pure-white !shadow-none"
          nodeColor={(node) => {
            if (node.type === "tag") {
              return TAG_EDGE_COLORS[(node.data as TagNodeData).tag];
            }
            return "#f6f5f4";
          }}
          pannable
          zoomable
        />
      </ReactFlow>
      {expandedTags.size === 0 && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-xl border border-border bg-pure-white px-4 py-2 text-caption font-medium text-ink-black/60">
          タグノードをクリックするとメモが展開されます
        </div>
      )}
    </div>
  );
}

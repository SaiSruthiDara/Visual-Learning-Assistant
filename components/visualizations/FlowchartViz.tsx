import React, { useMemo } from 'react';
import type { FlowchartSlideData, FlowchartNode } from '../../types';

interface FlowchartVizProps {
  slide: FlowchartSlideData;
}

const NODE_WIDTH = 150;
const NODE_HEIGHT = 60;
const VERTICAL_SPACING = 70;
const HORIZONTAL_SPACING = 50;

const ARROW_HEAD_ID = 'arrow-head';

export const FlowchartViz: React.FC<FlowchartVizProps> = ({ slide }) => {
  const layout = useMemo(() => {
    const nodes = slide.nodes || [];
    const edges = slide.edges || [];

    if (nodes.length === 0) {
      return { nodes: [], edges: [], width: 0, height: 0 };
    }

    // 1. Build graph structure (adjacency lists, in-degrees)
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const nodeMap = new Map<string, FlowchartNode>();

    nodes.forEach(node => {
      adj.set(node.id, []);
      inDegree.set(node.id, 0);
      nodeMap.set(node.id, node);
    });

    edges.forEach(edge => {
      adj.get(edge.from)?.push(edge.to);
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    });

    // 2. Assign ranks/layers using a topological sort approach
    const ranks: string[][] = [];
    let queue = nodes.filter(node => inDegree.get(node.id) === 0).map(n => n.id);
    const currentInDegree = new Map(inDegree);

    while (queue.length > 0) {
      ranks.push([...queue]);
      const nextQueue: string[] = [];
      for (const u of queue) {
        for (const v of (adj.get(u) || [])) {
          currentInDegree.set(v, (currentInDegree.get(v) || 0) - 1);
          if (currentInDegree.get(v) === 0) {
            nextQueue.push(v);
          }
        }
      }
      queue = nextQueue;
    }

    // 3. Calculate positions
    const positionedNodes: (FlowchartNode & { x: number; y: number })[] = [];
    const nodePositions = new Map<string, { x: number; y: number }>();

    const maxRankWidth = Math.max(0, ...ranks.map(rank => rank.length));
    const totalWidth = maxRankWidth * NODE_WIDTH + (maxRankWidth - 1) * HORIZONTAL_SPACING;
    const totalHeight = ranks.length * NODE_HEIGHT + (ranks.length - 1) * VERTICAL_SPACING;

    ranks.forEach((rank, rankIndex) => {
      const y = rankIndex * (NODE_HEIGHT + VERTICAL_SPACING);
      const rankWidth = rank.length * NODE_WIDTH + (rank.length - 1) * HORIZONTAL_SPACING;
      const startX = (totalWidth - rankWidth) / 2;

      rank.forEach((nodeId, nodeIndex) => {
        const x = startX + nodeIndex * (NODE_WIDTH + HORIZONTAL_SPACING);
        const node = nodeMap.get(nodeId)!;
        const pos = { ...node, x, y };
        positionedNodes.push(pos);
        nodePositions.set(nodeId, { x, y });
      });
    });

    const calculatedEdges = edges.map(edge => {
      const fromNodePos = nodePositions.get(edge.from);
      const toNodePos = nodePositions.get(edge.to);
      if (!fromNodePos || !toNodePos) return null;

      return {
        ...edge,
        x1: fromNodePos.x + NODE_WIDTH / 2,
        y1: fromNodePos.y + NODE_HEIGHT,
        x2: toNodePos.x + NODE_WIDTH / 2,
        y2: toNodePos.y,
        labelX: (fromNodePos.x + toNodePos.x + NODE_WIDTH) / 2 + 5,
        labelY: (fromNodePos.y + toNodePos.y + NODE_HEIGHT) / 2,
      };
    }).filter(e => e !== null);

    return { nodes: positionedNodes, edges: calculatedEdges, width: totalWidth, height: totalHeight };

  }, [slide.nodes, slide.edges]);

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <h2 className="text-xl lg:text-2xl font-bold text-center mb-4 text-gray-200">{slide.title}</h2>
      <div className="flex-grow flex items-center justify-center">
         <svg
            viewBox={`-20 -20 ${layout.width + 40} ${layout.height + 40}`}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <marker id={ARROW_HEAD_ID} viewBox="0 -5 10 10" refX="5" refY="0" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,-5L10,0L0,5" fill="#9f7aea" />
              </marker>
            </defs>

            {layout.edges.map((edge, i) => (
              <g key={`edge-${i}`}>
                <line
                  x1={edge!.x1}
                  y1={edge!.y1}
                  x2={edge!.x2}
                  y2={edge!.y2 - 7}
                  stroke="#6b7280"
                  strokeWidth="2"
                  markerEnd={`url(#${ARROW_HEAD_ID})`}
                />
                {edge!.label && (
                   <text x={edge!.labelX} y={edge!.labelY} fontSize="12" fill="#d1d5db" textAnchor="middle">
                     {edge!.label}
                   </text>
                )}
              </g>
            ))}
            
            {layout.nodes.map(node => (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx="10" fill="#2d3748" stroke="#9f7aea" strokeWidth="2" />
                <foreignObject x="5" y="5" width={NODE_WIDTH-10} height={NODE_HEIGHT-10}>
                    <div className="w-full h-full flex items-center justify-center text-center">
                        <p className="text-sm font-bold text-e5e7eb leading-tight" style={{ color: '#e5e7eb' }}>{node.label}</p>
                    </div>
                </foreignObject>
              </g>
            ))}
         </svg>
      </div>
    </div>
  );
};
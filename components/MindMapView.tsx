import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Handle,
  Position
} from 'reactflow';
import { MindMapNodeRaw, MindMapEdgeRaw } from '../types';

interface MindMapViewProps {
  nodesRaw: MindMapNodeRaw[];
  edgesRaw: MindMapEdgeRaw[];
}

// Custom Node to ensure good styling
const CustomNode = ({ data }: { data: { label: string } }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-indigo-200 text-center min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-16 !bg-indigo-500" />
      <div className="font-bold text-slate-700">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-indigo-500" />
    </div>
  );
};

// Simple auto-layout algorithm for a tree structure
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const nodeWidth = 200;
  const nodeHeight = 80;
  
  // Group by level (conceptually)
  // Since we don't have explicit levels, we'll try a simple hierarchical approach
  // Root is usually the source of edges but not a target
  
  const targets = new Set(edges.map(e => e.target));
  const sources = new Set(edges.map(e => e.source));
  
  // Find roots (nodes that are not targets of any edge)
  const roots = nodes.filter(n => !targets.has(n.id));
  if (roots.length === 0 && nodes.length > 0) {
      // If circular or messy, pick the first one as root
      roots.push(nodes[0]);
  }

  const levels: Record<string, number> = {};
  const queue: {id: string, level: number}[] = roots.map(r => ({ id: r.id, level: 0 }));
  const visited = new Set<string>();

  // BFS to assign levels
  while(queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      levels[id] = level;

      const outgoing = edges.filter(e => e.source === id);
      for(const edge of outgoing) {
          queue.push({ id: edge.target, level: level + 1 });
      }
  }
  
  // If some nodes weren't visited (disconnected), put them at level 0
  nodes.forEach(n => {
      if (levels[n.id] === undefined) levels[n.id] = 0;
  });

  // Calculate positions
  const levelGroups: Record<number, Node[]> = {};
  nodes.forEach(n => {
      const lvl = levels[n.id];
      if(!levelGroups[lvl]) levelGroups[lvl] = [];
      levelGroups[lvl].push(n);
  });

  const layoutedNodes = nodes.map(node => {
      const level = levels[node.id];
      const nodesInLevel = levelGroups[level];
      const indexInLevel = nodesInLevel.findIndex(n => n.id === node.id);
      const totalInLevel = nodesInLevel.length;
      
      // Center the row
      const startX = -((totalInLevel - 1) * (nodeWidth + 50)) / 2;
      
      return {
          ...node,
          position: {
              x: startX + indexInLevel * (nodeWidth + 50),
              y: level * (nodeHeight + 100),
          }
      };
  });

  return { nodes: layoutedNodes, edges };
};

const MindMapView: React.FC<MindMapViewProps> = ({ nodesRaw, edgesRaw }) => {
  
  const { initialNodes, initialEdges } = useMemo(() => {
    const flowNodes: Node[] = nodesRaw.map((n) => ({
      id: n.id,
      type: 'custom', 
      position: { x: 0, y: 0 }, // Will be computed
      data: { label: n.label },
    }));

    const flowEdges: Edge[] = edgesRaw.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1' },
    }));

    const layout = getLayoutedElements(flowNodes, flowEdges);
    return { initialNodes: layout.nodes, initialEdges: layout.edges };
  }, [nodesRaw, edgesRaw]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div className="h-[600px] w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default MindMapView;
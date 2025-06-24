import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { 
    Controls, 
    Background, 
    applyNodeChanges, 
    applyEdgeChanges, 
    Node, 
    Edge, 
    NodeChange, 
    EdgeChange 
} from 'reactflow';
import 'reactflow/dist/style.css';

import { getSegmentLineage } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LineageGraphProps {
  segmentId: string;
}

export const LineageGraph: React.FC<LineageGraphProps> = ({ segmentId }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  useEffect(() => {
    const fetchLineage = async () => {
      try {
        setIsLoading(true);
        const response = await getSegmentLineage(segmentId);
        const { nodes: apiNodes, edges: apiEdges } = response.data.data;
        setNodes(apiNodes);
        setEdges(apiEdges);
      } catch (err) {
        console.error(err);
        setError('Failed to load segment lineage.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLineage();
  }, [segmentId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div style={{ height: '500px' }} className="border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

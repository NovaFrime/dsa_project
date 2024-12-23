import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useToast } from '@/hooks/use-toast';

const PrerequisitesPage: React.FC = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const requestInProgress = useRef(false);
    const { toast } = useToast();

    const onConnect = useCallback(
        (params: any) => setEdges((eds: any) => addEdge(params, eds)),
        [setEdges]
    );

    useEffect(() => {
        let isMounted = true;

        const fetchCourses = async () => {
            if (requestInProgress.current) return;
            requestInProgress.current = true;

            try {
                const userCredentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');

                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/prerequisites`, {
                    username: userCredentials.account,
                    Edusoft_password: userCredentials.edusoftPassword,
                });

                const nodes = response.data.nodes.map((node: any) => ({
                    id: node.id,
                    position: { x: 100, y: 100 },
                    data: {
                        label: node.label,
                        ...node.data,
                    },
                }));

                const edges = response.data.edges.map((edge: any) => ({
                    id: `${edge.from}-${edge.to}`,
                    source: edge.from,
                    target: edge.to,
                    label: edge.label +" "+ edge.data.requiredSubjectName,
                    
                }));

                setNodes(nodes);
                setEdges(edges);
                if(response){
                    const masterNode = {
                        id: 'master-node', 
                        position: { x: 0, y: -100 }, 
                        data: { label: userCredentials.account }, 
                        type: 'default',
                    };
                    const columns = 5;
                    const newNodes = nodes.map((node:any, index:any) => {
                        const x = (index % columns) * 200; 
                        const y = Math.floor(index / columns) * 100; 
                        return {
                            ...node,
                            position: { x, y },
                        };
                    });
                    setNodes(newNodes);
                    setNodes((prevNodes) => [masterNode, ...prevNodes]);
                }
                if (isMounted) {
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to fetch data');
                    setLoading(false);
                    toast({
                        title: 'Error',
                        description: 'Failed to fetch courses.',
                        variant: 'destructive',
                    });
                }
            } finally {
                requestInProgress.current = false;
            }
        };

        fetchCourses();
        return () => {
            isMounted = false;
        };
    }, [toast]);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            >
                <MiniMap />
                <Controls />
                <Background />
            </ReactFlow>

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
        </div>
    );
};

export default PrerequisitesPage;

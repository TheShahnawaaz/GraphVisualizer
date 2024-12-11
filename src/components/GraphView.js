// src/components/GraphView.js

import React, { useEffect, useState } from 'react';
import { getGraphById, updateGraph } from '../services/api';
import { useParams } from 'react-router-dom';
import {
  Typography,
  CircularProgress,
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import CytoscapeComponent from 'react-cytoscapejs';

const GraphView = () => {
  const { id } = useParams();
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedGraph, setEditedGraph] = useState(null);

  const fetchGraph = async () => {
    try {
      const response = await getGraphById(id);
      if (response) {
        setGraph(response);
        setEditedGraph(response);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching graph:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [id]);

  // Handle changes in edge fields
  const handleEdgeChange = (index, field, value) => {
    const updatedEdges = [...editedGraph.edgeList];
    updatedEdges[index] = { ...updatedEdges[index], [field]: value };
    setEditedGraph({ ...editedGraph, edgeList: updatedEdges });
  };

  // Add a new edge
  const handleAddEdge = () => {
    const newEdge =
      editedGraph.weightType === 'weighted'
        ? { source: '1', target: '1', weight: 1 }
        : { source: '1', target: '1' };
    setEditedGraph({
      ...editedGraph,
      edgeList: [...editedGraph.edgeList, newEdge],
    });
  };

  // Remove an edge
  const handleRemoveEdge = (index) => {
    const updatedEdges = [...editedGraph.edgeList];
    updatedEdges.splice(index, 1);
    setEditedGraph({ ...editedGraph, edgeList: updatedEdges });
  };

  // Save changes to the graph
  const handleSave = async () => {
    // Validation
    for (let edge of editedGraph.edgeList) {
      if (
        edge.source === '' ||
        edge.target === '' ||
        (editedGraph.weightType === 'weighted' && edge.weight === '')
      ) {
        alert('All edge fields are required.');
        return;
      }

      const sourceNum = Number(edge.source);
      const targetNum = Number(edge.target);
      if (
        isNaN(sourceNum) ||
        isNaN(targetNum) ||
        sourceNum < 1 ||
        sourceNum > editedGraph.nodes ||
        targetNum < 1 ||
        targetNum > editedGraph.nodes
      ) {
        alert(
          `Edge sources and targets must be numbers between 1 and ${editedGraph.nodes}.`
        );
        return;
      }
    }

    // Ensure node count is at least 1
    if (editedGraph.nodes < 1) {
      alert('Node count must be at least 1.');
      return;
    }

    // Prepare graph data
    const graphData = {
      graphType: editedGraph.graphType,
      weightType: editedGraph.weightType,
      nodes: editedGraph.nodes,
      edges: editedGraph.edgeList.length,
      edgeList: editedGraph.edgeList.map((edge) => ({
        source: parseInt(edge.source, 10),
        target: parseInt(edge.target, 10),
        weight:
          editedGraph.weightType === 'weighted'
            ? parseFloat(edge.weight)
            : 1,
      })),
    };

    try {
      const updated = await updateGraph(id, graphData);
      setGraph(updated);
      setEditedGraph(updated);
      setEditing(false);
      alert('Graph updated successfully!');
    } catch (error) {
      console.error('Error updating graph:', error);
      alert('Failed to update graph.');
    }
  };

  // Handle changes in node count
  const handleNodeCountChange = (value) => {
    let newNodeCount = parseInt(value, 10);
    if (isNaN(newNodeCount) || newNodeCount < 1) {
      alert('Node count must be a positive integer.');
      return;
    }

    // Adjust edgeList to remove edges referencing non-existent nodes
    const filteredEdges = editedGraph.edgeList.filter(
      (edge) =>
        Number(edge.source) <= newNodeCount &&
        Number(edge.target) <= newNodeCount
    );

    setEditedGraph({
      ...editedGraph,
      nodes: newNodeCount,
      edgeList: filteredEdges,
    });
  };

  // Handle changes in graph type (directed/undirected)
  const handleGraphTypeChange = (value) => {
    setEditedGraph({ ...editedGraph, graphType: value });
  };

  // Handle changes in weight type (weighted/unweighted)
  const handleWeightTypeChange = (value) => {
    let updatedEdgeList = editedGraph.edgeList;
    if (value === 'unweighted') {
      // Remove weight from all edges
      updatedEdgeList = updatedEdgeList.map(({ source, target }) => ({
        source,
        target,
      }));
    } else {
      // Add default weight to all edges
      updatedEdgeList = updatedEdgeList.map((edge) => ({
        ...edge,
        weight: edge.weight || 1,
      }));
    }
    setEditedGraph({
      ...editedGraph,
      weightType: value,
      edgeList: updatedEdgeList,
    });
  };

  // Generate Cytoscape elements based on current graph state
  const generateElements = () => {
    if (!editedGraph && !graph) return [];

    const currentGraph = editing ? editedGraph : graph;

    if (!currentGraph) return [];

    const nodes = Array.from({ length: currentGraph.nodes }, (_, i) => ({
      data: { id: (i + 1).toString(), label: (i + 1).toString() },
    }));

    const edges = currentGraph.edgeList.map((edge, index) => ({
      data: {
        id: `e${index}`,
        source: edge.source.toString(),
        target: edge.target.toString(),
        label:
          currentGraph.weightType === 'weighted'
            ? edge.weight.toString()
            : '',
      },
    }));

    return [...nodes, ...edges];
  };

  // Define Cytoscape layout and styles
  const layout = { name: 'cose', animate: false };
  const stylesheet = [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'background-color': '#0074D9',
        color: '#ffffff',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '12px',
        width: '30px',
        height: '30px',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': '#B3B3B3',
        'target-arrow-color':
          editing && editedGraph.graphType === 'directed'
            ? '#B3B3B3'
            : '#B3B3B3',
        'curve-style': 'bezier',
        label: 'data(label)',
        'font-size': '10px',
        'text-rotation': 'autorotate',
        'target-arrow-shape':
          editing && editedGraph.graphType === 'directed'
            ? 'triangle'
            : 'none',
        'arrow-scale':
          editing && editedGraph.graphType === 'directed' ? 1.5 : 0.1,
        color: '#000000',
      },
    },
    {
      selector: ':selected',
      style: {
        'background-color': '#FF4136',
        'line-color': '#FF413B',
        'target-arrow-color': '#FF4136',
      },
    },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!graph) {
    return (
      <Box p={3}>
        <Typography variant="h6">Graph not found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} marginBottom={10} style={{ height: '100vh', overflow: 'hidden' }}>
      <Grid item xs={9} style={{ height: '100%', padding: '20px' }}>
        <CytoscapeComponent
          elements={generateElements()}
          style={{ width: '100%', height: '100%', border: '1px solid #ccc', borderRadius: '8px' }}
          layout={layout}
          stylesheet={stylesheet}
        />
      </Grid>
      <Grid
        item
        xs={3}
        style={{ height: '100%', overflowY: 'auto', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}
      >
        {editing ? (
          <Box>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold', color: '#333' }}>
              Edit Graph
            </Typography>
            <Divider />
            <Box mt={2}>
              <Grid container spacing={2}>
                {/* Graph Type */}
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Graph Type"
                    value={editedGraph.graphType}
                    onChange={(e) => handleGraphTypeChange(e.target.value)}
                    fullWidth
                    variant="outlined"
                  >
                    <MenuItem value="undirected">Undirected</MenuItem>
                    <MenuItem value="directed">Directed</MenuItem>
                  </TextField>
                </Grid>
                {/* Weight Type */}
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Weight Type"
                    value={editedGraph.weightType}
                    onChange={(e) => handleWeightTypeChange(e.target.value)}
                    fullWidth
                    variant="outlined"
                  >
                    <MenuItem value="unweighted">Unweighted</MenuItem>
                    <MenuItem value="weighted">Weighted</MenuItem>
                  </TextField>
                </Grid>
                {/* Number of Nodes */}
                <Grid item xs={12}>
                  <TextField
                    label="Number of Nodes"
                    value={editedGraph.nodes}
                    onChange={(e) => handleNodeCountChange(e.target.value)}
                    fullWidth
                    type="number"
                    inputProps={{ min: 1 }}
                    variant="outlined"
                  />
                </Grid>
                {/* Edge List */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Edges
                  </Typography>
                  {editedGraph.edgeList.map((edge, index) => (
                    <Grid
                      container
                      spacing={1}
                      alignItems="center"
                      key={index}
                      style={{ marginBottom: '8px' }}
                    >
                      <Grid item xs={4}>
                        <TextField
                          label="Source"
                          value={edge.source}
                          onChange={(e) =>
                            handleEdgeChange(index, 'source', e.target.value)
                          }
                          fullWidth
                          type="number"
                          inputProps={{ min: 1, max: editedGraph.nodes }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Target"
                          value={edge.target}
                          onChange={(e) =>
                            handleEdgeChange(index, 'target', e.target.value)
                          }
                          fullWidth
                          type="number"
                          inputProps={{ min: 1, max: editedGraph.nodes }}
                          variant="outlined"
                        />
                      </Grid>
                      {editedGraph.weightType === 'weighted' && (
                        <Grid item xs={3}>
                          <TextField
                            label="Weight"
                            value={edge.weight}
                            onChange={(e) =>
                              handleEdgeChange(index, 'weight', e.target.value)
                            }
                            fullWidth
                            type="number"
                            inputProps={{ step: '0.1' }}
                            variant="outlined"
                          />
                        </Grid>
                      )}
                      <Grid item xs={editedGraph.weightType === 'weighted' ? 1 : 2}>
                        <IconButton
                          color="secondary"
                          onClick={() => handleRemoveEdge(index)}
                        >
                          <RemoveCircle />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddEdge}
                    startIcon={<AddCircle />}
                    fullWidth
                    style={{ marginTop: '10px' }}
                  >
                    Add Edge
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <Box mt={3} display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                color="success"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold', color: '#333' }}>
              Graph Details
            </Typography>
            <Divider />
            <Box mt={2}>
              <Typography>
                <strong>ID:</strong> {graph.id}
              </Typography>
              <Typography>
                <strong>Type:</strong> {graph.graphType}
              </Typography>
              <Typography>
                <strong>Weight:</strong> {graph.weightType}
              </Typography>
              <Typography>
                <strong>Nodes:</strong> {graph.nodes}
              </Typography>
              <Typography>
                <strong>Edges:</strong> {graph.edges}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setEditing(true)}
                fullWidth
              >
                Edit Graph
              </Button>
            </Box>
  
           <Box mt={4} display="flex" flexDirection="column" alignItems="flex-start" bgcolor="#f9f9f9" p={2} borderRadius={2} boxShadow={1}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Edge List:</Typography>
              <List dense={true}>
                {graph.edgeList.map((edge, index) => (
                  <ListItem key={index} disableRipple sx={{ bgcolor: '#ffffff', borderRadius: 1, mb: 1, '&:hover': { bgcolor: '#e0e0e0' } }}>
                    <ListItemText primary={`${edge.source} - ${edge.target}${graph.weightType === 'weighted' ? ` (${edge.weight})` : ''}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default GraphView;

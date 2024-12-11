// src/components/GraphCreate.js

import React, { useState } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  Paper,
  Grid,
  IconButton,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import { createGraph } from '../services/api';
import { useNavigate } from 'react-router-dom';

const GraphCreate = () => {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState('form'); // 'form' or 'text'

  // Form-based input state
  const [graphType, setGraphType] = useState('undirected');
  const [weightType, setWeightType] = useState('unweighted');
  const [nodes, setNodes] = useState(5);
  const [edges, setEdges] = useState(6);
  const [edgeList, setEdgeList] = useState([
    { source: '', target: '', weight: 1 },
  ]);

  // Text-based input state
  const [textInput, setTextInput] = useState('');

  const handleEdgeChange = (index, field, value) => {
    const updatedEdges = [...edgeList];
    updatedEdges[index][field] = value;
    setEdgeList(updatedEdges);
  };

  const handleAddEdge = () => {
    setEdgeList([...edgeList, { source: '', target: '', weight: 1 }]);
  };

  const handleRemoveEdge = (index) => {
    const updatedEdges = [...edgeList];
    updatedEdges.splice(index, 1);
    setEdgeList(updatedEdges);
  };

  const handleInputModeChange = (event, newValue) => {
    setInputMode(newValue);
  };

  const parseTextInput = () => {
    const lines = textInput.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      throw new Error('Input is empty');
    }

    // Parse the first line for nodes and edges
    const [nodesCountStr, edgesCountStr] = lines[0].trim().split(/\s+/);
    const nodesCount = parseInt(nodesCountStr, 10);
    const edgesCount = parseInt(edgesCountStr, 10);

    if (isNaN(nodesCount) || isNaN(edgesCount)) {
      throw new Error('First line must contain valid numbers for nodes and edges');
    }

    const edgeLines = lines.slice(1);
    const isWeighted = edgeLines[0].trim().split(/\s+/).length === 3;

    const parsedEdgeList = [];
    let maxNode = 0;

    edgeLines.forEach((line, index) => {
      const parts = line.trim().split(/\s+/);
      if (isWeighted) {
        if (parts.length !== 3) {
          throw new Error(`Invalid format in line ${index + 2} for weighted graph`);
        }
        const [sourceStr, targetStr, weightStr] = parts;
        const source = parseInt(sourceStr, 10);
        const target = parseInt(targetStr, 10);
        const weight = parseFloat(weightStr);
        if (isNaN(source) || isNaN(target) || isNaN(weight)) {
          throw new Error(`Invalid numbers in line ${index + 2}`);
        }
        parsedEdgeList.push({ source, target, weight });
        maxNode = Math.max(maxNode, source, target);
      } else {
        if (parts.length !== 2) {
          throw new Error(`Invalid format in line ${index + 2} for unweighted graph`);
        }
        const [sourceStr, targetStr] = parts;
        const source = parseInt(sourceStr, 10);
        const target = parseInt(targetStr, 10);
        if (isNaN(source) || isNaN(target)) {
          throw new Error(`Invalid numbers in line ${index + 2}`);
        }
        parsedEdgeList.push({ source, target, weight: 1 });
        maxNode = Math.max(maxNode, source, target);
      }
    });

    if (parsedEdgeList.length !== edgesCount) {
      throw new Error(`Number of edges provided (${parsedEdgeList.length}) does not match the specified count (${edgesCount})`);
    }

    if (maxNode > nodesCount) {
      throw new Error(`Node index exceeds the specified number of nodes (${nodesCount})`);
    }

    return {
      graphType, // Assume default or set via a dropdown
      weightType: isWeighted ? 'weighted' : 'unweighted',
      nodes: nodesCount,
      edges: edgesCount,
      edgeList: parsedEdgeList,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let graphData = {};

    if (inputMode === 'form') {
      // Validation
      for (let edge of edgeList) {
        if (!edge.source || !edge.target) {
          alert('All edge fields are required.');
          return;
        }
        if (graphType === 'directed' && edge.source === edge.target) {
          alert('No self-loops allowed in directed graphs.');
          return;
        }
        if (graphType === 'undirected' && edge.source === edge.target) {
          alert('No self-loops allowed in undirected graphs.');
          return;
        }
      }

      // Determine if weighted based on weightType
      graphData = {
        graphType,
        weightType,
        nodes,
        edges: edgeList.length,
        edgeList: edgeList.map((edge) => ({
          source: parseInt(edge.source, 10),
          target: parseInt(edge.target, 10),
          weight: weightType === 'weighted' ? parseFloat(edge.weight) : 1,
        })),
      };
    } else if (inputMode === 'text') {
      try {
        const parsedGraph = parseTextInput();
        graphData = parsedGraph;
      } catch (error) {
        alert(`Error parsing input: ${error.message}`);
        return;
      }
    }

    try {
      const response = await createGraph(graphData);
      console.log('Created Graph:', response);
      alert('Graph created successfully!');
      navigate(`/graphs/${response.id}`);
    } catch (error) {
      console.error('Error creating graph:', error);
      alert('Failed to create graph.');
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '30px', borderRadius: '10px', backgroundColor: '#f5f5f5' }}>
      <Typography variant="h4" align="center" gutterBottom style={{ color: '#3f51b5' }}>
        Create New Graph
      </Typography>
      <Tabs
        value={inputMode}
        onChange={handleInputModeChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        style={{ marginBottom: '20px', borderBottom: '2px solid #3f51b5' }}
      >
        <Tab label="Form Input" value="form" />
        <Tab label="Text Input" value="text" />
      </Tabs>
      <form onSubmit={handleSubmit}>
        {inputMode === 'form' && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Graph Type"
                value={graphType}
                onChange={(e) => setGraphType(e.target.value)}
                fullWidth
                required
                variant="outlined"
                style={{ marginBottom: '15px' }}
              >
                <MenuItem value="undirected">Undirected</MenuItem>
                <MenuItem value="directed">Directed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Weight Type"
                value={weightType}
                onChange={(e) => setWeightType(e.target.value)}
                fullWidth
                required
                variant="outlined"
                style={{ marginBottom: '15px' }}
              >
                <MenuItem value="unweighted">Unweighted</MenuItem>
                <MenuItem value="weighted">Weighted</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Number of Nodes"
                value={nodes}
                onChange={(e) => setNodes(parseInt(e.target.value, 10))}
                fullWidth
                required
                inputProps={{ min: 1 }}
                variant="outlined"
                style={{ marginBottom: '15px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Number of Edges"
                value={edges}
                onChange={(e) => setEdges(parseInt(e.target.value, 10))}
                fullWidth
                required
                inputProps={{ min: 1 }}
                variant="outlined"
                style={{ marginBottom: '15px' }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" style={{ marginBottom: '10px', color: '#3f51b5' }}>Edge List</Typography>
            </Grid>
            {edgeList.map((edge, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Source"
                    value={edge.source}
                    onChange={(e) =>
                      handleEdgeChange(index, 'source', e.target.value)
                    }
                    fullWidth
                    required
                    type="number"
                    inputProps={{ min: 1, max: nodes }}
                    variant="outlined"
                    style={{ marginBottom: '15px' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Target"
                    value={edge.target}
                    onChange={(e) =>
                      handleEdgeChange(index, 'target', e.target.value)
                    }
                    fullWidth
                    required
                    type="number"
                    inputProps={{ min: 1, max: nodes }}
                    variant="outlined"
                    style={{ marginBottom: '15px' }}
                  />
                </Grid>
                {weightType === 'weighted' && (
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Weight"
                      value={edge.weight}
                      onChange={(e) =>
                        handleEdgeChange(index, 'weight', e.target.value)
                      }
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: 0 }}
                      variant="outlined"
                      style={{ marginBottom: '15px' }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={1} style={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    color="secondary"
                    onClick={() => handleRemoveEdge(index)}
                    disabled={edgeList.length === 1}
                  >
                    <RemoveCircle />
                  </IconButton>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddEdge}
                startIcon={<AddCircle />}
                style={{ marginTop: '15px' }}
              >
                Add Edge
              </Button>
            </Grid>
          </Grid>
        )}

        {inputMode === 'text' && (
          <Box>
            <TextField
              label="Graph Input"
              placeholder={`For Unweighted Graph:
nodes edges
source target
source target
...

For Weighted Graph:
nodes edges
source target weight
source target weight
...`}
              multiline
              rows={10}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              variant="outlined"
              fullWidth
              required
              style={{ marginBottom: '20px' }}
            />
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                <strong>Unweighted Graph Format:</strong>
                <pre>{`nodes edges
source target
source target
...`}</pre>
                <strong>Weighted Graph Format:</strong>
                <pre>{`nodes edges
source target weight
source target weight
...`}</pre>
              </Typography>
            </Box>
          </Box>
        )}

        <Grid container spacing={3} style={{ marginTop: '20px' }}>
          <Grid item xs={12} align="center">
            <Button variant="contained" color="success" type="submit" style={{ padding: '10px 20px' }}>
              Create Graph
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default GraphCreate;

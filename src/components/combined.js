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
} from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import { createGraph } from '../services/api';
import { useNavigate } from 'react-router-dom';

const GraphCreate = () => {
  const navigate = useNavigate();
  const [graphType, setGraphType] = useState('undirected');
  const [weightType, setWeightType] = useState('unweighted');
  const [nodes, setNodes] = useState(5);
  const [edges, setEdges] = useState(6);
  const [edgeList, setEdgeList] = useState([
    { source: '', target: '', weight: 1 },
  ]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const graphData = {
      graphType,
      weightType,
      nodes,
      edges: edgeList.length,
      edgeList: edgeList.map((edge) => ({
        source: parseInt(edge.source),
        target: parseInt(edge.target),
        weight: weightType === 'weighted' ? parseFloat(edge.weight) : 1,
      })),
    };

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
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Create New Graph
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Graph Type"
              value={graphType}
              onChange={(e) => setGraphType(e.target.value)}
              fullWidth
              required
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
              onChange={(e) => setNodes(parseInt(e.target.value))}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              label="Number of Edges"
              value={edges}
              onChange={(e) => setEdges(parseInt(e.target.value))}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Edge List</Typography>
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
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={1}>
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
            >
              Add Edge
            </Button>
          </Grid>
          <Grid item xs={12} align="center">
            <Button variant="contained" color="success" type="submit">
              Create Graph
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default GraphCreate;
// src/components/GraphList.js
import React, { useEffect, useState } from 'react';
import { getGraphs, deleteGraph } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';

const GraphList = () => {
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGraphs = async () => {
    try {
      const response = await getGraphs();
      setGraphs(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching graphs:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
      try {
          console.log("Deleting ", id);
      await deleteGraph(id);
      setGraphs(graphs.filter((graph) => graph.id !== id));
    } catch (error) {
      console.error('Error deleting graph:', error);
    }
  };

  useEffect(() => {
    fetchGraphs();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <TableContainer component={Paper}>
      <Typography variant="h4" align="center" gutterBottom>
        All Graphs
      </Typography>
      <Table aria-label="graphs table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Weight</TableCell>
            <TableCell>Nodes</TableCell>
            <TableCell>Edges</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {graphs && graphs.length > 0 ? (
            graphs.map((graph) => (
              <TableRow key={graph.id}>
                <TableCell>{graph.id}</TableCell>
                <TableCell>{graph.graphType}</TableCell>
                <TableCell>{graph.weightType}</TableCell>
                <TableCell>{graph.nodes}</TableCell>
                <TableCell>{graph.edges}</TableCell>
                <TableCell>{new Date(graph.id).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`/graphs/${graph.id}`}
                    style={{ marginRight: '10px' }}
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(graph.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No graphs found. <Link to="/create">Create one!</Link>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GraphList;
// src/components/GraphView.js
import React, { useEffect, useState } from 'react';
import { getGraphById } from '../services/api';
import { useParams } from 'react-router-dom';
import {
  Typography,
  CircularProgress,
  Paper,
  Box,
} from '@mui/material';
import CytoscapeComponent from 'react-cytoscapejs';

const GraphView = () => {
  const { id } = useParams();
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGraph = async () => {
    try {
      const response = await getGraphById(id);
      setGraph(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching graph:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!graph) {
    return <Typography variant="h6">Graph not found.</Typography>;
  }

  // Prepare Cytoscape elements only if graph is available
  const elements = graph.edgeList && graph.edgeList.length > 0 ? [
    ...graph.edgeList.map((edge, index) => ({
      data: {
        id: `e${index}`,
        source: edge.source.toString(),
        target: edge.target.toString(),
        label: graph.weightType === 'weighted' ? edge.weight.toString() : '',
      },
    })),
    ...Array.from({ length: graph.nodes }, (_, i) => ({
      data: { id: (i + 1).toString(), label: (i + 1).toString() },
    })),
  ] : [];

  // Define Cytoscape layout and stylesheet
  const layout = { name: 'cose', animate: false };
  const stylesheet = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'background-color': '#0074D9',
        'color': '#ffffff',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '12px',
        'width': '30px',
        'height': '30px',
      },
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#B3B3B3',
        'target-arrow-color': graph.graphType === 'directed' ? '#B3B3B3' : '#B3B3B3',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '10px',
        'text-rotation': 'autorotate',
        'target-arrow-shape': graph.graphType === 'directed' ? 'triangle' : 'none',
        'arrow-scale': graph.graphType === 'directed' ? 1.5 : 0.1,
        'text-margin-y': -10,
        'color': '#000000',
        'background-color': '#ffffff',
        'text-background-color': '#ffffff',
        'text-background-opacity': 1,
        'text-background-padding': 3,
        'text-background-shape': 'roundrectangle',
      },
    },
    {
      selector: ':selected',
      style: {
        'background-color': '#FF4136',
        'line-color': '#FF4136',
        'target-arrow-color': '#FF4136',
        'source-arrow-color': '#FF4136',
      },
    },
  ];

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Graph Details
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h6">Graph ID: {graph._id}</Typography>
        <Typography variant="h6">Type: {graph.graphType}</Typography>
        <Typography variant="h6">Weight: {graph.weightType}</Typography>
        <Typography variant="h6">Nodes: {graph.nodes}</Typography>
        <Typography variant="h6">Edges: {graph.edges}</Typography>
        <Typography variant="h6">
          Created At: {new Date(graph.id).toLocaleString()}
        </Typography>
      </Paper>
      
      {/* Render CytoscapeComponent only if elements are defined */}
      {elements.length > 0 && (
        <CytoscapeComponent
          elements={elements}
          style={{ width: '100%', height: '600px' }}
          layout={layout}
          stylesheet={stylesheet}
        />
      )}
    </Box>
  );
};

export default GraphView;
// src/components/Navbar.js
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <Box sx={{ flexGrow: 1, marginBottom: '20px' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Graph Visualizer
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/create">
            Create Graph
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;





// src/services/api.js

// Helper function to get graphs from local storage
const getGraphsFromLocalStorage = () => {
  const graphs = localStorage.getItem('graphs');
  return graphs ? JSON.parse(graphs) : [];
};

// Helper function to save graphs to local storage
const saveGraphsToLocalStorage = (graphs) => {
  localStorage.setItem('graphs', JSON.stringify(graphs));
};

// Create a new graph
export const createGraph = (graphData) => {
  const graphs = getGraphsFromLocalStorage();
  const newGraph = { id: Date.now(), ...graphData }; // Assign a unique ID based on timestamp
  graphs.push(newGraph);
  saveGraphsToLocalStorage(graphs);
  return newGraph; // Return the newly created graph
};

// Get all graphs
export const getGraphs = () => {
  return getGraphsFromLocalStorage(); // Return all graphs from local storage
};

// Get a single graph by ID
export const getGraphById = (id) => {
    const graphs = getGraphsFromLocalStorage();
    console.log(id);
    console.log(graphs);
    // Convert id to a number for comparison
    return graphs.find(graph => graph.id === Number(id)); // Find and return the graph by ID
};

// Delete a graph by ID
export const deleteGraph = (id) => {
  let graphs = getGraphsFromLocalStorage();
  graphs = graphs.filter(graph => graph.id !== Number(id)); // Filter out the graph to be deleted
  saveGraphsToLocalStorage(graphs); // Save the updated graphs back to local storage
};





// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GraphList from './components/GraphList';
import GraphView from './components/GraphView';
import GraphCreate from './components/GraphCreate';
import { Container } from '@mui/material';

function App() {
  return (
    <Router>
      <Navbar />
      <Container>
        <Routes>
          <Route path="/" element={<GraphList />} />
          <Route path="/create" element={<GraphCreate />} />
          <Route path="/graphs/:id" element={<GraphView />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

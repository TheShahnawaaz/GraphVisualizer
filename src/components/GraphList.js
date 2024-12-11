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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const GraphList = () => {
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [graphToDelete, setGraphToDelete] = useState(null);

  useEffect(() => {
    const fetchGraphs = async () => {
      const data = await getGraphs();
      setGraphs(data);
      setLoading(false);
    };
    fetchGraphs();
  }, []);

  const handleDelete = (graph) => {
    setGraphToDelete(graph);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (graphToDelete) {
      await deleteGraph(graphToDelete.id);
      setGraphs(graphs.filter((g) => g.id !== graphToDelete.id));
      setDeleteDialogOpen(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setGraphToDelete(null);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <TableContainer component={Paper} elevation={3} sx={{ marginTop: '20px' }} marginBottom={10}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ paddingTop: '20px', fontWeight: 'bold', color: '#0074D9' }}
      >
        All Graphs
      </Typography>
      <Table aria-label="graphs table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Weight</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Nodes</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Edges</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {graphs && graphs.length > 0 ? (
            graphs.map((graph) => (
              <TableRow key={graph.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <TableCell>{graph.id}</TableCell>
                <TableCell>{graph.graphType}</TableCell>
                <TableCell>{graph.weightType}</TableCell>
                <TableCell>{graph.nodes}</TableCell>
                <TableCell>{graph.edges}</TableCell>
                <TableCell>
                  {new Date(graph.id).toLocaleString()}
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`/graphs/${graph.id}`}
                    sx={{ marginRight: '10px' }}
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(graph)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 'bold', color: '#FF4136' }}>
          Delete Graph
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the graph with ID{' '}
            {graphToDelete && graphToDelete.id}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default GraphList;

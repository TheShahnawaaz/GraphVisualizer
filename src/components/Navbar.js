// src/components/Navbar.js

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useLocation } from 'react-router-dom';
import { Home, AddCircle } from '@mui/icons-material';

const Navbar = () => {
  const location = useLocation();

  return (
    <Box sx={{ flexGrow: 1, marginBottom: '20px' }}>
      <AppBar position="static" sx={{ backgroundColor: '#0074D9' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: '1px' }}>
            Graph Visualizer
          </Typography>
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<Home />}
            sx={{
              textDecoration: location.pathname === '/' ? 'underline' : 'none',
              color: location.pathname === '/' ? '#FFD700' : 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFD700',
              },
              transition: '0.3s',
              marginRight: '15px',
            }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/create"
            startIcon={<AddCircle />}
            sx={{
              textDecoration: location.pathname === '/create' ? 'underline' : 'none',
              color: location.pathname === '/create' ? '#FFD700' : 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFD700',
              },
              transition: '0.3s',
            }}
          >
            Create Graph
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;

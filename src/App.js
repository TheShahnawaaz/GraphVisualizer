// src/App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import GraphList from './components/GraphList';
import GraphView from './components/GraphView';
import GraphCreate from './components/GraphCreate';
import Footer from './components/Footer';
import { Container } from '@mui/material';

const App = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'Graph Visualizer'; // Default title

    switch (path) {
      case '/':
        title = 'All Graphs';
        break;
      case '/create':
        title = 'Create New Graph';
        break;
      default:
        if (path.startsWith('/graphs/')) {
          title = 'Graph Details';
        }
        break;
    }

    document.title = title; // Set the document title
  }, [location]);

  return (
    <>
      <Navbar />
      <Container>
        <Routes>
          <Route path="/" element={<GraphList />} />
          <Route path="/create" element={<GraphCreate />} />
          <Route path="/graphs/:id" element={<GraphView />} />
        </Routes>
      </Container>
      <Footer />
    </>
  );
};

export default App;

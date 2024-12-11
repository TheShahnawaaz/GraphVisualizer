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
  return new Promise((resolve, reject) => {
    try {
      const graphs = getGraphsFromLocalStorage();
      const newGraph = { id: Date.now(), ...graphData };
      graphs.push(newGraph);
      saveGraphsToLocalStorage(graphs);
      resolve(newGraph);
    } catch (error) {
      reject(error);
    }
  });
};

// Get all graphs
export const getGraphs = () => {
  return new Promise((resolve, reject) => {
    try {
      const graphs = getGraphsFromLocalStorage();
      resolve(graphs);
    } catch (error) {
      reject(error);
    }
  });
};

// Get a single graph by ID
export const getGraphById = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const graphs = getGraphsFromLocalStorage();
      const graph = graphs.find((graph) => graph.id === Number(id));
      resolve(graph);
    } catch (error) {
      reject(error);
    }
  });
};

// Update a graph by ID
export const updateGraph = (id, updatedData) => {
  return new Promise((resolve, reject) => {
    try {
      let graphs = getGraphsFromLocalStorage();
      const index = graphs.findIndex((graph) => graph.id === Number(id));
      if (index === -1) {
        reject(new Error('Graph not found'));
        return;
      }
      // Ensure nodesList is present
      if (!updatedData.nodesList) {
        updatedData.nodesList = [];
        for (let i = 1; i <= updatedData.nodes; i++) {
          updatedData.nodesList.push({
            id: i,
            label: `Node ${i}`,
            color: '#0074D9', // default color
          });
        }
      }
      graphs[index] = { ...graphs[index], ...updatedData };
      saveGraphsToLocalStorage(graphs);
      resolve(graphs[index]);
    } catch (error) {
      reject(error);
    }
  });
};

// Delete a graph by ID
export const deleteGraph = (id) => {
  return new Promise((resolve, reject) => {
    try {
      let graphs = getGraphsFromLocalStorage();
      graphs = graphs.filter((graph) => graph.id !== Number(id));
      saveGraphsToLocalStorage(graphs);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

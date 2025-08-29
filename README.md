# Graph Visualizer

Graph Visualizer is a React application for building and exploring graphs right in the browser. It supports directed or undirected and weighted or unweighted graphs and renders them with an interactive Cytoscape canvas.

## Features

- **Create graphs** using a form or by pasting edge lists in text form so you can quickly prototype different structures.
- **Store graphs in the browser**; all data lives in `localStorage` so graphs persist between sessions.
- **Browse saved graphs** in a table with metadata and options to view or delete individual items.
- **Visualize and edit** existing graphs, adding or removing edges and updating node counts with instant feedback.

## Tech Stack

- React & React Router
- Material UI for the interface
- Cytoscape.js and react-cytoscapejs for graph rendering
- Browser `localStorage` for persistence

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```

### Development
Run the development server and open [http://localhost:3000](http://localhost:3000):
```bash
npm start
```

### Tests
Execute the test suite:
```bash
npm test
```

### Production Build
Generate an optimized build for deployment:
```bash
npm run build
```

## Project Structure
```
src/
  components/   # React components (GraphList, GraphCreate, GraphView, Navbar, Footer)
  services/     # Graph persistence helpers
  theme.js      # Material UI theme
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
Distributed under the MIT License.

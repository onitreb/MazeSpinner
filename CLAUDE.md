# MazeSpinner Project Guidelines

## Project Structure
- `index.html` - Rectangular maze implementation
- `circular.html` - Circular maze implementation  
- `landing.html` - Main navigation page
- `rect.html` - Backup of rectangular implementation

## Running the Project
- Open `landing.html` in a browser to access both maze types
- Direct browser access to individual maze HTML files also works

## Code Style Guidelines
- HTML5 structure with embedded JavaScript and CSS
- Matter.js physics engine for simulation
- Grid-based maze generation with various algorithms
- ES6+ JavaScript features and camelCase naming
- Local function declarations for modular code organization
- Physics parameters configured via UI sliders for interactive tuning

## Development Principles
- Follow DRY (Don't Repeat Yourself) principles
- Maintain consistent UI controls between implementations
- Use clear variable naming for physics parameters
- Optimize rendering for smooth physics performance
- Handle mobile/desktop event controls consistently
- Implement proper cleanup when switching mazes

## Maze Generation Algorithms
- Recursive Backtracker (default)
- Kruskal's Algorithm
- Prim's Algorithm
- Binary Tree Algorithm
# MazeSpinner

A physics-based maze generator with support for both rectangular and circular mazes.

## Overview

MazeSpinner is a web-based application that generates interactive mazes using the Matter.js physics engine. The project features both traditional rectangular grid mazes and polar-coordinate circular mazes.

## Features

- **Multiple Maze Types**: Generate both rectangular and circular mazes
- **Physics Simulation**: Realistic ball physics with Matter.js
- **Interactive Controls**: Rotate mazes using keyboard or touch controls
- **Multiple Algorithms**: Support for different maze generation algorithms:
  - Recursive Backtracker
  - Kruskal's Algorithm
  - Prim's Algorithm
- **Customization**: Configure maze parameters (size, rings, sectors, etc.)
- **Smooth Curved Walls**: Circular mazes feature properly curved walls

## Project Structure

The project has been modularized using ES6 modules for better organization and maintainability:

```
MazeSpinner/
├── js/
│   ├── common/           - Shared functionality
│   ├── circular/         - Circular maze specific code
│   ├── rect/             - Rectangular maze specific code
│   └── main.js           - Entry point
├── circular-modular.html - Circular maze implementation
├── rect.html             - Rectangular maze implementation
└── landing.html          - Main landing page
```

## Technical Implementation

### Circular Maze Generation

The circular maze uses a polar grid structure:
- Concentric rings radiating from the center
- Each ring divided into sectors (pie slices)
- Adaptive sector count for outer rings to maintain consistent cell sizes
- Curved walls implemented using multiple small segments

### Physics Integration

- Matter.js provides the physics simulation
- Maze rotation implemented by changing gravity direction
- Custom rendering functions for smooth visualization
- Configurable physics properties (friction, restitution, etc.)

## Getting Started

1. Open `landing.html` in a web browser to access both maze types
2. Select the desired maze type (circular or rectangular)
3. Configure maze parameters (rings, sectors, algorithm)
4. Generate a new maze
5. Use arrow keys or on-screen controls to rotate the maze

## Development

The project uses vanilla JavaScript with ES6 modules and features:
- No external dependencies other than Matter.js
- Clean code organization following SOLID principles
- Separation of concerns for easy maintenance

## Status and Roadmap

- [x] Modularized circular maze implementation
- [x] Smooth curved walls for circular mazes
- [x] Mobile-friendly controls
- [ ] Complete rectangular maze modernization
- [ ] Add more maze generation algorithms
- [ ] Add gameplay elements (time challenge, collectibles)
- [ ] Implement maze saving/loading
- [ ] Add additional visual themes

## References

The project was inspired by and draws implementation ideas from:
- [Mazes for Programmers](https://pragprog.com/titles/jbmaze/mazes-for-programmers/) by Jamis Buck
- [codebox/mazes](https://github.com/codebox/mazes) GitHub project
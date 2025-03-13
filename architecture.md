# MazeSpinner Architecture Documentation

## Overview

MazeSpinner is a physics-based maze game that features both rectangular and circular mazes. The project has been modularized following SOLID principles to improve maintainability and extendability.

## Project Structure

```
MazeSpinner/
├── js/
│   ├── common/
│   │   ├── controls.js   - Handles user input and controls
│   │   ├── engine.js     - Physics engine setup and management
│   │   └── utils.js      - Shared utility functions
│   ├── circular/
│   │   ├── grid.js       - Circular grid creation and management
│   │   └── algorithms.js - Maze generation algorithms for circular grids
│   ├── rect/
│   │   ├── grid.js       - Rectangular grid creation and management
│   │   └── algorithms.js - Maze generation algorithms for rectangular grids
│   └── main.js           - Entry point and application initialization
├── circular-modular.html - Modular implementation of circular maze
├── circular-simple.html  - Simplified standalone implementation for testing
├── circular.html         - Original monolithic circular maze implementation
├── rect.html             - Rectangular maze implementation
└── landing.html          - Main navigation page
```

## Key Components

### 1. Grid Modules

#### Circular Grid (`js/circular/grid.js`)
- Creates a polar grid structure with rings and sectors
- Handles adaptive sector scaling (more sectors in outer rings)
- Provides conversion between polar and Cartesian coordinates
- Creates physics bodies for walls with smooth curved appearance

#### Rectangular Grid (`js/rect/grid.js`)
- Creates a traditional rectangular grid
- Provides coordinate conversion and wall creation

### 2. Algorithm Modules

#### Circular Algorithms (`js/circular/algorithms.js`)
- Implements maze generation algorithms adapted for circular grids:
  - Recursive Backtracker
  - Kruskal's Algorithm
  - Prim's Algorithm
- Handles special neighbor relationships in circular grids

#### Rectangular Algorithms (`js/rect/algorithms.js`)
- Implements maze generation algorithms for rectangular grids

### 3. Common Modules

#### Physics Engine (`js/common/engine.js`)
- Initializes and manages Matter.js physics engine
- Handles rendering and simulation
- Provides maze rotation functionality
- Manages gravity and physics bodies

#### Controls (`js/common/controls.js`)
- Manages user input (keyboard, touch, mouse)
- Handles control events for maze rotation and ball reset
- Implements event listeners and bindings

#### Utilities (`js/common/utils.js`)
- Provides shared helper functions
- Implements common algorithms (shuffling, random selection)
- Contains math utilities for coordinates and angles

### 4. Main Controller (`js/main.js`)
- Entry point for the application
- Coordinates between modules
- Initializes the appropriate maze type
- Manages configuration and state

## Technical Details

### Circular Maze Implementation

The circular maze uses a polar grid with several key techniques:

1. **Adaptive Sector Scaling**: Outer rings have more sectors than inner rings to maintain consistent cell sizes
   ```javascript
   const sectors = Math.max(6, Math.floor((r+1) * sectorsInOuterRing / rings));
   ```

2. **Curved Wall Rendering**: Curved walls are created using multiple small straight segments
   ```javascript
   // For each arc section, create multiple small segments
   for (let i = 0; i < segments; i++) {
       const segStartAngle = startAngle + i * segmentAngleSize;
       const segEndAngle = segStartAngle + segmentAngleSize;
       
       // Create a small segment at the right position and angle
       const wall = Bodies.rectangle(
           (x1 + x2) / 2, (y1 + y2) / 2,
           distance, wallThickness,
           { angle: segMidAngle + Math.PI / 2, ... }
       );
   }
   ```

3. **Neighbor Connections**: Special handling for connecting cells between rings with different sector counts
   ```javascript
   // When finding neighbors in inner/outer rings
   const innerRatio = innerRingSectorCount / totalSectors;
   const innerSector = Math.floor(s * innerRatio);
   ```

4. **Wall Removal Logic**: Removes walls between connected cells with special handling for circular connections
   ```javascript
   // For circular connections
   switch (direction) {
       case 'inner':
           current.inner = false;
           neighbor.outer = false;
           break;
       // ...
   }
   ```

### Physics Integration

The project uses Matter.js for physics simulation:

1. **Wall Bodies**: Walls are created as static rectangle bodies
2. **Ball Physics**: The ball has mass, friction, and restitution properties
3. **Maze Rotation**: Implemented by changing gravity direction
4. **Rendering Optimization**: Custom rendering functions scale and position the maze

## Design Principles

The modularized architecture follows these principles:

1. **Single Responsibility**: Each module has a specific responsibility
2. **Open/Closed**: New maze types or algorithms can be added without modifying existing code
3. **Interface Segregation**: Clean interfaces between components
4. **Dependency Inversion**: High-level modules depend on abstractions, not details

## Next Steps

1. Complete the rectangular maze modernization using similar techniques
2. Implement module version handling for easy upgrades
3. Add additional maze generation algorithms
4. Enhance user interface with more controls and options
5. Optimize performance for larger mazes
6. Add gameplay elements (timer, collectibles, etc.)
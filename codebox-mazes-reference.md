# Codebox Mazes Project Reference

## Project Structure
The Codebox Mazes project (https://github.com/codebox/mazes) is organized with a modular architecture:

```
mazes/
├── css/
├── images/
├── js/
│   ├── lib/
│   │   ├── algorithms.js
│   │   ├── constants.js
│   │   ├── drawingSurfaces.js
│   │   ├── main.js
│   │   ├── random.js
│   │   └── shapes.js
│   ├── config.js
│   ├── main.js
│   ├── model.js
│   ├── stateMachine.js
│   └── view.js
├── index.html
└── notes.txt
```

## Architecture
The project uses a clean separation of concerns with:

1. **Model-View Architecture** - Distinct separation between data (model.js) and display (view.js)
2. **State Machine** - Controls application flow (stateMachine.js)
3. **ES6 Modules** - Uses import/export for code organization
4. **Shape Abstractions** - Different maze shapes share common interfaces
5. **Algorithm Abstractions** - Various generation algorithms use the same interface
6. **Constants** - Shared constants in dedicated file
7. **Event-Driven Communication** - Components interact through events

## Circular Maze Implementation

### Data Structure
- Polar grid with concentric rings and sectors (pie slices)
- Adaptive sector count: outer rings have more sectors than inner rings
- Each cell maintains walls: inner, outer, clockwise (cw), and counter-clockwise (ccw)

### Key Functions
- `createCircularGrid()`: Creates the polar grid structure
- `cellToPixel()`: Converts polar coordinates to screen coordinates
- `getNeighbors()`: Finds adjacent cells with handling for circular connections
- `removeWalls()`: Removes walls between connected cells
- `createMazeBodies()`: Creates physical representation of the maze

### Maze Generation Algorithms
The implementation supports:
1. **Recursive Backtracker**: Depth-first with backtracking
2. **Kruskal's Algorithm**: Treats cells as sets, merges on wall removal
3. **Prim's Algorithm**: Grows from seed, selecting random frontier walls

### Coordinate Systems
- Polar coordinates (ring, sector) for grid structure
- Cartesian coordinates (x, y) for rendering and physics
- Conversion functions handle the mapping between systems

### Code Organization Principles
1. **Separation of Concerns**: Grid creation, algorithms, and rendering are distinct
2. **Abstraction**: Common interfaces for different maze shapes
3. **Encapsulation**: Functions have single responsibilities
4. **Module Pattern**: Code is organized in ES6 modules
5. **Constants**: Magic values are replaced by named constants
6. **Event System**: Components communicate via events

## Adaptation for MazeSpinner
For MazeSpinner's modularization, key takeaways include:

1. Create separate modules for:
   - Grid creation and management
   - Maze generation algorithms
   - Physics integration
   - UI and controls
   - Utility functions

2. Use ES6 modules or module pattern (IIFEs) for encapsulation

3. Abstract common functionality between rectangular and circular mazes

4. Maintain clear interfaces between components

5. Use event-driven communication for loose coupling

6. Implement a state machine for game flow control

7. Extract configuration parameters to a dedicated module
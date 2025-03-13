# Circular Maze Implementation Reference

## Concepts and Theory

### Polar Grid Geometry
- **Rings**: Concentric circular layers from center outward
- **Sectors**: Divisions within each ring (like spokes in a wheel)
- **Adaptive subdivision**: Outer rings have more sectors than inner rings to maintain uniform cell size

### Coordinates
- **Polar Coordinates**: 
  - `(ring, sector)` defines cell position
  - Each cell has inner/outer radius and start/end angles
- **Conversion to Cartesian**: Required for drawing on canvas and physics simulation
  ```javascript
  x = centerX + radius * Math.cos(angle)
  y = centerY + radius * Math.sin(angle)
  ```

### Cell Structure
- Each cell has four possible walls:
  - **Inner wall**: Connects to the inner ring (closer to center)
  - **Outer wall**: Connects to the outer ring (away from center)
  - **Counter-clockwise (CCW) wall**: Angular wall in CCW direction
  - **Clockwise (CW) wall**: Angular wall in CW direction

## Grid Creation

### Adaptive Subdivision Algorithm
```javascript
function createCircularGrid(rings, sectorsInOuterRing, centerOpen = false) {
    const grid = [];
    const startRing = centerOpen ? 1 : 0;
    
    for (let r = startRing; r < rings; r++) {
        grid[r] = [];
        // Scale number of sectors based on ring radius to maintain reasonable cell size
        const sectors = Math.max(6, Math.floor((r+1) * sectorsInOuterRing / rings));
        
        for (let s = 0; s < sectors; s++) {
            grid[r][s] = {
                ring: r,
                sector: s,
                totalSectors: sectors,
                walls: {
                    inner: r > startRing,
                    outer: true,
                    ccw: true,
                    cw: true
                },
                visited: false
            };
        }
    }
    
    return grid;
}
```

### Getting Cell Neighbors
The complexity in circular mazes comes from adaptive subdivision - cells may connect to multiple cells in adjacent rings:

```javascript
function getNeighbors(cell, grid) {
    const neighbors = [];
    const { ring, sector, totalSectors } = cell;
    
    // Inner neighbor (toward center)
    if (ring > 0) {
        const innerRing = grid[ring - 1];
        const innerSectorRatio = innerRing.length / totalSectors;
        const innerSector = Math.floor(sector * innerSectorRatio);
        
        if (innerRing[innerSector]) {
            neighbors.push({
                cell: innerRing[innerSector],
                direction: 'inner'
            });
        }
    }
    
    // Outer neighbor (away from center)
    if (ring < grid.length - 1) {
        const outerRing = grid[ring + 1];
        const outerSectorRatio = outerRing.length / totalSectors;
        
        // Handle 1:many mapping for adaptive subdivision
        if (outerSectorRatio === 1) {
            neighbors.push({
                cell: outerRing[sector],
                direction: 'outer'
            });
        } else {
            const startSector = Math.floor(sector * outerSectorRatio);
            const endSector = Math.floor((sector + 1) * outerSectorRatio);
            
            for (let s = startSector; s < endSector; s++) {
                neighbors.push({
                    cell: outerRing[s],
                    direction: 'outer'
                });
            }
        }
    }
    
    // Counter-clockwise and clockwise neighbors
    const ccwSector = (sector - 1 + totalSectors) % totalSectors;
    const cwSector = (sector + 1) % totalSectors;
    
    neighbors.push({
        cell: grid[ring][ccwSector],
        direction: 'ccw'
    });
    
    neighbors.push({
        cell: grid[ring][cwSector],
        direction: 'cw'
    });
    
    return neighbors;
}
```

## Maze Generation Algorithms

### Recursive Backtracker
1. Choose a random starting cell
2. Mark it as visited
3. While there are unvisited cells:
   - Check for unvisited neighbors of the current cell
   - If there are unvisited neighbors:
     - Choose a random unvisited neighbor
     - Remove the wall between the current cell and the chosen neighbor
     - Move to the chosen neighbor and mark it as visited
   - If there are no unvisited neighbors, backtrack

```javascript
function recursiveBacktracker(grid) {
    // Initialize stack with random starting cell
    // While stack is not empty:
    //   - Get current cell from top of stack
    //   - Find unvisited neighbors
    //   - If has unvisited neighbors:
    //     - Choose random neighbor
    //     - Remove wall between cells
    //     - Add neighbor to stack
    //   - Else backtrack (pop from stack)
}
```

### Kruskal's Algorithm
1. Create a list of all walls in the grid
2. Assign each cell to its own set
3. Shuffle the list of walls randomly
4. For each wall in the list:
   - If the cells on either side of the wall are in different sets:
     - Remove the wall
     - Merge the sets of the two cells

```javascript
function kruskalAlgorithm(grid) {
    // Create list of all walls
    // Assign each cell to its own set
    // Shuffle walls randomly
    // For each wall:
    //   - If cells on either side are in different sets:
    //     - Remove wall
    //     - Merge sets
}
```

### Prim's Algorithm
1. Choose a random starting cell and mark it as part of the maze
2. Add all walls of the starting cell to a list
3. While there are walls in the list:
   - Choose a random wall from the list
   - If the cell on the other side of the wall is not part of the maze:
     - Remove the wall
     - Mark the cell as part of the maze
     - Add the walls of the cell to the list

```javascript
function primAlgorithm(grid) {
    // Start with random cell
    // Add its walls to frontier list
    // While frontier not empty:
    //   - Choose random wall from frontier
    //   - If cell on other side not visited:
    //     - Remove wall
    //     - Mark cell as visited
    //     - Add its walls to frontier
}
```

## Physics Implementation with Matter.js

### Wall Creation
For each wall in the maze:
1. Calculate the wall's position in Cartesian coordinates
2. Create a Matter.js rectangle body for the wall
3. Set appropriate physical properties (static, friction, etc.)

```javascript
function createWalls(grid, ringCount, maxRadius) {
    const wallBodies = [];
    
    // Create outer boundary first
    
    // For each cell in the grid:
    //   - If it has inner wall: create wall body
    //   - If it has CW wall: create wall body
    //   - If it has CCW wall: create wall body
    //   - (Outer walls are handled by boundary)
    
    return wallBodies;
}
```

### Wall and Exit Positioning

```javascript
// Inner wall (curved segment)
if (cell.walls.inner) {
    const x1 = centerX + innerRadius * Math.cos(cellAngle);
    const y1 = centerY + innerRadius * Math.sin(cellAngle);
    const x2 = centerX + innerRadius * Math.cos(nextAngle);
    const y2 = centerY + innerRadius * Math.sin(nextAngle);
    
    const segment = Bodies.rectangle(
        (x1 + x2) / 2,
        (y1 + y2) / 2,
        Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
        5,
        {
            isStatic: true,
            angle: cellAngle + Math.PI / 2,
            friction: wallFriction,
            render: { 
                fillStyle: '#222',
                strokeStyle: '#000',
                lineWidth: 1
            }
        }
    );
    
    wallBodies.push(segment);
}

// Exit at outer edge
const exitAngle = ((exitRingIndex + 0.5) / totalSectors) * 2 * Math.PI;
exit = Bodies.rectangle(
    centerX + maxRadius * Math.cos(exitAngle),
    centerY + maxRadius * Math.sin(exitAngle),
    20,
    10,
    { 
        isStatic: true, 
        isSensor: true,
        angle: exitAngle + Math.PI/2,
        render: { 
            fillStyle: '#00ff00'
        }
    }
);
```

## Optimizations and Best Practices

1. **Adaptive Subdivision**: Keeps cell sizes more uniform by increasing sectors as radius increases
2. **Wrap-around Boundary**: Connect clockwise and counter-clockwise edges to eliminate the visual seam
3. **Separate Rendering and Logic**: Keep maze generation algorithms separate from rendering code
4. **Physics Parameters**: Use stable values for friction, restitution, and density
5. **Canvas Rotation**: Rotate canvas context, not individual bodies, for better performance
6. **Coordinate Conversion**: Use efficient methods to convert between polar and Cartesian coordinates

## Troubleshooting Common Issues

1. **Ball Escaping**: Set appropriate bounds checking and reset the ball when it gets lost
2. **Wall Gaps**: Ensure proper wall alignment, especially at the boundaries of cells
3. **Performance**: Use an appropriate number of rings and sectors based on canvas size
4. **Physics Stability**: Use lower gravity, higher friction, and appropriate mass for stable simulation
5. **Cell Size Uniformity**: Adjust the ratio of sectors to ring index for even cell sizes
# Rectangular Maze Implementation Reference

## Concepts and Theory

### Grid Geometry
- **Rows & Columns**: 2D grid structure (x, y coordinates)
- **Cells**: Each position in the grid, defined by (x, y)
- **Walls**: Each cell has four possible walls (north, east, south, west)

### Cell Structure
```javascript
{
    x: x,        // X coordinate in grid
    y: y,        // Y coordinate in grid
    walls: {
        north: true,  // Wall to the north (up)
        east: true,   // Wall to the east (right)
        south: true,  // Wall to the south (down)
        west: true    // Wall to the west (left)
    },
    visited: false  // For tracking cell visits during maze generation
}
```

### Neighbor Relationships
- **North**: (x, y-1)
- **East**: (x+1, y)
- **South**: (x, y+1)
- **West**: (x-1, y)

## Grid Creation

```javascript
function createGrid(width, height) {
    const grid = [];
    
    for (let y = 0; y < height; y++) {
        grid[y] = [];
        for (let x = 0; x < width; x++) {
            grid[y][x] = {
                x: x,
                y: y,
                walls: {
                    north: true,
                    east: true,
                    south: true,
                    west: true
                },
                visited: false
            };
        }
    }
    
    return grid;
}
```

### Getting Cell Neighbors

```javascript
function getUnvisitedNeighbors(cell, grid, width, height) {
    const { x, y } = cell;
    const neighbors = [];
    
    // North
    if (y > 0 && !grid[y-1][x].visited) {
        neighbors.push(grid[y-1][x]);
    }
    
    // East
    if (x < width - 1 && !grid[y][x+1].visited) {
        neighbors.push(grid[y][x+1]);
    }
    
    // South
    if (y < height - 1 && !grid[y+1][x].visited) {
        neighbors.push(grid[y+1][x]);
    }
    
    // West
    if (x > 0 && !grid[y][x-1].visited) {
        neighbors.push(grid[y][x-1]);
    }
    
    return neighbors;
}
```

### Removing Walls Between Cells

```javascript
function removeWalls(cell1, cell2) {
    const dx = cell2.x - cell1.x;
    const dy = cell2.y - cell1.y;
    
    if (dx === 1) {
        // cell2 is to the east of cell1
        cell1.walls.east = false;
        cell2.walls.west = false;
    } else if (dx === -1) {
        // cell2 is to the west of cell1
        cell1.walls.west = false;
        cell2.walls.east = false;
    } else if (dy === 1) {
        // cell2 is to the south of cell1
        cell1.walls.south = false;
        cell2.walls.north = false;
    } else if (dy === -1) {
        // cell2 is to the north of cell1
        cell1.walls.north = false;
        cell2.walls.south = false;
    }
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
function recursiveBacktracker(grid, width, height) {
    // Stack for tracking current path
    const stack = [];
    
    // Start at a random cell
    const startX = Math.floor(Math.random() * width);
    const startY = Math.floor(Math.random() * height);
    const startCell = grid[startY][startX];
    
    // Mark as visited
    startCell.visited = true;
    stack.push(startCell);
    
    // Continue while there are cells in the stack
    while (stack.length > 0) {
        // Get current cell from the stack
        const currentCell = stack[stack.length - 1];
        
        // Get unvisited neighbors
        const neighbors = getUnvisitedNeighbors(currentCell, grid, width, height);
        
        if (neighbors.length > 0) {
            // Choose a random unvisited neighbor
            const randomIndex = Math.floor(Math.random() * neighbors.length);
            const nextCell = neighbors[randomIndex];
            
            // Remove walls between current cell and next cell
            removeWalls(currentCell, nextCell);
            
            // Mark next cell as visited and add to stack
            nextCell.visited = true;
            stack.push(nextCell);
        } else {
            // Backtrack
            stack.pop();
        }
    }
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
function kruskalAlgorithm(grid, width, height) {
    // List of all walls
    const walls = [];
    
    // Create sets for each cell
    const sets = new Map();
    
    // Initialize sets and collect walls
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            sets.set(`${x},${y}`, new Set([`${x},${y}`]));
            
            // Add walls to list
            if (x < width - 1) walls.push({ x, y, direction: 'east' });
            if (y < height - 1) walls.push({ x, y, direction: 'south' });
        }
    }
    
    // Shuffle walls
    shuffleArray(walls);
    
    // Process each wall
    for (const wall of walls) {
        const { x, y, direction } = wall;
        const cell1 = `${x},${y}`;
        const cell2 = direction === 'east' ? `${x+1},${y}` : `${x},${y+1}`;
        
        // Get sets for both cells
        const set1 = sets.get(cell1);
        const set2 = sets.get(cell2);
        
        // If cells are in different sets, remove the wall between them
        if (!setsAreEqual(set1, set2)) {
            // Remove wall
            if (direction === 'east') {
                grid[y][x].walls.east = false;
                grid[y][x+1].walls.west = false;
            } else {
                grid[y][x].walls.south = false;
                grid[y+1][x].walls.north = false;
            }
            
            // Merge sets
            const mergedSet = new Set([...set1, ...set2]);
            for (const cell of mergedSet) sets.set(cell, mergedSet);
        }
    }
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
function primAlgorithm(grid, width, height) {
    // Start with a random cell
    const startX = Math.floor(Math.random() * width);
    const startY = Math.floor(Math.random() * height);
    
    // List of walls to consider
    const walls = [];
    
    // Mark the starting cell as visited
    grid[startY][startX].visited = true;
    
    // Add the walls of the starting cell to the wall list
    addWallsToList(startX, startY, grid, width, height, walls);
    
    // Continue until there are no more walls to consider
    while (walls.length > 0) {
        // Choose a random wall
        const randomIndex = Math.floor(Math.random() * walls.length);
        const { x, y, direction } = walls[randomIndex];
        
        // Remove the wall from the list
        walls.splice(randomIndex, 1);
        
        // Get the adjacent cell
        let nx = x, ny = y;
        if (direction === 'north') ny--;
        else if (direction === 'east') nx++;
        else if (direction === 'south') ny++;
        else if (direction === 'west') nx--;
        
        // If the adjacent cell hasn't been visited yet
        if (nx >= 0 && ny >= 0 && nx < width && ny < height && !grid[ny][nx].visited) {
            // Remove the wall
            if (direction === 'north') {
                grid[y][x].walls.north = false;
                grid[ny][nx].walls.south = false;
            } else if (direction === 'east') {
                grid[y][x].walls.east = false;
                grid[ny][nx].walls.west = false;
            } else if (direction === 'south') {
                grid[y][x].walls.south = false;
                grid[ny][nx].walls.north = false;
            } else if (direction === 'west') {
                grid[y][x].walls.west = false;
                grid[ny][nx].walls.east = false;
            }
            
            // Mark the adjacent cell as visited
            grid[ny][nx].visited = true;
            
            // Add the walls of the adjacent cell to the wall list
            addWallsToList(nx, ny, grid, width, height, walls);
        }
    }
}
```

### Binary Tree Algorithm
A simpler algorithm that creates mazes with a bias toward two directions:

```javascript
function binaryTreeAlgorithm(grid, width, height) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const directions = [];
            
            // Can go north?
            if (y > 0) directions.push('north');
            
            // Can go west?
            if (x > 0) directions.push('west');
            
            // If we have directions to choose from
            if (directions.length > 0) {
                // Choose a random direction
                const direction = directions[Math.floor(Math.random() * directions.length)];
                
                // Remove the wall in that direction
                if (direction === 'north') {
                    grid[y][x].walls.north = false;
                    grid[y-1][x].walls.south = false;
                } else if (direction === 'west') {
                    grid[y][x].walls.west = false;
                    grid[y][x-1].walls.east = false;
                }
            }
        }
    }
}
```

## Physics Implementation with Matter.js

### Wall Creation
For a grid-based maze, we need to create:
1. Boundary walls around the entire maze
2. Internal walls based on the maze structure

```javascript
function createMazeBodies(grid, width, height, canvasSize) {
    const cellWidth = canvasSize.width / (width + 2);
    const cellHeight = canvasSize.height / (height + 2);
    const offsetX = cellWidth;
    const offsetY = cellHeight;
    const wallBodies = [];
    
    // Create boundary walls
    createBoundaryWalls(width, height, cellWidth, cellHeight, offsetX, offsetY, wallBodies);
    
    // Create maze walls
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = grid[y][x];
            const cellX = offsetX + x * cellWidth;
            const cellY = offsetY + y * cellHeight;
            
            // Create north wall if present
            if (cell.walls.north) {
                const wall = Bodies.rectangle(
                    cellX + cellWidth / 2,
                    cellY,
                    cellWidth,
                    5,
                    { isStatic: true, render: { fillStyle: '#000' }}
                );
                wallBodies.push(wall);
            }
            
            // Create east wall if present
            if (cell.walls.east) {
                const wall = Bodies.rectangle(
                    cellX + cellWidth,
                    cellY + cellHeight / 2,
                    5,
                    cellHeight,
                    { isStatic: true, render: { fillStyle: '#000' }}
                );
                wallBodies.push(wall);
            }
            
            // Create south wall if present
            if (cell.walls.south) {
                const wall = Bodies.rectangle(
                    cellX + cellWidth / 2,
                    cellY + cellHeight,
                    cellWidth,
                    5,
                    { isStatic: true, render: { fillStyle: '#000' }}
                );
                wallBodies.push(wall);
            }
            
            // Create west wall if present
            if (cell.walls.west) {
                const wall = Bodies.rectangle(
                    cellX,
                    cellY + cellHeight / 2,
                    5,
                    cellHeight,
                    { isStatic: true, render: { fillStyle: '#000' }}
                );
                wallBodies.push(wall);
            }
        }
    }
    
    return wallBodies;
}
```

### Boundary Walls and Exit

```javascript
function createBoundaryWalls(width, height, cellWidth, cellHeight, offsetX, offsetY, wallBodies) {
    // Top wall
    const topWall = Bodies.rectangle(
        canvasWidth / 2,
        offsetY - cellHeight / 2,
        canvasWidth,
        cellHeight,
        { isStatic: true, render: { fillStyle: '#333' }}
    );
    
    // Left wall
    const leftWall = Bodies.rectangle(
        offsetX - cellWidth / 2,
        canvasHeight / 2,
        cellWidth,
        canvasHeight,
        { isStatic: true, render: { fillStyle: '#333' }}
    );
    
    // Right wall
    const rightWall = Bodies.rectangle(
        offsetX + width * cellWidth + cellWidth / 2,
        canvasHeight / 2,
        cellWidth,
        canvasHeight,
        { isStatic: true, render: { fillStyle: '#333' }}
    );
    
    // Bottom wall
    const bottomWall = Bodies.rectangle(
        canvasWidth / 2,
        offsetY + height * cellHeight + cellHeight / 2,
        canvasWidth,
        cellHeight,
        { isStatic: true, render: { fillStyle: '#333' }}
    );
    
    // Add walls to array
    wallBodies.push(topWall, leftWall, rightWall, bottomWall);
}

// Create exit at the bottom right
const exitX = offsetX + (width - 0.5) * cellWidth;
const exitY = offsetY + height * cellHeight;

exit = Bodies.rectangle(
    exitX,
    exitY,
    cellWidth,
    10,
    { 
        isStatic: true, 
        isSensor: true,
        render: { 
            fillStyle: '#ff0000',
            opacity: 0.8
        }
    }
);
```

## Optimizations and Best Practices

1. **Efficient Grid Representation**: Use a 2D array with cell objects
2. **Wall Deduplication**: Only create walls that are needed, avoid duplicating shared walls
3. **Boundary Handling**: Create proper boundary walls to prevent ball escape
4. **Physics Parameters**: Set appropriate friction, restitution, and density values
5. **Canvas Rotation**: Rotate the canvas context instead of all bodies for better performance
6. **Player Controls**: Use both keyboard and touch controls for broader compatibility
7. **Reset Mechanism**: Provide easy way to reset ball position when stuck

## Troubleshooting Common Issues

1. **Wall Thickness**: Make walls thick enough for proper collision detection
2. **Ball Size**: Keep ball smaller than passage widths to prevent getting stuck
3. **Physics Stability**: Use appropriate friction and gravity values
4. **Edge Handling**: Ensure walls at maze boundaries are properly aligned
5. **Performance**: Limit grid size based on device capabilities
6. **Reset Condition**: Add automatic reset if ball gets stuck or goes out of bounds
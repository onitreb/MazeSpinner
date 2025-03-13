/**
 * Circular maze generation algorithms for MazeSpinner
 */

import { MazeUtils } from '../common/utils.js';

/**
 * Apply selected algorithm to the grid
 * @param {Object} gridModule - The grid module
 * @param {Array} grid - The grid structure
 * @param {string} algorithm - Algorithm name
 * @param {number} ringCount - Number of rings
 */
function generateMaze(gridModule, grid, algorithm, ringCount) {
    // Reset all cells to unvisited
    for (let r = 0; r < grid.length; r++) {
        for (let s = 0; s < grid[r].length; s++) {
            grid[r][s].visited = false;
        }
    }
    
    // Call the appropriate algorithm
    switch (algorithm) {
        case 'backtracker':
            recursiveBacktracker(gridModule, grid, ringCount);
            break;
        case 'kruskal':
            kruskalAlgorithm(gridModule, grid, ringCount);
            break;
        case 'prim':
            primAlgorithm(gridModule, grid, ringCount);
            break;
        default:
            recursiveBacktracker(gridModule, grid, ringCount);
    }
}

/**
 * Recursive Backtracker algorithm for circular mazes
 * @param {Object} gridModule - The grid module
 * @param {Array} grid - The grid structure
 * @param {number} ringCount - Number of rings
 */
function recursiveBacktracker(gridModule, grid, ringCount) {
    // Flatten the grid into a 1D array for easier processing
    const flatGrid = [];
    for (let r = 0; r < grid.length; r++) {
        for (let s = 0; s < grid[r].length; s++) {
            flatGrid.push(grid[r][s]);
        }
    }
    
    // Pick a random starting cell
    const startCell = MazeUtils.getRandomElement(flatGrid);
    startCell.visited = true;
    
    // Stack for backtracking
    const stack = [startCell];
    
    // While there are cells in the stack
    while (stack.length > 0) {
        const currentCell = stack[stack.length - 1];
        
        // Get unvisited neighbors
        const neighbors = gridModule.getNeighbors(currentCell, grid)
            .filter(neighbor => !neighbor.cell.visited);
        
        if (neighbors.length > 0) {
            // Choose a random unvisited neighbor
            const randomNeighbor = MazeUtils.getRandomElement(neighbors);
            const nextCell = randomNeighbor.cell;
            const direction = randomNeighbor.direction;
            
            // Remove walls between current cell and chosen neighbor
            gridModule.removeWalls(currentCell, nextCell, direction);
            
            // Mark the chosen cell as visited and push it to the stack
            nextCell.visited = true;
            stack.push(nextCell);
        } else {
            // Backtrack
            stack.pop();
        }
    }
}

/**
 * Kruskal's Algorithm for circular mazes
 * @param {Object} gridModule - The grid module
 * @param {Array} grid - The grid structure
 * @param {number} ringCount - Number of rings
 */
function kruskalAlgorithm(gridModule, grid, ringCount) {
    // Create a list of all walls
    const walls = [];
    
    // For each cell, add its walls to the list
    for (let r = 0; r < grid.length; r++) {
        for (let s = 0; s < grid[r].length; s++) {
            const cell = grid[r][s];
            const neighbors = gridModule.getNeighbors(cell, grid);
            
            for (const neighbor of neighbors) {
                // Add wall only once (when current cell index < neighbor cell index)
                const neighborCell = neighbor.cell;
                if (r < neighborCell.ring || 
                    (r === neighborCell.ring && s < neighborCell.sector)) {
                    walls.push({
                        cell1: cell,
                        cell2: neighborCell,
                        direction: neighbor.direction
                    });
                }
            }
        }
    }
    
    // Shuffle the walls
    const shuffledWalls = MazeUtils.shuffleArray(walls);
    
    // Initialize cell sets (each cell is in its own set initially)
    const cellSets = new Map();
    let setCounter = 0;
    
    for (let r = 0; r < grid.length; r++) {
        for (let s = 0; s < grid[r].length; s++) {
            cellSets.set(grid[r][s], setCounter++);
        }
    }
    
    // Function to find which set a cell belongs to
    function findSet(cell) {
        return cellSets.get(cell);
    }
    
    // Function to merge two sets
    function unionSets(cell1, cell2) {
        const set1 = findSet(cell1);
        const set2 = findSet(cell2);
        
        // Replace all occurrences of set2 with set1
        for (const [cell, set] of cellSets.entries()) {
            if (set === set2) {
                cellSets.set(cell, set1);
            }
        }
    }
    
    // Process walls
    for (const wall of shuffledWalls) {
        const cell1 = wall.cell1;
        const cell2 = wall.cell2;
        
        // If cells are in different sets, remove the wall and merge the sets
        if (findSet(cell1) !== findSet(cell2)) {
            gridModule.removeWalls(cell1, cell2, wall.direction);
            unionSets(cell1, cell2);
        }
    }
}

/**
 * Prim's Algorithm for circular mazes
 * @param {Object} gridModule - The grid module
 * @param {Array} grid - The grid structure
 * @param {number} ringCount - Number of rings
 */
function primAlgorithm(gridModule, grid, ringCount) {
    // Flatten the grid into a 1D array
    const flatGrid = [];
    for (let r = 0; r < grid.length; r++) {
        for (let s = 0; s < grid[r].length; s++) {
            flatGrid.push(grid[r][s]);
        }
    }
    
    // Pick a random starting cell
    const startCell = MazeUtils.getRandomElement(flatGrid);
    startCell.visited = true;
    
    // List of walls that connect visited cells to unvisited cells
    const walls = [];
    
    // Add walls from the start cell
    const startNeighbors = gridModule.getNeighbors(startCell, grid);
    for (const neighbor of startNeighbors) {
        walls.push({
            visitedCell: startCell,
            unvisitedCell: neighbor.cell,
            direction: neighbor.direction
        });
    }
    
    // While there are walls in the list
    while (walls.length > 0) {
        // Pick a random wall
        const randomIndex = Math.floor(Math.random() * walls.length);
        const wall = walls[randomIndex];
        
        // Remove this wall from the list
        walls.splice(randomIndex, 1);
        
        const unvisitedCell = wall.unvisitedCell;
        
        // If the cell on the other side of the wall is not visited yet
        if (!unvisitedCell.visited) {
            // Remove the wall between the cells
            gridModule.removeWalls(wall.visitedCell, unvisitedCell, wall.direction);
            
            // Mark the cell as visited
            unvisitedCell.visited = true;
            
            // Add all its walls to the list
            const neighbors = gridModule.getNeighbors(unvisitedCell, grid);
            for (const neighbor of neighbors) {
                if (!neighbor.cell.visited) {
                    walls.push({
                        visitedCell: unvisitedCell,
                        unvisitedCell: neighbor.cell,
                        direction: neighbor.direction
                    });
                }
            }
        }
    }
}

// Export the module
export const CircularMazeAlgorithms = {
    generateMaze,
    recursiveBacktracker,
    kruskalAlgorithm,
    primAlgorithm
};
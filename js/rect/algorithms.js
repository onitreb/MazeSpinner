/**
 * Rectangular maze generation algorithms for MazeSpinner
 */

const RectMazeAlgorithms = (function() {
    /**
     * Apply selected algorithm to the grid
     * @param {Object} gridModule - The grid module
     * @param {Array} grid - The grid structure
     * @param {string} algorithm - Algorithm name
     * @param {number} width - Width of the grid
     * @param {number} height - Height of the grid
     */
    function generateMaze(gridModule, grid, algorithm, width, height) {
        // Reset all cells to unvisited
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                grid[y][x].visited = false;
            }
        }
        
        // Call the appropriate algorithm
        switch (algorithm) {
            case 'backtracker':
                recursiveBacktracker(gridModule, grid, width, height);
                break;
            case 'kruskal':
                kruskalAlgorithm(gridModule, grid, width, height);
                break;
            case 'prim':
                primAlgorithm(gridModule, grid, width, height);
                break;
            case 'binarytree':
                binaryTreeAlgorithm(gridModule, grid, width, height);
                break;
            default:
                recursiveBacktracker(gridModule, grid, width, height);
        }
    }
    
    /**
     * Recursive Backtracker algorithm
     * @param {Object} gridModule - The grid module
     * @param {Array} grid - The grid structure
     * @param {number} width - Width of the grid
     * @param {number} height - Height of the grid
     */
    function recursiveBacktracker(gridModule, grid, width, height) {
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
            const neighbors = gridModule.getUnvisitedNeighbors(currentCell);
            
            if (neighbors.length > 0) {
                // Choose a random unvisited neighbor
                const randomIndex = Math.floor(Math.random() * neighbors.length);
                const nextCell = neighbors[randomIndex];
                
                // Remove walls between current cell and next cell
                gridModule.removeWalls(currentCell, nextCell);
                
                // Mark next cell as visited and add to stack
                nextCell.visited = true;
                stack.push(nextCell);
            } else {
                // Backtrack
                stack.pop();
            }
        }
    }
    
    /**
     * Kruskal's algorithm
     * @param {Object} gridModule - The grid module
     * @param {Array} grid - The grid structure
     * @param {number} width - Width of the grid
     * @param {number} height - Height of the grid
     */
    function kruskalAlgorithm(gridModule, grid, width, height) {
        // List of all walls
        const walls = [];
        
        // Create sets for each cell
        const sets = new Map();
        
        // Initialize sets
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = grid[y][x];
                sets.set(`${x},${y}`, new Set([`${x},${y}`]));
                
                // Add walls to list
                if (x < width - 1) {
                    walls.push({
                        x: x,
                        y: y,
                        direction: 'east'
                    });
                }
                
                if (y < height - 1) {
                    walls.push({
                        x: x,
                        y: y,
                        direction: 'south'
                    });
                }
            }
        }
        
        // Shuffle walls
        MazeUtils.shuffleArray(walls);
        
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
                
                // Update sets for all cells in both sets
                for (const cell of mergedSet) {
                    sets.set(cell, mergedSet);
                }
            }
        }
    }
    
    /**
     * Check if two sets are equal
     * @param {Set} set1 - First set
     * @param {Set} set2 - Second set
     * @returns {boolean} - Whether the sets are equal
     */
    function setsAreEqual(set1, set2) {
        if (set1.size !== set2.size) return false;
        for (const item of set1) {
            if (!set2.has(item)) return false;
        }
        return true;
    }
    
    /**
     * Prim's algorithm
     * @param {Object} gridModule - The grid module
     * @param {Array} grid - The grid structure
     * @param {number} width - Width of the grid
     * @param {number} height - Height of the grid
     */
    function primAlgorithm(gridModule, grid, width, height) {
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
    
    /**
     * Add walls of a cell to the wall list
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array} grid - The grid structure
     * @param {number} width - Width of the grid
     * @param {number} height - Height of the grid
     * @param {Array} walls - The wall list
     */
    function addWallsToList(x, y, grid, width, height, walls) {
        if (y > 0) {
            walls.push({ x, y, direction: 'north' });
        }
        
        if (x < width - 1) {
            walls.push({ x, y, direction: 'east' });
        }
        
        if (y < height - 1) {
            walls.push({ x, y, direction: 'south' });
        }
        
        if (x > 0) {
            walls.push({ x, y, direction: 'west' });
        }
    }
    
    /**
     * Binary Tree algorithm
     * @param {Object} gridModule - The grid module
     * @param {Array} grid - The grid structure
     * @param {number} width - Width of the grid
     * @param {number} height - Height of the grid
     */
    function binaryTreeAlgorithm(gridModule, grid, width, height) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const directions = [];
                
                // Can go north?
                if (y > 0) {
                    directions.push('north');
                }
                
                // Can go west?
                if (x > 0) {
                    directions.push('west');
                }
                
                // If we have directions to choose from
                if (directions.length > 0) {
                    // Choose a random direction
                    const direction = MazeUtils.getRandomElement(directions);
                    
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
    
    // Public API
    return {
        generateMaze
    };
})();

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RectMazeAlgorithms;
}
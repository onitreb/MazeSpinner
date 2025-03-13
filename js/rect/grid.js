/**
 * Rectangular grid module for MazeSpinner
 * Handles rectangular grid creation and manipulation
 */

const RectGrid = (function() {
    // Private variables
    let grid = [];
    
    /**
     * Create a new rectangular grid
     * @param {number} width - Width of the grid
     * @param {number} height - Height of the grid
     * @returns {Object} - The grid and related methods
     */
    function create(width, height) {
        grid = createGrid(width, height);
        
        return {
            grid,
            getGrid: () => grid,
            getCell: (x, y) => getCell(x, y),
            getRandomCell: () => getRandomCell(),
            createPhysicsBodies: (canvasSize, wallSettings) => 
                createMazeBodies(grid, width, height, canvasSize, wallSettings)
        };
    }
    
    /**
     * Create a new rectangular grid
     * @param {number} width - Width of the grid
     * @param {number} height - Height of the grid
     * @returns {Array} - The grid structure
     */
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
    
    /**
     * Get a specific cell from the grid
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} - The cell, or null if invalid
     */
    function getCell(x, y) {
        if (y < 0 || y >= grid.length) return null;
        if (x < 0 || x >= grid[y].length) return null;
        return grid[y][x];
    }
    
    /**
     * Get a random cell from the grid
     * @returns {Object} - A random cell
     */
    function getRandomCell() {
        const y = Math.floor(Math.random() * grid.length);
        const x = Math.floor(Math.random() * grid[y].length);
        return grid[y][x];
    }
    
    /**
     * Get all unvisited neighbors of a cell
     * @param {Object} cell - The cell
     * @returns {Array} - Array of unvisited neighboring cells
     */
    function getUnvisitedNeighbors(cell) {
        const { x, y } = cell;
        const neighbors = [];
        
        // North
        if (y > 0 && !grid[y-1][x].visited) {
            neighbors.push(grid[y-1][x]);
        }
        
        // East
        if (x < grid[0].length - 1 && !grid[y][x+1].visited) {
            neighbors.push(grid[y][x+1]);
        }
        
        // South
        if (y < grid.length - 1 && !grid[y+1][x].visited) {
            neighbors.push(grid[y+1][x]);
        }
        
        // West
        if (x > 0 && !grid[y][x-1].visited) {
            neighbors.push(grid[y][x-1]);
        }
        
        return neighbors;
    }
    
    /**
     * Get all neighbors of a cell
     * @param {Object} cell - The cell
     * @returns {Array} - Array of neighboring cells with direction
     */
    function getNeighbors(cell) {
        const { x, y } = cell;
        const neighbors = [];
        
        // North
        if (y > 0) {
            neighbors.push({
                cell: grid[y-1][x],
                direction: 'north'
            });
        }
        
        // East
        if (x < grid[0].length - 1) {
            neighbors.push({
                cell: grid[y][x+1],
                direction: 'east'
            });
        }
        
        // South
        if (y < grid.length - 1) {
            neighbors.push({
                cell: grid[y+1][x],
                direction: 'south'
            });
        }
        
        // West
        if (x > 0) {
            neighbors.push({
                cell: grid[y][x-1],
                direction: 'west'
            });
        }
        
        return neighbors;
    }
    
    /**
     * Remove walls between two cells
     * @param {Object} cell1 - First cell
     * @param {Object} cell2 - Second cell
     */
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
    
    /**
     * Create Matter.js bodies for the maze
     * @param {Array} grid - The grid structure
     * @param {number} width - Width of the grid
     * @param {number} height - Height of the grid
     * @param {number} canvasSize - Size of the canvas
     * @param {Object} wallSettings - Settings for wall appearance and physics
     * @returns {Object} - The created bodies
     */
    function createMazeBodies(grid, width, height, canvasSize, wallSettings) {
        // Calculate cell size based on canvas dimensions
        const cellWidth = canvasSize.width / (width + 2);
        const cellHeight = canvasSize.height / (height + 2);
        
        // Offset to center the maze
        const offsetX = cellWidth;
        const offsetY = cellHeight;
        
        // Wall bodies
        const wallBodies = [];
        
        // Create boundary walls
        createBoundaryWalls(width, height, cellWidth, cellHeight, offsetX, offsetY, wallBodies, wallSettings);
        
        // Create maze walls
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = grid[y][x];
                
                // Calculate cell position
                const cellX = offsetX + x * cellWidth;
                const cellY = offsetY + y * cellHeight;
                
                // Create north wall if present
                if (cell.walls.north) {
                    const wall = Matter.Bodies.rectangle(
                        cellX + cellWidth / 2,
                        cellY,
                        cellWidth,
                        5,
                        { 
                            isStatic: true,
                            friction: wallSettings.friction || 0.1, 
                            render: { 
                                fillStyle: wallSettings.color || '#000' 
                            }
                        }
                    );
                    wallBodies.push(wall);
                }
                
                // Create east wall if present
                if (cell.walls.east) {
                    const wall = Matter.Bodies.rectangle(
                        cellX + cellWidth,
                        cellY + cellHeight / 2,
                        5,
                        cellHeight,
                        { 
                            isStatic: true,
                            friction: wallSettings.friction || 0.1, 
                            render: { 
                                fillStyle: wallSettings.color || '#000' 
                            }
                        }
                    );
                    wallBodies.push(wall);
                }
                
                // Create south wall if present
                if (cell.walls.south) {
                    const wall = Matter.Bodies.rectangle(
                        cellX + cellWidth / 2,
                        cellY + cellHeight,
                        cellWidth,
                        5,
                        { 
                            isStatic: true,
                            friction: wallSettings.friction || 0.1, 
                            render: { 
                                fillStyle: wallSettings.color || '#000' 
                            }
                        }
                    );
                    wallBodies.push(wall);
                }
                
                // Create west wall if present
                if (cell.walls.west) {
                    const wall = Matter.Bodies.rectangle(
                        cellX,
                        cellY + cellHeight / 2,
                        5,
                        cellHeight,
                        { 
                            isStatic: true,
                            friction: wallSettings.friction || 0.1, 
                            render: { 
                                fillStyle: wallSettings.color || '#000' 
                            }
                        }
                    );
                    wallBodies.push(wall);
                }
            }
        }
        
        // Create exit at the bottom right
        const exitX = offsetX + (width - 0.5) * cellWidth;
        const exitY = offsetY + height * cellHeight;
        
        // Calculate ball properties
        const ballRadius = Math.min(cellWidth, cellHeight) * 0.3;
        const ballX = offsetX + width * cellWidth / 2;
        const ballY = offsetY + height * cellHeight / 2;
        
        return {
            walls: wallBodies,
            exitPosition: { x: exitX, y: exitY, angle: Math.PI / 2 },
            ballPosition: { x: ballX, y: ballY, radius: ballRadius }
        };
    }
    
    /**
     * Create boundary walls for the maze
     * @param {number} width - Width of the grid
     * @param {number} height - Height of the grid
     * @param {number} cellWidth - Width of each cell
     * @param {number} cellHeight - Height of each cell
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     * @param {Array} wallBodies - Array to add walls to
     * @param {Object} wallSettings - Settings for wall appearance and physics
     */
    function createBoundaryWalls(width, height, cellWidth, cellHeight, offsetX, offsetY, wallBodies, wallSettings) {
        // Canvas dimensions
        const canvasWidth = (width + 2) * cellWidth;
        const canvasHeight = (height + 2) * cellHeight;
        
        // Top wall
        const topWall = Matter.Bodies.rectangle(
            canvasWidth / 2,
            offsetY - cellHeight / 2,
            canvasWidth,
            cellHeight,
            { 
                isStatic: true,
                friction: wallSettings.friction || 0.1, 
                render: { 
                    fillStyle: wallSettings.boundaryColor || '#333' 
                }
            }
        );
        
        // Left wall
        const leftWall = Matter.Bodies.rectangle(
            offsetX - cellWidth / 2,
            canvasHeight / 2,
            cellWidth,
            canvasHeight,
            { 
                isStatic: true,
                friction: wallSettings.friction || 0.1, 
                render: { 
                    fillStyle: wallSettings.boundaryColor || '#333' 
                }
            }
        );
        
        // Right wall
        const rightWall = Matter.Bodies.rectangle(
            offsetX + width * cellWidth + cellWidth / 2,
            canvasHeight / 2,
            cellWidth,
            canvasHeight,
            { 
                isStatic: true,
                friction: wallSettings.friction || 0.1, 
                render: { 
                    fillStyle: wallSettings.boundaryColor || '#333' 
                }
            }
        );
        
        // Bottom wall
        const bottomWall = Matter.Bodies.rectangle(
            canvasWidth / 2,
            offsetY + height * cellHeight + cellHeight / 2,
            canvasWidth,
            cellHeight,
            { 
                isStatic: true,
                friction: wallSettings.friction || 0.1, 
                render: { 
                    fillStyle: wallSettings.boundaryColor || '#333' 
                }
            }
        );
        
        // Add walls to array
        wallBodies.push(topWall, leftWall, rightWall, bottomWall);
    }
    
    // Public API
    return {
        create,
        getUnvisitedNeighbors,
        getNeighbors,
        removeWalls
    };
})();

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RectGrid;
}
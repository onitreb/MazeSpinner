/**
 * Circular grid module for MazeSpinner
 * Handles circular grid creation and manipulation
 */

// Module variables
let grid = [];

/**
 * Create a new circular grid
 * @param {number} rings - Number of rings
 * @param {number} sectorsInOuterRing - Number of sectors in the outermost ring
 * @param {boolean} centerOpen - Whether the center is open
 * @returns {Object} - The grid and related methods
 */
function create(rings, sectorsInOuterRing, centerOpen = false) {
    grid = createCircularGrid(rings, sectorsInOuterRing, centerOpen);
    
    return {
        grid,
        getGrid: () => grid,
        cellToPixel: (cell, canvasSize) => cellToPixel(cell, rings, canvasSize),
        getCell: (ring, sector) => getCell(ring, sector),
        getRandomCell: () => getRandomCell(),
        createPhysicsBodies: (canvasSize, wallSettings) => 
            createMazeBodies(grid, rings, canvasSize, wallSettings),
        getNeighbors: (cell) => getNeighbors(cell, grid)
    };
}

/**
 * Create a circular grid structure
 * @param {number} rings - Number of rings
 * @param {number} sectorsInOuterRing - Number of sectors in the outermost ring
 * @param {boolean} centerOpen - Whether the center is open
 * @returns {Array} - The grid structure
 */
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
                inner: true,
                outer: true,
                cw: true,
                ccw: true,
                visited: false
            };
        }
    }
    
    return grid;
}

/**
 * Convert cell position to pixel coordinates
 * @param {Object} cell - The cell
 * @param {number} ringCount - Total number of rings
 * @param {number} canvasSize - Size of the canvas
 * @returns {Object} - The pixel coordinates {x, y}
 */
function cellToPixel(cell, ringCount, canvasSize) {
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const maxRadius = canvasSize * 0.45; // Leave margin
    
    // Calculate angle
    const angleSize = 2 * Math.PI / cell.totalSectors;
    const angle = angleSize * cell.sector;
    
    // Calculate radius
    const innerRadius = (cell.ring / ringCount) * maxRadius;
    const outerRadius = ((cell.ring + 1) / ringCount) * maxRadius;
    const radius = (innerRadius + outerRadius) / 2;
    
    // Convert to cartesian coordinates
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return { 
        x, 
        y,
        innerRadius,
        outerRadius,
        angle,
        angleSize
    };
}

/**
 * Get a cell from the grid
 * @param {number} ring - Ring index
 * @param {number} sector - Sector index
 * @returns {Object|null} - The cell or null if not found
 */
function getCell(ring, sector) {
    if (!grid[ring]) return null;
    
    const totalSectors = grid[ring].length;
    // Handle wrap-around for sectors
    const normalizedSector = ((sector % totalSectors) + totalSectors) % totalSectors;
    
    return grid[ring][normalizedSector];
}

/**
 * Get a random cell from the grid
 * @returns {Object} - A random cell
 */
function getRandomCell() {
    const ring = Math.floor(Math.random() * grid.length);
    const sector = Math.floor(Math.random() * grid[ring].length);
    return grid[ring][sector];
}

/**
 * Get the neighbors of a cell
 * @param {Object} cell - The cell
 * @param {Array} grid - The grid structure
 * @returns {Array} - Array of neighbor cells and their directions
 */
function getNeighbors(cell, grid) {
    const neighbors = [];
    const r = cell.ring;
    const s = cell.sector;
    const totalSectors = cell.totalSectors;
    
    // Inner neighbor (towards center)
    if (r > 0) {
        const innerRingSectorCount = grid[r-1].length;
        // Find closest sector in inner ring
        const innerRatio = innerRingSectorCount / totalSectors;
        const innerSector = Math.floor(s * innerRatio);
        
        if (grid[r-1] && grid[r-1][innerSector]) {
            neighbors.push({
                cell: grid[r-1][innerSector],
                direction: 'inner'
            });
        }
    }
    
    // Outer neighbor (away from center)
    if (r < grid.length - 1) {
        const outerRingSectorCount = grid[r+1].length;
        // Find sectors in outer ring that map to this sector
        const outerRatio = outerRingSectorCount / totalSectors;
        const startSector = Math.floor(s * outerRatio);
        const endSector = Math.floor((s + 1) * outerRatio) - 1;
        
        // Just use the middle one if multiple
        const outerSector = Math.round((startSector + endSector) / 2);
        
        if (grid[r+1] && grid[r+1][outerSector]) {
            neighbors.push({
                cell: grid[r+1][outerSector],
                direction: 'outer'
            });
        }
    }
    
    // Clockwise neighbor
    const cwSector = (s + 1) % totalSectors;
    if (grid[r] && grid[r][cwSector]) {
        neighbors.push({
            cell: grid[r][cwSector],
            direction: 'cw'
        });
    }
    
    // Counter-clockwise neighbor
    const ccwSector = (s - 1 + totalSectors) % totalSectors;
    if (grid[r] && grid[r][ccwSector]) {
        neighbors.push({
            cell: grid[r][ccwSector],
            direction: 'ccw'
        });
    }
    
    return neighbors;
}

/**
 * Remove walls between two cells
 * @param {Object} current - Current cell
 * @param {Object} neighbor - Neighbor cell
 * @param {string} direction - Direction to the neighbor
 */
function removeWalls(current, neighbor, direction) {
    switch (direction) {
        case 'inner':
            current.inner = false;
            
            // Find the matching outer wall in the neighbor
            const currentAngle = 2 * Math.PI * current.sector / current.totalSectors;
            let closestSector = neighbor.sector;
            let minAngleDiff = Infinity;
            
            // Find the sector in the neighbor's ring that best matches this angle
            for (let s = 0; s < neighbor.totalSectors; s++) {
                const neighborAngle = 2 * Math.PI * s / neighbor.totalSectors;
                const angleDiff = Math.abs(currentAngle - neighborAngle);
                if (angleDiff < minAngleDiff) {
                    minAngleDiff = angleDiff;
                    closestSector = s;
                }
            }
            
            if (closestSector === neighbor.sector) {
                neighbor.outer = false;
            }
            break;
            
        case 'outer':
            current.outer = false;
            
            // Find the matching inner wall in the neighbor
            const currAngle = 2 * Math.PI * current.sector / current.totalSectors;
            let bestSector = neighbor.sector;
            let smallestAngleDiff = Infinity;
            
            // Find the sector in the neighbor's ring that best matches this angle
            for (let s = 0; s < neighbor.totalSectors; s++) {
                const nbrAngle = 2 * Math.PI * s / neighbor.totalSectors;
                const angleDifference = Math.abs(currAngle - nbrAngle);
                if (angleDifference < smallestAngleDiff) {
                    smallestAngleDiff = angleDifference;
                    bestSector = s;
                }
            }
            
            if (bestSector === neighbor.sector) {
                neighbor.inner = false;
            }
            break;
            
        case 'cw':
            current.cw = false;
            neighbor.ccw = false;
            break;
            
        case 'ccw':
            current.ccw = false;
            neighbor.cw = false;
            break;
    }
}

/**
 * Create physics bodies for the maze
 * @param {Array} grid - The grid structure
 * @param {number} ringCount - Total number of rings
 * @param {number} canvasSize - Size of the canvas
 * @param {Object} wallSettings - Wall settings (thickness, color)
 * @returns {Array} - Array of wall bodies
 */
function createMazeBodies(grid, ringCount, canvasSize, wallSettings) {
    const bodies = [];
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const maxRadius = canvasSize * 0.45;
    const wallThickness = wallSettings.thickness || 5;
    
    // Create walls for each cell
    for (let r = 0; r < grid.length; r++) {
        for (let s = 0; s < grid[r].length; s++) {
            const cell = grid[r][s];
            const angleSize = 2 * Math.PI / cell.totalSectors;
            const startAngle = angleSize * cell.sector;
            
            // Inner wall (towards center)
            if (cell.inner) {
                const innerRadius = (cell.ring / ringCount) * maxRadius;
                // Use multiple segments for curved inner wall
                const segments = 5; // More segments for smoother curve
                const segmentAngleSize = angleSize / segments;
                
                for (let i = 0; i < segments; i++) {
                    const segStartAngle = startAngle + i * segmentAngleSize;
                    const segEndAngle = segStartAngle + segmentAngleSize;
                    const segMidAngle = (segStartAngle + segEndAngle) / 2;
                    
                    const x1 = centerX + innerRadius * Math.cos(segStartAngle);
                    const y1 = centerY + innerRadius * Math.sin(segStartAngle);
                    const x2 = centerX + innerRadius * Math.cos(segEndAngle);
                    const y2 = centerY + innerRadius * Math.sin(segEndAngle);
                    
                    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    
                    if (distance > wallThickness / 2) {
                        bodies.push({
                            type: 'wall',
                            x: (x1 + x2) / 2,
                            y: (y1 + y2) / 2,
                            width: distance,
                            height: wallThickness,
                            angle: segMidAngle + Math.PI / 2,
                            color: wallSettings.color || '#333'
                        });
                    }
                }
            }
            
            // Outer wall (away from center)
            if (cell.outer) {
                const outerRadius = ((cell.ring + 1) / ringCount) * maxRadius;
                // Use multiple segments for curved outer wall
                const segments = 5; // More segments for smoother curve
                const segmentAngleSize = angleSize / segments;
                
                for (let i = 0; i < segments; i++) {
                    const segStartAngle = startAngle + i * segmentAngleSize;
                    const segEndAngle = segStartAngle + segmentAngleSize;
                    const segMidAngle = (segStartAngle + segEndAngle) / 2;
                    
                    const x1 = centerX + outerRadius * Math.cos(segStartAngle);
                    const y1 = centerY + outerRadius * Math.sin(segStartAngle);
                    const x2 = centerX + outerRadius * Math.cos(segEndAngle);
                    const y2 = centerY + outerRadius * Math.sin(segEndAngle);
                    
                    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    
                    if (distance > wallThickness / 2) {
                        bodies.push({
                            type: 'wall',
                            x: (x1 + x2) / 2,
                            y: (y1 + y2) / 2,
                            width: distance,
                            height: wallThickness,
                            angle: segMidAngle + Math.PI / 2,
                            color: wallSettings.color || '#333'
                        });
                    }
                }
            }
            
            // Clockwise wall
            if (cell.cw) {
                const innerRadius = (cell.ring / ringCount) * maxRadius;
                const outerRadius = ((cell.ring + 1) / ringCount) * maxRadius;
                const angle = startAngle + angleSize;
                
                const innerX = centerX + innerRadius * Math.cos(angle);
                const innerY = centerY + innerRadius * Math.sin(angle);
                const outerX = centerX + outerRadius * Math.cos(angle);
                const outerY = centerY + outerRadius * Math.sin(angle);
                
                const distance = Math.sqrt(Math.pow(outerX - innerX, 2) + Math.pow(outerY - innerY, 2));
                
                bodies.push({
                    type: 'wall',
                    x: (innerX + outerX) / 2,
                    y: (innerY + outerY) / 2,
                    width: distance,
                    height: wallThickness,
                    angle: angle,
                    color: wallSettings.color || '#333'
                });
            }
            
            // Counter-clockwise wall
            if (cell.ccw) {
                const innerRadius = (cell.ring / ringCount) * maxRadius;
                const outerRadius = ((cell.ring + 1) / ringCount) * maxRadius;
                const angle = startAngle;
                
                const innerX = centerX + innerRadius * Math.cos(angle);
                const innerY = centerY + innerRadius * Math.sin(angle);
                const outerX = centerX + outerRadius * Math.cos(angle);
                const outerY = centerY + outerRadius * Math.sin(angle);
                
                const distance = Math.sqrt(Math.pow(outerX - innerX, 2) + Math.pow(outerY - innerY, 2));
                
                bodies.push({
                    type: 'wall',
                    x: (innerX + outerX) / 2,
                    y: (innerY + outerY) / 2,
                    width: distance,
                    height: wallThickness,
                    angle: angle,
                    color: wallSettings.color || '#333'
                });
            }
        }
    }
    
    // Add outer boundary wall for the last ring
    const lastRing = grid.length - 1;
    if (lastRing >= 0) {
        const outerRadius = (lastRing + 1) / ringCount * maxRadius;
        
        // Create circular boundary segments
        const segments = 72; // More segments for a smoother circle
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            const nextAngle = ((i + 1) / segments) * 2 * Math.PI;
            
            const x1 = centerX + outerRadius * Math.cos(angle);
            const y1 = centerY + outerRadius * Math.sin(angle);
            const x2 = centerX + outerRadius * Math.cos(nextAngle);
            const y2 = centerY + outerRadius * Math.sin(nextAngle);
            
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            
            bodies.push({
                type: 'wall',
                x: midX,
                y: midY,
                width: distance,
                height: wallThickness,
                angle: (angle + nextAngle) / 2 + Math.PI / 2,
                color: wallSettings.color || '#333',
                isBoundary: true
            });
        }
    }
    
    return bodies;
}

// Export the module
export const CircularGrid = {
    create,
    removeWalls,
    cellToPixel,
    getNeighbors
};
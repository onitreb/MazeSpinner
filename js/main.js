/**
 * Main entry point for MazeSpinner
 * Coordinates between modules and initializes the application
 */

// Import modules
import { CircularGrid } from './circular/grid.js';
import { CircularMazeAlgorithms } from './circular/algorithms.js';
import { MazeControls } from './common/controls.js';
import { PhysicsEngine } from './common/engine.js';
import { MazeUtils } from './common/utils.js';

// Constants
const MAZE_TYPE = {
  RECTANGULAR: 'rectangular',
  CIRCULAR: 'circular'
};

/**
 * Initialize the maze application
 * @param {string} mazeType - Type of maze to initialize
 * @param {HTMLElement} container - DOM container to render the maze
 * @param {Object} config - Configuration options
 */
export function initMaze(mazeType, container, config = {}) {
  // Default configuration
  const defaultConfig = {
    rings: 5,
    sectorsInOuterRing: 12,
    centerOpen: false,
    algorithm: 'backtracker',
    wallThickness: 5,
    ballRadius: 10,
    ballMass: 10,
    wallColor: '#333',
    ballColor: '#ff5722',
    backgroundColor: '#f5f5f5',
    showWalls: true,
    rotationSpeed: 0.05,
    friction: 0.05,
    restitution: 0.7
  };
  
  // Merge default config with provided config
  const mergedConfig = { ...defaultConfig, ...config };
  
  // Initialize the appropriate maze type
  if (mazeType === MAZE_TYPE.CIRCULAR) {
    initCircularMaze(container, mergedConfig);
  } else if (mazeType === MAZE_TYPE.RECTANGULAR) {
    // To be implemented
    console.log('Rectangular maze not yet implemented in modular version');
  } else {
    console.error('Unknown maze type:', mazeType);
  }
}

/**
 * Initialize a circular maze
 * @param {HTMLElement} container - DOM container to render the maze
 * @param {Object} config - Configuration options
 */
function initCircularMaze(container, config) {
  console.log("Initializing circular maze with config:", config);
  
  // Create the grid
  console.log("Creating grid...");
  const grid = CircularGrid.create(
    config.rings,
    config.sectorsInOuterRing,
    config.centerOpen
  );
  console.log("Grid created:", grid);
  
  // Generate the maze using the selected algorithm
  console.log("Generating maze with algorithm:", config.algorithm);
  CircularMazeAlgorithms.generateMaze(
    grid,
    grid.getGrid(),
    config.algorithm,
    config.rings
  );
  console.log("Maze generated");
  
  // Initialize the physics engine
  const engine = PhysicsEngine.create(
    container,
    config.backgroundColor
  );
  
  // Add physics bodies for the maze
  const canvasSize = Math.min(container.clientWidth, container.clientHeight);
  const wallSettings = {
    thickness: config.wallThickness,
    color: config.wallColor
  };
  
  const bodies = grid.createPhysicsBodies(canvasSize, wallSettings);
  engine.addBodies(bodies);
  
  // Add the ball
  const ballSettings = {
    radius: config.ballRadius,
    mass: config.ballMass,
    color: config.ballColor,
    friction: config.friction,
    restitution: config.restitution
  };
  
  engine.addBall(ballSettings);
  
  // Initialize controls
  MazeControls.initialize(engine, {
    rotationSpeed: config.rotationSpeed
  });
  
  // Start the engine
  engine.start();
  
  // Return API for external control
  return {
    regenerate: (newConfig = {}) => {
      // Stop the current engine
      engine.stop();
      
      // Reinitialize with new config
      initCircularMaze(container, { ...config, ...newConfig });
    },
    getEngine: () => engine,
    getGrid: () => grid
  };
}

// Export constants and main functions
export const MazeTypes = MAZE_TYPE;
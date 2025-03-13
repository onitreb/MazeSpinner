/**
 * Controls module for MazeSpinner
 * Handles user input and UI interactions
 */

import { MazeUtils } from './utils.js';

// Module variables
let engine;
let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;
let rotationSpeed = 0.05;

/**
 * Initialize controls
 * @param {Object} engineInstance - Physics engine instance
 * @param {Object} options - Control options
 */
function initialize(engineInstance, options = {}) {
    engine = engineInstance;
    
    // Set rotation speed if provided
    if (options.rotationSpeed) {
        rotationSpeed = options.rotationSpeed;
        engine.setRotationSpeed(rotationSpeed);
    }
    
    // Clean up existing event listeners if any
    cleanup();
    
    // Set up event listeners
    setupKeyboardControls();
    setupTouchControls();
}

/**
 * Set up keyboard controls
 */
function setupKeyboardControls() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

/**
 * Handle key down events
 * @param {KeyboardEvent} event - Key event
 */
function handleKeyDown(event) {
    if (!engine) return;
    
    switch(event.key) {
        case 'ArrowLeft':
            engine.startRotation(-1);
            break;
        case 'ArrowRight':
            engine.startRotation(1);
            break;
        case 'r':
        case 'R':
            engine.resetBall();
            break;
    }
}

/**
 * Handle key up events
 * @param {KeyboardEvent} event - Key event
 */
function handleKeyUp(event) {
    if (!engine) return;
    
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        engine.stopRotation();
    }
}

/**
 * Set up touch controls
 */
function setupTouchControls() {
    const canvas = engine.getCanvas();
    
    if (!canvas) return;
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // For mouse controls
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

/**
 * Handle touch start event
 * @param {TouchEvent} event - Touch event
 */
function handleTouchStart(event) {
    if (!engine) return;
    
    event.preventDefault();
    
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isTouching = true;
}

/**
 * Handle touch move event
 * @param {TouchEvent} event - Touch event
 */
function handleTouchMove(event) {
    if (!engine || !isTouching) return;
    
    event.preventDefault();
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX;
    
    // Determine rotation direction based on swipe
    if (deltaX > 10) {
        engine.rotateRight();
        touchStartX = touch.clientX;
    } else if (deltaX < -10) {
        engine.rotateLeft();
        touchStartX = touch.clientX;
    }
}

/**
 * Handle touch end event
 * @param {TouchEvent} event - Touch event
 */
function handleTouchEnd(event) {
    isTouching = false;
}

/**
 * Handle mouse down event
 * @param {MouseEvent} event - Mouse event
 */
function handleMouseDown(event) {
    if (!engine) return;
    
    touchStartX = event.clientX;
    touchStartY = event.clientY;
    isTouching = true;
}

/**
 * Handle mouse move event
 * @param {MouseEvent} event - Mouse event
 */
function handleMouseMove(event) {
    if (!engine || !isTouching) return;
    
    const deltaX = event.clientX - touchStartX;
    
    // Determine rotation direction based on mouse movement
    if (deltaX > 10) {
        engine.rotateRight();
        touchStartX = event.clientX;
    } else if (deltaX < -10) {
        engine.rotateLeft();
        touchStartX = event.clientX;
    }
}

/**
 * Handle mouse up event
 * @param {MouseEvent} event - Mouse event
 */
function handleMouseUp(event) {
    isTouching = false;
}

/**
 * Clean up event listeners
 */
function cleanup() {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    
    const canvas = engine?.getCanvas();
    
    if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('mousedown', handleMouseDown);
    }
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
}

/**
 * Set rotation speed
 * @param {number} speed - Rotation speed
 */
function setRotationSpeed(speed) {
    rotationSpeed = speed;
    if (engine) {
        engine.setRotationSpeed(speed);
    }
}

// Export the module
export const MazeControls = {
    initialize,
    cleanup,
    setRotationSpeed
};
/**
 * Physics engine module for MazeSpinner
 * Uses Matter.js to create and manage physics objects
 */

/**
 * Create a new physics engine
 * @param {HTMLElement} container - DOM container to render the engine
 * @param {string} backgroundColor - Background color for the canvas
 * @returns {Object} - Engine API
 */
function create(container, backgroundColor = '#f5f5f5') {
    // Module variables
    let engine, render, runner;
    let ball, walls = [];
    let gravity = { x: 0, y: 1 };
    let rotateInterval = null;
    let rotationDirection = 0;
    let rotationSpeed = 0.05;
    let canvasSize;
    
    /**
     * Initialize the physics engine
     */
    function initialize() {
        // Clean up any existing engine
        cleanup();
        
        // Calculate canvas size
        canvasSize = Math.min(container.clientWidth, container.clientHeight) - 40;
        
        // Create engine
        engine = Matter.Engine.create({
            // Better for mobile performance
            positionIterations: 6,
            velocityIterations: 4
        });
        
        // Create renderer
        render = Matter.Render.create({
            element: container,
            engine: engine,
            options: {
                width: canvasSize,
                height: canvasSize,
                wireframes: false,
                background: backgroundColor,
                showAngleIndicator: false,
                // Custom render functions for smooth scaling and rotation
                beforeRender: function() {
                    const ctx = render.context;
                    const canvasWidth = render.options.width;
                    const canvasHeight = render.options.height;
                    
                    // Save the context state
                    ctx.save();
                    
                    // Translate to center, scale slightly to prevent cropping during rotation
                    ctx.translate(canvasWidth / 2, canvasHeight / 2);
                    ctx.scale(0.75, 0.75);
                    ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
                },
                afterRender: function() {
                    // Restore the context state
                    render.context.restore();
                }
            }
        });
        
        // Set gravity
        updateGravity();
        
        // Create runner
        runner = Matter.Runner.create();
    }
    
    /**
     * Update gravity based on current orientation
     */
    function updateGravity() {
        Matter.World.clear(engine.world, false);
        engine.world.gravity.x = gravity.x;
        engine.world.gravity.y = gravity.y;
    }
    
    /**
     * Start the physics engine
     */
    function start() {
        // Start the runner
        Matter.Runner.run(runner, engine);
        Matter.Render.run(render);
    }
    
    /**
     * Stop the physics engine and cleanup
     */
    function stop() {
        cleanup();
    }
    
    /**
     * Clean up resources
     */
    function cleanup() {
        if (rotateInterval) {
            clearInterval(rotateInterval);
            rotateInterval = null;
        }
        
        if (render) {
            Matter.Render.stop(render);
            render.canvas.remove();
            render.canvas = null;
            render.context = null;
            render.textures = {};
        }
        
        if (runner) {
            Matter.Runner.stop(runner);
        }
        
        if (engine) {
            Matter.World.clear(engine.world, false);
            Matter.Engine.clear(engine);
        }
    }
    
    /**
     * Add bodies to the world
     * @param {Array} bodies - Array of body definitions
     */
    function addBodies(bodies) {
        walls = [];
        
        for (const body of bodies) {
            if (body.type === 'wall') {
                const wall = Matter.Bodies.rectangle(
                    body.x,
                    body.y,
                    body.width,
                    body.height,
                    {
                        isStatic: true,
                        angle: body.angle,
                        friction: 0.1,
                        render: {
                            fillStyle: body.color || '#333'
                        }
                    }
                );
                
                walls.push(wall);
            }
        }
        
        Matter.World.add(engine.world, walls);
    }
    
    /**
     * Add a ball to the world
     * @param {Object} options - Ball options
     */
    function addBall(options = {}) {
        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;
        const radius = options.radius || 10;
        
        // Create ball
        ball = Matter.Bodies.circle(
            centerX,
            centerY,
            radius,
            {
                mass: options.mass || 10,
                restitution: options.restitution || 0.7,
                friction: options.friction || 0.05,
                frictionAir: 0.01,
                render: {
                    fillStyle: options.color || '#ff5722'
                }
            }
        );
        
        Matter.World.add(engine.world, ball);
    }
    
    /**
     * Reset the ball to the center
     */
    function resetBall() {
        if (!ball) return;
        
        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;
        
        Matter.Body.setPosition(ball, { x: centerX, y: centerY });
        Matter.Body.setVelocity(ball, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(ball, 0);
    }
    
    /**
     * Rotate the maze left (counter-clockwise)
     */
    function rotateLeft() {
        rotationDirection = -1;
        rotateOnce();
    }
    
    /**
     * Rotate the maze right (clockwise)
     */
    function rotateRight() {
        rotationDirection = 1;
        rotateOnce();
    }
    
    /**
     * Perform a single rotation step
     */
    function rotateOnce() {
        // Calculate the new gravity angle
        const angle = Math.atan2(gravity.y, gravity.x);
        const newAngle = angle + (rotationDirection * rotationSpeed);
        
        // Set new gravity direction
        gravity.x = Math.cos(newAngle);
        gravity.y = Math.sin(newAngle);
        
        // Update engine gravity
        updateGravity();
    }
    
    /**
     * Start continuous rotation
     * @param {number} direction - Direction of rotation (-1 for left, 1 for right)
     */
    function startRotation(direction) {
        stopRotation();
        rotationDirection = direction;
        rotateInterval = setInterval(rotateOnce, 50);
    }
    
    /**
     * Stop continuous rotation
     */
    function stopRotation() {
        if (rotateInterval) {
            clearInterval(rotateInterval);
            rotateInterval = null;
        }
    }
    
    /**
     * Set rotation speed
     * @param {number} speed - Rotation speed
     */
    function setRotationSpeed(speed) {
        rotationSpeed = speed;
    }
    
    // Initialize the engine
    initialize();
    
    // Return public API
    return {
        start,
        stop,
        addBodies,
        addBall,
        resetBall,
        rotateLeft,
        rotateRight,
        startRotation,
        stopRotation,
        setRotationSpeed,
        getEngine: () => engine,
        getWorld: () => engine.world,
        getGravity: () => gravity,
        getCanvas: () => render.canvas,
    };
}

// Export the module
export const PhysicsEngine = {
    create
};
console.log("Debug script loaded");

// Log any uncaught errors
window.addEventListener('error', function(event) {
    console.error('Uncaught error:', event.error);
});

// Check if modules are loading correctly
function checkModuleLoading() {
    console.log("Checking module loading...");
    
    // Try to import the main module
    import('./js/main.js')
        .then(module => {
            console.log("Main module loaded successfully:", module);
        })
        .catch(error => {
            console.error("Error loading main module:", error);
        });
    
    // Try to import individual modules
    import('./js/circular/grid.js')
        .then(module => {
            console.log("Circular grid module loaded successfully");
        })
        .catch(error => {
            console.error("Error loading circular grid module:", error);
        });
    
    import('./js/circular/algorithms.js')
        .then(module => {
            console.log("Circular algorithms module loaded successfully");
        })
        .catch(error => {
            console.error("Error loading circular algorithms module:", error);
        });
    
    import('./js/common/engine.js')
        .then(module => {
            console.log("Engine module loaded successfully");
        })
        .catch(error => {
            console.error("Error loading engine module:", error);
        });
    
    import('./js/common/controls.js')
        .then(module => {
            console.log("Controls module loaded successfully");
        })
        .catch(error => {
            console.error("Error loading controls module:", error);
        });
    
    import('./js/common/utils.js')
        .then(module => {
            console.log("Utils module loaded successfully");
        })
        .catch(error => {
            console.error("Error loading utils module:", error);
        });
}

// Run the check when the page loads
window.addEventListener('DOMContentLoaded', checkModuleLoading);
// Configuration file for E-commerce Frontend
// Update the BACKEND_URL when needed

const CONFIG = {
    // Backend API URL - Update this when deploying
    BACKEND_URL: 'https://e-comm-api-ati0.onrender.com'
};

// Make available globally
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

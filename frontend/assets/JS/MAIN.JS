// Main JavaScript for E-commerce Platform

// Backend API URL
const BACKEND_URL = 'https://k2c936dp-8000.inc1.devtunnels.ms';

// Store all products from backend
let allProducts = [];

// Load components
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        
        // Update cart count after navbar loads
        if (elementId === 'navbar') {
            updateCartCount();
        }
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
    }
}

// Fetch recommended products from backend (always call on page visit)
async function fetchRecommendedProducts() {
    try {
        // Determine user id: prefer explicit stored user_id, fall back to 11
        const storedUserId = parseInt(localStorage.getItem('user_id'));
        const userId = Number.isInteger(storedUserId) ? storedUserId : 11;
        console.log('Fetching recommendations for user:', userId);

        const grid = document.getElementById('recommendedGrid');
        if (grid) {
            grid.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div><p class="text-gray-600 mt-4">Loading personalized recommendations...</p></div>';
        }

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`${BACKEND_URL}/recommend/${userId}?limit=8`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received recommendations:', data.recommendation_count);

        // Return recommendations (no caching - fresh on every homepage visit)
        return data.recommendations || [];
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Recommendations request timeout');
        } else {
            console.error('Error fetching recommendations:', error);
        }
        // Fallback to empty - UI will handle fallback
        return [];
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Load navbar and footer
    loadComponent('navbar', 'components/navbar.html');
    loadComponent('footer', 'components/footer.html');
    
    // Load recommended products if on index page
    if (document.getElementById('recommendedGrid')) {
        displayRecommendedProducts();
    }
});

// Track add to cart for recommendations
async function trackAddToCart(productId) {
    try {
        const userId = 11;
        const trackingData = {
            product_id: parseInt(productId),
            user_id: userId
        };
        
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${BACKEND_URL}/addedToCart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackingData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            console.log('✅ Add to cart tracked from home page');
        }
    } catch (error) {
        console.warn('⚠️ Home page tracking failed:', error.message);
    }
}

// Add to cart functionality
async function addToCart(productId) {
    try {
        console.log('🛒 Home page: Adding product to cart:', productId);
        
        // Track add to cart (non-blocking)
        trackAddToCart(productId).catch(err => console.warn('Tracking failed:', err));
        
        // Get product info - we need at least basic info for the cart
        let product = allProducts.find(p => p.id === productId);
        
        // If not in cache, we'll use minimal data structure
        if (!product) {
            product = {
                id: productId,
                name: 'Product',
                price: 0,
                image: '',
                quantity: 1
            };
        }
        
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Show notification
        showNotification('Product added to cart!');
        console.log('🛒 Cart updated successfully');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add product to cart');
    }
}

// Update cart count in navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Clear recommendation history handler (delegated)
document.addEventListener('click', async (e) => {
    const target = e.target.closest && e.target.closest('#clearRecBtn');
    if (!target) return;

    // Only proceed if user confirms
    if (!confirm('This will clear your recommendation history on the server. Continue?')) return;

    try {
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${BACKEND_URL}/interactions`, {
            method: 'DELETE',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Failed to clear interactions: ${response.status}`);
        }

        // Optionally clear any client-side recommendation cache
        try { localStorage.removeItem('recommendations'); } catch (err) { /* ignore */ }

        showNotification('Recommendation history cleared');

        // Refresh recommendations on the page if the function is available
        if (typeof displayRecommendedProducts === 'function') {
            displayRecommendedProducts();
        } else {
            // Fallback: reload page to ensure UI updates
            setTimeout(() => window.location.reload(), 800);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            showNotification('Request timed out while clearing history');
        } else {
            console.error('Error clearing recommendation history:', error);
            showNotification('Failed to clear recommendation history');
        }
    }
});

// Display recommended products
async function displayRecommendedProducts() {
    const grid = document.getElementById('recommendedGrid');
    if (!grid) return;
    
    // Fetch personalized recommendations from backend
    const recommendedProducts = await fetchRecommendedProducts();
    
    if (!recommendedProducts || recommendedProducts.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-600 text-lg mb-4">No recommendations available yet</p>
                <p class="text-gray-500 text-sm">Browse products to get personalized recommendations!</p>
            </div>
        `;
        return;
    }
    
    // Store products globally for cart functionality
    allProducts = recommendedProducts;
    
    grid.innerHTML = recommendedProducts.map(product => {
        const originalPrice = product.price * 1.2; // Calculate 20% discount
        const discount = 20;
        const rating = parseFloat((Math.random() * 0.9 + 4.1).toFixed(1));
        const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
        const reviews = Math.floor(Math.random() * 500) + 50;
        
        return `
            <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
                <div class="relative overflow-hidden">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110">
                    </div>
                    <div class="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
                        <span class="discount-badge bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                            ${discount}% OFF
                        </span>
                        <button class="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110">
                            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p class="text-white text-sm line-clamp-2">${product.description}</p>
                    </div>
                </div>
                <div class="p-5">
                    <div class="mb-3">
                        <h3 class="text-xl font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">${product.name}</h3>
                        <span class="inline-block bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full font-medium">${product.category_name || 'Product'}</span>
                    </div>
                    
                    <div class="flex items-center mb-4">
                        <div class="star-rating text-yellow-400 text-lg">
                            ${stars}
                        </div>
                        <span class="text-gray-600 text-sm ml-2 font-medium">${rating}</span>
                        <span class="text-gray-400 text-xs ml-1">(${reviews} reviews)</span>
                    </div>
                    
                    <div class="mb-4 flex items-baseline gap-2">
                        <span class="price-tag text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            $${product.price}
                        </span>
                        <span class="text-gray-400 line-through text-lg">$${originalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="addToCart(${product.id})" class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            Add to Cart
                        </button>
                        <a href="product.html?id=${product.id}" class="bg-gray-100 text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center transform hover:-translate-y-0.5 shadow-md hover:shadow-lg">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredProducts = products.filter(p => 
                    p.name.toLowerCase().includes(searchTerm) || 
                    p.description.toLowerCase().includes(searchTerm)
                );
                
                const grid = document.getElementById('productsGrid');
                if (grid) {
                    grid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
                }
            });
        }
    }, 100);
});

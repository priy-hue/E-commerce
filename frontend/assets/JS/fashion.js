// Fashion Category Page JavaScript

// Backend API URL
const BACKEND_URL = 'https://k2c936dp-8000.inc1.devtunnels.ms';

// Store products fetched from backend
let fashionProducts = [];
let currentSubcategory = 'all';
let currentSort = 'featured';
let filteredProducts = [];

// Category ID for fashion
const FASHION_CATEGORY_ID = 1;

// Track add to cart (with timeout and non-blocking)
async function trackAddToCart(productId) {
    console.log('🛒 === TRACKING ADD TO CART ===');
    console.log('🛒 Product ID:', productId);
    
    try {
        const userId = 11;
        const trackingData = {
            product_id: parseInt(productId),
            user_id: userId
        };
        
        console.log('🛒 Sending tracking data:', trackingData);
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(`${BACKEND_URL}/addedToCart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackingData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Add to cart tracked successfully');
        } else {
            console.warn('⚠️ Tracking response not OK:', response.status);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('⚠️ Tracking timeout (request took >3s), continuing...');
        } else {
            console.warn('⚠️ Tracking failed:', error.message);
        }
    }
    console.log('🛒 === END TRACKING ===');
}

// Load components
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        if (elementId === 'navbar') updateCartCount();
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
    }
}

// Fetch products from backend with timeout and caching
async function fetchProducts() {
    try {
        console.log('Fashion: Starting to fetch products...');
        
        const grid = document.getElementById('fashionGrid');
        if (!grid) {
            console.error('Fashion: fashionGrid element not found!');
            return;
        }
        
        // Check cache first
        const cachedData = sessionStorage.getItem(`fashion_products_${FASHION_CATEGORY_ID}`);
        if (cachedData) {
            console.log('Fashion: Using cached products');
            const cached = JSON.parse(cachedData);
            fashionProducts = cached;
            filteredProducts = [...fashionProducts];
            displayProducts();
            return;
        }
        
        console.log('Fashion: Grid element found');
        grid.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div><p class="text-gray-600 mt-4">Loading products...</p></div>';
        
        const url = `${BACKEND_URL}/category/${FASHION_CATEGORY_ID}`;
        console.log('Fashion: Fetching from URL:', url);
        
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        console.log('Fashion: Response status:', response.status, 'OK:', response.ok);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch products. Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fashion: Number of products received:', data.products ? data.products.length : 0);
        
        // Transform backend data to match frontend structure
        fashionProducts = data.products.map(product => {
            const subcategory = determineSubcategory(product.category_id, product.name);
            console.log(`Fashion: Product "${product.name}" (category_id: ${product.category_id}) -> subcategory: ${subcategory}`);
            
            return {
                id: product.id,
                name: product.name,
                subcategory: subcategory,
                price: product.price,
                originalPrice: product.price * 1.2,
                image: product.image,
                rating: parseFloat((Math.random() * 0.9 + 4.1).toFixed(1)),
                reviews: Math.floor(Math.random() * 500) + 50,
                description: product.description
            };
        });
        
        console.log('Fashion: Transformed products count:', fashionProducts.length);
        
        // Cache products for 5 minutes
        sessionStorage.setItem(`fashion_products_${FASHION_CATEGORY_ID}`, JSON.stringify(fashionProducts));
        
        filteredProducts = [...fashionProducts];
        console.log('Fashion: Calling displayProducts()');
        displayProducts();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Fashion: Request timeout');
            showErrorMessage('Request timed out. Please check your connection and try again.');
        } else {
            console.error('Fashion: Error fetching products:', error);
            showErrorMessage('Failed to load products. Please try again later.');
        }
    }
}

// Determine subcategory based on category_id or product name
function determineSubcategory(categoryId, productName) {
    const subcategoryMap = {
        5: 'mens',
        6: 'womens',
        7: 'shoes',
        8: 'accessories',
        9: 'jewelry'
    };
    
    if (subcategoryMap[categoryId]) {
        return subcategoryMap[categoryId];
    }
    
    const nameLower = productName.toLowerCase();
    if (nameLower.includes('men') && !nameLower.includes('women')) {
        return 'mens';
    } else if (nameLower.includes('women') || nameLower.includes('dress') || nameLower.includes('blouse')) {
        return 'womens';
    } else if (nameLower.includes('shoe') || nameLower.includes('sneaker') || nameLower.includes('boot')) {
        return 'shoes';
    } else if (nameLower.includes('ring') || nameLower.includes('necklace') || nameLower.includes('earring') || nameLower.includes('bracelet')) {
        return 'jewelry';
    } else {
        return 'accessories';
    }
}

// Show error message
function showErrorMessage(message) {
    const grid = document.getElementById('fashionGrid');
    grid.innerHTML = `
        <div class="col-span-full text-center py-12">
            <p class="text-red-600 text-lg">${message}</p>
            <button onclick="fetchProducts()" class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Retry
            </button>
        </div>
    `;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar', 'components/navbar.html');
    loadComponent('footer', 'components/footer.html');
    fetchProducts();
});

// Filter by subcategory
function filterBySubcategory(subcategory) {
    currentSubcategory = subcategory;
    console.log('Filtering by subcategory:', subcategory); // Debug log
    
    // Update button styles
    document.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.classList.remove('bg-pink-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-800');
    });
    event.target.closest('button').classList.remove('bg-gray-100', 'text-gray-800');
    event.target.closest('button').classList.add('bg-pink-600', 'text-white');
    
    displayProducts();
}

// Sort products
function sortProducts(sortBy) {
    currentSort = sortBy;
    displayProducts();
}

// Display products
function displayProducts() {
    console.log('Fashion: displayProducts called');
    
    const grid = document.getElementById('fashionGrid');
    const noProductsMsg = document.getElementById('noProducts');
    
    if (!grid) {
        console.error('Fashion: fashionGrid element not found in displayProducts!');
        return;
    }
    
    console.log('Fashion: Current subcategory:', currentSubcategory);
    console.log('Fashion: All products count:', fashionProducts.length);
    
    filteredProducts = currentSubcategory === 'all' 
        ? [...fashionProducts]
        : fashionProducts.filter(p => p.subcategory === currentSubcategory);
    
    console.log('Fashion: Filtered products count:', filteredProducts.length);
    
    switch(currentSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            filteredProducts.sort((a, b) => b.id - a.id);
            break;
    }
    
    document.getElementById('productCount').textContent = filteredProducts.length;
    
    if (filteredProducts.length === 0) {
        grid.classList.add('hidden');
        noProductsMsg.classList.remove('hidden');
    } else {
        grid.classList.remove('hidden');
        noProductsMsg.classList.add('hidden');
        grid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
    }
}

// Create product card
function createProductCard(product) {
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    
    return `
        <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
            <div class="relative overflow-hidden">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110">
                </div>
                <div class="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
                    <span class="discount-badge bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        ${discount}% OFF
                    </span>
                    <button class="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110">
                        <svg class="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <h3 class="text-xl font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-pink-600 transition-colors">${product.name}</h3>
                    <span class="inline-block bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full font-medium">Fashion</span>
                </div>
                
                <div class="flex items-center mb-4">
                    <div class="star-rating text-yellow-400 text-lg">
                        ${stars}
                    </div>
                    <span class="text-gray-600 text-sm ml-2 font-medium">${product.rating}</span>
                    <span class="text-gray-400 text-xs ml-1">(${product.reviews} reviews)</span>
                </div>
                
                <div class="mb-4 flex items-baseline gap-2">
                    <span class="price-tag text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        $${product.price}
                    </span>
                    <span class="text-gray-400 line-through text-lg">$${product.originalPrice.toFixed(2)}</span>
                </div>
                
                <div class="flex gap-2">
                    <button onclick="addToCart(${product.id})" class="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
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
}

// Add to cart
function addToCart(productId) {
    console.log('🛒 Fashion: addToCart called with product ID:', productId);
    
    const product = fashionProducts.find(p => p.id === productId);
    if (!product) {
        console.log('🛒 Product not found');
        return;
    }
    
    console.log('🛒 Product found:', product.name);
    console.log('🛒 Calling trackAddToCart...');
    
    // Track add to cart action (fire and forget)
    trackAddToCart(productId).then(() => {
        console.log('🛒 Tracking complete');
    }).catch(err => {
        console.error('🛒 Tracking failed:', err);
    });
    
    console.log('🛒 Updating localStorage...');
    
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
    showNotification('Product added to cart!');
    console.log('🛒 Cart updated successfully');
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) cartCountElement.textContent = totalItems;
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Product Details Page JavaScript

console.log('Product.js loaded! VERSION 2.0 - WITH TRACKING');

// Backend API URL
const BACKEND_URL = 'https://k2c936dp-8000.inc1.devtunnels.ms';

// Store current product
let currentProduct = null;

console.log('Backend URL:', BACKEND_URL);

// Track product view (with timeout)
async function trackProductView(productId) {
    try {
        console.log('=== TRACKING PRODUCT VIEW ===');
        console.log('Product ID:', productId);
        
        const userId = 11;
        const trackingData = {
            product_id: parseInt(productId),
            user_id: userId
        };
        
        console.log('Sending tracking data:', trackingData);
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(`${BACKEND_URL}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackingData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Product view tracked successfully');
        } else {
            console.warn('⚠️ Tracking response not OK:', response.status);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('⚠️ Tracking timeout (request took >3s)');
        } else {
            console.warn('⚠️ Tracking failed:', error.message);
        }
    }
    console.log('=== END TRACKING ===');
}

// Track add to cart
async function trackAddToCart(productId) {
    try {
        const userId = 11; // Fixed user ID
        
        console.log('Tracking add to cart:', { productId, userId });
        
        const response = await fetch(`${BACKEND_URL}/addedToCart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: parseInt(productId),
                user_id: userId
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Add to cart tracked:', data);
        } else {
            console.error('❌ Failed to track add to cart:', response.status);
        }
    } catch (error) {
        console.error('❌ Error tracking add to cart:', error);
    }
}

// Load components
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        
        if (elementId === 'navbar') {
            updateCartCount();
        }
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired!');
    
    loadComponent('navbar', 'components/navbar.html');
    loadComponent('footer', 'components/footer.html');
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    console.log('Product ID from URL:', productId);
    console.log('URL params:', window.location.search);
    
    if (productId) {
        console.log('Loading product details for ID:', productId);
        loadProductDetails(productId);
    } else {
        console.log('No product ID found!');
        showError('No product ID specified');
    }
});

// Load product details from backend
async function loadProductDetails(productId) {
    console.log('🔍 loadProductDetails called with ID:', productId);
    
    try {
        // Show loading state
        document.getElementById('productName').textContent = 'Loading...';
        document.getElementById('productDescription').textContent = 'Fetching product details...';
        
        console.log('Fetching product ID:', productId);
        console.log('URL:', `${BACKEND_URL}/products/${productId}`);
        
        const response = await fetch(`${BACKEND_URL}/products/${productId}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            // If /products/{id} doesn't exist, try fetching from categories
            console.log('Direct product fetch failed, trying category approach');
            await loadProductFromCategories(productId);
            return;
        }
        
        const product = await response.json();
        currentProduct = product;
        
        console.log('Product details:', product);
        console.log('➡️ About to call trackProductView...');
        
        // Track product view
        await trackProductView(productId);
        
        console.log('✅ Tracking complete, continuing with UI updates...');
        
        // Update product details
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productCategory').textContent = getCategoryName(product.category_id);
        document.getElementById('productPrice').textContent = `$${product.price}`;
        
        // Calculate and show original price
        const originalPrice = (product.price * 1.2).toFixed(2);
        const originalPriceElement = document.getElementById('originalPrice');
        if (originalPriceElement) {
            originalPriceElement.textContent = `$${originalPrice}`;
        }
        
        document.getElementById('productDescription').textContent = product.description;
        
        // Load main image
        const mainImage = document.getElementById('mainImage');
        mainImage.src = product.image;
        
    } catch (error) {
        console.error('Error loading product:', error);
        // Try alternative method
        await loadProductFromCategories(productId);
    }
}

// Alternative method: Load product by searching through categories
async function loadProductFromCategories(productId) {
    try {
        console.log('Searching for product in categories...');
        const categoryIds = [1, 2, 3, 4];
        
        for (const catId of categoryIds) {
            const response = await fetch(`${BACKEND_URL}/category/${catId}`);
            if (!response.ok) continue;
            
            const data = await response.json();
            const product = data.products.find(p => p.id === productId);
            
            if (product) {
                console.log('Found product:', product);
                currentProduct = product;
                
                // Track product view
                await trackProductView(productId);
                
                // Update product details
                document.getElementById('productName').textContent = product.name;
                document.getElementById('productCategory').textContent = getCategoryName(product.category_id);
                document.getElementById('productPrice').textContent = `$${product.price}`;
                
                // Calculate and show original price
                const originalPrice = (product.price * 1.2).toFixed(2);
                const originalPriceElement = document.getElementById('originalPrice');
                if (originalPriceElement) {
                    originalPriceElement.textContent = `$${originalPrice}`;
                }
                
                document.getElementById('productDescription').textContent = product.description;
                
                // Load main image
                const mainImage = document.getElementById('mainImage');
                mainImage.src = product.image;
                
                return;
            }
        }
        
        showError('Product not found');
    } catch (error) {
        console.error('Error in loadProductFromCategories:', error);
        showError('Failed to load product details');
    }
}

// Get category name from category_id
function getCategoryName(categoryId) {
    const categoryMap = {
        1: 'Fashion',
        2: 'Electronics',
        3: 'Home & Living',
        4: 'Sports',
        // Subcategories
        5: 'Mens Fashion',
        6: 'Womens Fashion',
        7: 'Shoes',
        8: 'Accessories',
        9: 'Jewelry',
        10: 'Laptops',
        11: 'Mobiles',
        12: 'Tablets',
        13: 'Headphones',
        14: 'Electronics Accessories',
        15: 'Furniture',
        16: 'Kitchen',
        17: 'Decor',
        18: 'Bedding',
        19: 'Lighting',
        20: 'Fitness',
        21: 'Outdoor',
        22: 'Cycling',
        23: 'Yoga',
        24: 'Team Sports'
    };
    
    return categoryMap[categoryId] || 'Product';
}

// Show error message
function showError(message) {
    console.log('Showing error:', message);
    document.getElementById('productName').textContent = message;
    document.getElementById('productCategory').textContent = '';
    document.getElementById('productPrice').textContent = '';
    document.getElementById('productDescription').textContent = 'Please try again or go back to the homepage.';
}

// Change main image
function changeImage(src) {
    document.getElementById('mainImage').src = src;
}

// Quantity controls
function increaseQuantity() {
    const input = document.getElementById('quantity');
    input.value = parseInt(input.value) + 1;
}

function decreaseQuantity() {
    const input = document.getElementById('quantity');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Add to cart
async function addToCart(productId) {
    try {
        console.log('Adding to cart, product ID:', productId);
        
        // Track add to cart action
        await trackAddToCart(productId);
        
        // Adding current product
        if (!currentProduct) {
            console.log('Current product not loaded yet');
            showNotification('Product not loaded yet');
            return;
        }
        
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        console.log('Adding quantity:', quantity);
        
        const product = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image,
            quantity: quantity
        };
        
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
            console.log('Updated existing item, new quantity:', existingItem.quantity);
        } else {
            cart.push(product);
            console.log('Added new item to cart');
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Product added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add product to cart');
    }
}

// Update cart count
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
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

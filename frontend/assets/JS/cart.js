// Shopping Cart JavaScript

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
    loadComponent('navbar', 'components/navbar.html');
    loadComponent('footer', 'components/footer.html');
    
    loadCartItems();
    updateCartSummary();
});

// Load cart items
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCart');
    const orderSummary = document.getElementById('orderSummary');
    
    if (cart.length === 0) {
        cartItemsContainer.classList.add('hidden');
        emptyCartMessage.classList.remove('hidden');
        if (orderSummary) orderSummary.classList.add('hidden');
        return;
    }
    
    cartItemsContainer.classList.remove('hidden');
    emptyCartMessage.classList.add('hidden');
    if (orderSummary) orderSummary.classList.remove('hidden');
    
    cartItemsContainer.innerHTML = cart.map((item, index) => createCartItemHTML(item, index)).join('');
}

// Create cart item HTML
function createCartItemHTML(item, index) {
    return `
        <div class="bg-white rounded-lg shadow-md p-4">
            <div class="flex gap-4">
                <img src="${item.image}" alt="${item.name}" class="w-24 h-24 object-cover rounded-lg">
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800">${item.name}</h3>
                            <p class="text-sm text-gray-600">In Stock</p>
                        </div>
                        <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="flex justify-between items-center mt-4">
                        <div class="flex items-center gap-3">
                            <button onclick="updateQuantity(${index}, -1)" class="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold">-</button>
                            <span class="w-12 text-center font-semibold">${item.quantity}</span>
                            <button onclick="updateQuantity(${index}, 1)" class="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold">+</button>
                        </div>
                        <div class="text-right">
                            <p class="text-xl font-bold text-indigo-600">$${(item.price * item.quantity).toFixed(2)}</p>
                            <p class="text-sm text-gray-600">$${item.price.toFixed(2)} each</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Update quantity
function updateQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
        updateCartSummary();
        updateCartCount();
    }
}

// Remove from cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
    updateCartSummary();
    updateCartCount();
    showNotification('Item removed from cart');
}

// Update cart summary
function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const itemCountElement = document.getElementById('itemCount');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (itemCountElement) itemCountElement.textContent = itemCount;
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
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

// Apply promo code
function applyPromo() {
    const promoCode = document.getElementById('promoCode').value.toUpperCase();
    
    const validCodes = {
        'SAVE10': 0.10,
        'SAVE20': 0.20,
        'WELCOME': 0.15
    };
    
    if (validCodes[promoCode]) {
        showNotification(`Promo code applied! ${validCodes[promoCode] * 100}% discount`);
        // Apply discount logic here
    } else {
        showNotification('Invalid promo code', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

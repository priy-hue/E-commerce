// Login & Register Page JavaScript

// Backend API URL - ONLY from config.js
const BACKEND_URL = window.CONFIG.BACKEND_URL;

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

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar', 'components/navbar.html');
    loadComponent('footer', 'components/footer.html');
    
    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
});

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validate input
    if (!username || !password) {
        showNotification('Please enter username and password', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
    submitButton.disabled = true;
    
    try {
        // Send POST request to API
        const response = await fetch(`${BACKEND_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        // Check if response is successful (status 200)
        if (response.ok) {
            const data = await response.json();
            
            // Check if login was successful
            if (data.message && data.message.toLowerCase().includes('login successful')) {
                // Create user session
                const user = {
                    username: username,
                    name: data.name || username,
                    loggedIn: true,
                    loginTime: new Date().toISOString()
                };
                
                // Save to localStorage
                localStorage.setItem('loggedInUser', username);
                localStorage.setItem('user', JSON.stringify(user));

                // If backend returned a numeric user id, store it for recommendations
                const backendUserId = data.user_id || data.id || data.userId || null;
                if (backendUserId) {
                    // attempt to coerce to integer
                    const uid = parseInt(backendUserId);
                    if (!isNaN(uid)) localStorage.setItem('user_id', uid.toString());
                } else {
                    // fallback to fixed id 11 to ensure recommendations work
                    if (!localStorage.getItem('user_id')) localStorage.setItem('user_id', '11');
                }

                // Immediately call recommend endpoint once on first successful login
                (async function primeRecommendations() {
                    try {
                        const userId = parseInt(localStorage.getItem('user_id')) || 11;
                        console.log('Priming recommendations for user after login:', userId);
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000);
                        const res = await fetch(`${BACKEND_URL}/recommend/${userId}?limit=8`, { signal: controller.signal });
                        clearTimeout(timeoutId);
                        if (res.ok) {
                            const body = await res.json();
                            // Cache briefly so immediate redirect to homepage can read recommendations if needed
                            try {
                                sessionStorage.setItem(`recommended_products_${userId}`, JSON.stringify(body.recommendations || []));
                                sessionStorage.setItem(`recommended_products_${userId}_time`, Date.now().toString());
                            } catch (e) {
                                /* ignore storage errors */
                            }
                            console.log('Primed recommendations:', body.recommendation_count);
                        } else {
                            console.warn('Priming recommendations failed with status:', res.status);
                        }
                    } catch (err) {
                        if (err.name === 'AbortError') console.warn('Priming recommendations timed out');
                        else console.warn('Priming recommendations error:', err.message || err);
                    }
                })();
                
                // Show success message
                showNotification('Login successful! Welcome back!', 'success');
                
                // Redirect to home page
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            }
        } else if (response.status === 401) {
            // Handle 401 Unauthorized - Invalid credentials
            const errorData = await response.json();
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            showNotification(errorData.detail || 'Invalid username or password', 'error');
        } else {
            // Handle other errors
            const errorData = await response.json();
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            showNotification(errorData.detail || 'Login failed. Please try again.', 'error');
        }
    } catch (error) {
        // Network or other error
        console.error('Login error:', error);
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        showNotification('Connection failed. Please check your network and try again.', 'error');
    }
}

// Handle Register
function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    // Validate password length
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }
    
    // Create user account
    const user = {
        name: fullName,
        email: email,
        loggedIn: true,
        registrationTime: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Show success message
    showNotification('Account created successfully! Welcome to ShopHub!', 'success');
    
    // Redirect after short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Social Login
function socialLogin(provider) {
    showNotification(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`, 'info');
    
    // Simulate social login
    setTimeout(() => {
        const user = {
            email: `user@${provider}.com`,
            name: `${provider} User`,
            loggedIn: true,
            provider: provider,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = 'index.html';
    }, 2000);
}

// Social Register
function socialRegister(provider) {
    socialLogin(provider);
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) cartCountElement.textContent = totalItems;
}

// Show notification
function showNotification(message, type = 'success') {
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Logout function (to be used in navbar)
function handleLogout() {
    localStorage.removeItem('user');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

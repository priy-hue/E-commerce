# E-Commerce Platform Frontend

A modern, responsive e-commerce website built with HTML, CSS (Tailwind), and vanilla JavaScript.

## 🚀 Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Product Catalog**: Browse products with filtering and search functionality
- **Product Details**: Detailed product pages with image gallery and specifications
- **Shopping Cart**: Add/remove items, update quantities, and view order summary
- **Checkout Process**: Complete checkout form with shipping and payment information
- **Local Storage**: Cart persists across page reloads
- **Modern UI**: Clean, professional design using Tailwind CSS

## 📁 Project Structure

```
frontend/
├── index.html              # Home page with featured products
├── product.html            # Product details page
├── cart.html              # Shopping cart page
├── checkout.html          # Checkout page
├── components/
│   ├── navbar.html        # Reusable navigation bar
│   ├── footer.html        # Reusable footer
│   └── product_card.html  # Product card template
├── assets/
│   ├── css/
│   │   ├── input.css      # Custom CSS styles
│   │   └── output.css     # Additional compiled styles
│   ├── images/            # Product images (placeholder)
│   └── JS/
│       ├── MAIN.JS        # Main JavaScript for homepage
│       ├── product.js     # Product details functionality
│       └── cart.js        # Shopping cart functionality
└── README.md              # This file
```

## 🎨 Pages Overview

### 1. Home Page (`index.html`)
- Hero section with call-to-action
- Category browsing
- Featured products grid
- Product filtering (All, Fashion, Electronics, Home)
- Customer testimonials
- Search functionality

### 2. Product Details (`product.html`)
- Product image gallery
- Product information and pricing
- Quantity selector
- Color/variant options
- Add to cart functionality
- Related products
- Product features and shipping info

### 3. Shopping Cart (`cart.html`)
- List of cart items
- Quantity adjustment
- Remove items
- Order summary with subtotal, tax, and total
- Promo code input
- Proceed to checkout button

### 4. Checkout (`checkout.html`)
- Progress indicator
- Shipping information form
- Payment method selection
- Order review and summary
- Place order functionality

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **JavaScript (ES6+)**: Modern vanilla JavaScript
- **LocalStorage API**: Client-side data persistence
- **Unsplash API**: High-quality product images

## 🚦 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional but recommended)

### Installation

1. **Clone or download the project**
   ```bash
   cd d:\OneDrive\Desktop\e-comm\frontend
   ```

2. **Open with a local server** (recommended)
   
   **Option A: Using Python**
   ```bash
   # Python 3
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser

   **Option B: Using Node.js (http-server)**
   ```bash
   npx http-server -p 8000
   ```

   **Option C: Using VS Code Live Server**
   - Install "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

3. **Or simply open the files**
   - Double-click `index.html` to open in your default browser
   - Note: Some features may not work properly without a server

## 💡 Usage Guide

### Adding Products to Cart
1. Browse products on the home page
2. Click "Add to Cart" button on any product card
3. Or click "View" to see product details first
4. Cart count in navbar updates automatically

### Managing Cart
1. Click the cart icon in navigation
2. Adjust quantities using +/- buttons
3. Remove items with the trash icon
4. Apply promo codes (try: SAVE10, SAVE20, WELCOME)
5. Click "Proceed to Checkout"

### Completing Purchase
1. Fill in shipping information
2. Select payment method
3. Review order summary
4. Click "Place Order"

## 🎯 Key Features Explained

### Product Filtering
- Click category buttons to filter products
- All products show by default
- Smooth transitions between filters

### Search Functionality
- Type in the search bar to find products
- Searches product names and descriptions
- Real-time filtering as you type

### Cart Persistence
- Cart data saved in browser's LocalStorage
- Cart persists across page reloads
- Survives browser restarts

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly on mobile devices

## 🔧 Customization

### Adding New Products
Edit `assets/JS/MAIN.JS` and add to the `products` array:

```javascript
{
    id: 13,
    name: "Your Product Name",
    category: "electronics", // or "fashion", "home"
    price: 99.99,
    originalPrice: 129.99,
    image: "image-url-here",
    rating: 4.5,
    reviews: 100,
    description: "Product description"
}
```

### Changing Colors
The project uses Tailwind CSS. Main colors:
- Primary: `indigo-600` (#4F46E5)
- Success: `green-500`
- Error: `red-500`
- Gray shades for text and backgrounds

### Modifying Styles
- Custom styles in `assets/css/input.css`
- Additional utilities in `assets/css/output.css`
- Tailwind classes directly in HTML

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### Components not loading
- Make sure you're using a local server
- Check browser console for CORS errors
- Verify file paths are correct

### Cart not persisting
- Check if LocalStorage is enabled
- Try clearing browser cache
- Ensure JavaScript is enabled

### Images not showing
- Check internet connection (using Unsplash CDN)
- Verify image URLs are accessible
- Consider adding fallback images

## 🚀 Future Enhancements

Potential features to add:
- [ ] User authentication and login
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Order history
- [ ] Real-time inventory
- [ ] Multiple payment gateways
- [ ] Product comparison
- [ ] Advanced filtering (price range, ratings)
- [ ] Backend API integration
- [ ] Email notifications
- [ ] Social sharing

## 📄 License

This project is free to use for educational purposes.

## 👥 Contributing

Feel free to fork, modify, and use this project as a template for your own e-commerce website!

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Inspect browser console for errors

---

**Happy Shopping! 🛒**

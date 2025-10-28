# Configuration Guide

## Quick Start

### To change your backend URL:

1. Open `frontend/assets/JS/config.js`
2. Update line 4:
```javascript
BACKEND_URL: 'https://your-new-api-url.com'
```
3. Save and refresh your browser

**That's it!** All your pages will automatically use the new URL.

---

## File Structure

```
frontend/
├── assets/
│   └── JS/
│       └── config.js          # Edit this file to change backend URL
└── .env.example               # Documentation only
```

---

## Examples

### Local Development
```javascript
BACKEND_URL: 'http://localhost:8000'
```

### Production
```javascript
BACKEND_URL: 'https://api.yourapp.com'
```

### Auto-detect Environment
```javascript
BACKEND_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://api.yourapp.com'
```

---

## Verification

Test if it's working:
1. Open your site
2. Press F12 → Console tab
3. Type: `CONFIG.BACKEND_URL`
4. Should show your API URL

---

## For Netlify Deployment

Just update the URL in `config.js` before deploying. Done! 🚀

# Progressive Web App (PWA) Installation Guide

This document explains how to transform a web application into an installable WebApp (PWA) with a custom "Install" button that works across supported devices.

## 1. Core Requirements

To be recognized as a PWA, your app must have:
1. **A Web App Manifest**: A JSON file describing the app.
2. **A Service Worker**: A background script for caching and offline support.
3. **HTTPS**: Mandatory for PWA features (except localhost).
4. **Icons**: High-resolution icons for the home screen.

---

## 2. Implementation Steps

### A. Create the Web App Manifest
Create a `public/manifest.json` file. This tells the browser how your app should behave when installed.

```json
{
  "name": "OptimaSkill Online Exam Platform",
  "short_name": "OptimaSkill",
  "description": "A modern online examination platform for students and administrators.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logo.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### B. Add a Service Worker
Create a `public/sw.js` file. Even a minimal service worker is required for installation.

```javascript
// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
```

### C. Register the Service Worker & Manifest
In your root layout (`src/app/layout.tsx`), link the manifest and register the service worker.

```tsx
// src/app/layout.tsx
<head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#2563eb" />
  {/* iOS Specific Tags */}
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
</head>

// Registration Script (using Next.js Script component)
<Script id="register-sw">
  {`
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  `}
</Script>
```

---

## 3. Implementing the Custom Install Button

Browsers like Chrome (Android/Desktop) and Edge provide a `beforeinstallprompt` event. We capture this to show our own button.

### Logic (React Example)

```tsx
// src/app/page.tsx
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
const [showInstallBtn, setShowInstallBtn] = useState(false);

useEffect(() => {
  const handleBeforeInstallPrompt = (e: any) => {
    // Prevent the default browser mini-infobar
    e.preventDefault();
    // Save the event so it can be triggered later
    setDeferredPrompt(e);
    // Show your custom button
    setShowInstallBtn(true);
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
}, []);

const handleInstallClick = async () => {
  if (!deferredPrompt) return;
  // Show the native install prompt
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  }
};
```

---

## 4. Device-Specific Behavior

### Android & Desktop (Chrome/Edge/Brave)
- **Support**: High.
- **Experience**: The `beforeinstallprompt` event fires automatically. Your custom button will appear, and clicking it triggers the browser's install dialog.

### iOS (Safari/iPhone/iPad)
- **Support**: Limited (No API).
- **Experience**: iOS **does not** support the `beforeinstallprompt` event or custom install buttons.
- **How to Install**:
  1. Open Safari.
  2. Tap the **Share** button (square with arrow).
  3. Scroll down and tap **"Add to Home Screen"**.
- **Tip**: You can detect iOS in your code and show a small tooltip explaining these steps to the user.

---

## 5. Verification & Testing

1. **Lighthouse**: Open Chrome DevTools -> Lighthouse -> Check "PWA" -> Generate Report. It will tell you if any requirements are missing.
2. **Application Tab**: In Chrome DevTools, go to "Application" -> "Manifest" to see if your manifest is loaded correctly.
3. **Local Testing**: PWAs work on `localhost`. For mobile testing, use a service like Ngrok to provide an HTTPS tunnel.

## 6. Optimization Checklist

- [ ] **Icons**: Ensure you have both `192x192` and `512x512` PNG icons.
- [ ] **Splash Screen**: The browser automatically generates this from the `background_color` and `icons` in the manifest.
- [ ] **Offline Page**: Enhance `sw.js` to serve a custom offline page when there is no internet.

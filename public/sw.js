// Pinebi Report Service Worker
const CACHE_NAME = 'pinebi-report-v1.0.0'
const STATIC_CACHE = 'pinebi-static-v1.0.0'
const DYNAMIC_CACHE = 'pinebi-dynamic-v1.0.0'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/_next/static/css/',
  '/_next/static/js/'
]

// API routes to cache
const API_ROUTES = [
  '/api/dashboard',
  '/api/reports',
  '/api/user-theme'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  event.respondWith(
    handleRequest(request)
  )
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request)
    }
    
    // Strategy 2: Network First for API routes
    if (isApiRoute(url.pathname)) {
      return await networkFirst(request)
    }
    
    // Strategy 3: Stale While Revalidate for pages
    return await staleWhileRevalidate(request)
    
  } catch (error) {
    console.error('❌ Fetch error:', error)
    
    // Fallback to offline page for navigation requests
    if (request.mode === 'navigate') {
      return await getOfflinePage()
    }
    
    // Return cached response or error
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// Cache First Strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE)
    cache.put(request, networkResponse.clone())
  }
  
  return networkResponse
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  })
  
  return cachedResponse || fetchPromise
}

// Helper functions
function isStaticAsset(pathname) {
  return pathname.includes('/_next/static/') ||
         pathname.includes('/icons/') ||
         pathname.includes('/manifest.json') ||
         pathname === '/'
}

function isApiRoute(pathname) {
  return pathname.startsWith('/api/')
}

async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE)
  const offlineResponse = await cache.match('/offline.html')
  
  if (offlineResponse) {
    return offlineResponse
  }
  
  // Create a simple offline page
  const offlinePage = new Response(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Çevrimdışı - Pinebi Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        .container {
          max-width: 400px;
          padding: 2rem;
        }
        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          background: #A7F300;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          color: #00568C;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        .retry-btn {
          background: #A7F300;
          color: #00568C;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .retry-btn:hover {
          transform: scale(1.05);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">P</div>
        <h1>Çevrimdışısınız</h1>
        <p>İnternet bağlantınızı kontrol edin ve tekrar deneyin.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Tekrar Dene
        </button>
      </div>
    </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
  
  return offlinePage
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'dashboard-sync') {
    event.waitUntil(syncDashboardData())
  }
})

async function syncDashboardData() {
  try {
    console.log('📊 Syncing dashboard data...')
    // Implement dashboard data sync logic here
    const response = await fetch('/api/dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sync: true,
        timestamp: Date.now()
      })
    })
    
    if (response.ok) {
      console.log('✅ Dashboard data synced successfully')
    }
  } catch (error) {
    console.error('❌ Failed to sync dashboard data:', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'Yeni bildirim',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Görüntüle',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icons/icon-192x192.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Pinebi Report', options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

console.log('🎉 Pinebi Report Service Worker loaded!')














const CACHE_NAME = "face-attendance-v1"
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/static/js/main.js",
  "/static/css/main.css",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(STATIC_ASSETS)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
          return null
        }),
      )
    }),
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Handle API requests differently
  if (event.request.url.includes("/api/")) {
    // For API requests, try network first, then cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to store in cache
          const responseToCache = response.clone()

          // Only cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }

          return response
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
        }),
    )
  } else {
    // For non-API requests, try cache first, then network
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Cache hit - return response
        if (response) {
          return response
        }

        // Clone the request
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Add response to cache
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
      }),
    )
  }
})

// Background sync for offline attendance
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-attendance") {
    event.waitUntil(syncAttendance())
  }
})

// Function to sync offline attendance data
async function syncAttendance() {
  try {
    // Get offline attendance data from IndexedDB
    const db = await openDatabase()
    const offlineAttendance = await getOfflineAttendance(db)

    // If there's offline data, sync it
    if (offlineAttendance.length > 0) {
      for (const attendance of offlineAttendance) {
        try {
          // Try to send the attendance data to the server
          const response = await fetch("/api/attendance/mark", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${attendance.token}`,
            },
            body: JSON.stringify(attendance.data),
          })

          if (response.ok) {
            // If successful, remove from offline storage
            await removeOfflineAttendance(db, attendance.id)
          }
        } catch (error) {
          console.error("Error syncing attendance:", error)
        }
      }
    }
  } catch (error) {
    console.error("Error in syncAttendance:", error)
  }
}

// IndexedDB functions
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("AttendanceDB", 1)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains("offlineAttendance")) {
        db.createObjectStore("offlineAttendance", { keyPath: "id", autoIncrement: true })
      }
    }

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}

function getOfflineAttendance(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offlineAttendance"], "readonly")
    const store = transaction.objectStore("offlineAttendance")
    const request = store.getAll()

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}

function removeOfflineAttendance(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offlineAttendance"], "readwrite")
    const store = transaction.objectStore("offlineAttendance")
    const request = store.delete(id)

    request.onsuccess = (event) => {
      resolve()
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}

// Push notification event
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: "/logo192.png",
      badge: "/logo192.png",
      data: {
        url: data.url,
      },
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})

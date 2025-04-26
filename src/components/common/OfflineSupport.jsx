"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi } from "lucide-react"

const OfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineData, setOfflineData] = useState([])
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check online status
    const handleOnline = () => {
      setIsOnline(true)
      syncOfflineData()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check for offline data on mount
    checkOfflineData()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const checkOfflineData = async () => {
    try {
      const db = await openDatabase()
      const data = await getOfflineAttendance(db)
      setOfflineData(data)

      // Show banner if there's offline data
      if (data.length > 0) {
        setShowBanner(true)
      }
    } catch (error) {
      console.error("Error checking offline data:", error)
    }
  }

  const syncOfflineData = async () => {
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        await navigator.serviceWorker.ready
        await navigator.serviceWorker.sync.register("sync-attendance")

        // Refresh offline data
        checkOfflineData()
      }
    } catch (error) {
      console.error("Error syncing offline data:", error)
    }
  }

  const closeBanner = () => {
    setShowBanner(false)
  }

  // IndexedDB functions
  const openDatabase = () => {
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

  const getOfflineAttendance = (db) => {
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

  if (!showBanner) {
    return null
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 p-4 z-50 ${isOnline ? "bg-success-600" : "bg-warning-600"} text-white`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {isOnline ? (
            <>
              <Wifi className="h-5 w-5 mr-2" />
              <span>
                You're back online! {offlineData.length > 0 ? `Syncing ${offlineData.length} offline records...` : ""}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 mr-2" />
              <span>
                You're offline. Don't worry, your attendance data will be saved locally and synced when you're back
                online.
              </span>
            </>
          )}
        </div>
        <button onClick={closeBanner} className="ml-4 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default OfflineSupport

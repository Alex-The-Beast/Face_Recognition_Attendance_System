// Function to open IndexedDB database
export const openDatabase = () => {
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
  
  // Function to save attendance data offline
  export const saveOfflineAttendance = async (attendanceData) => {
    try {
      const db = await openDatabase()
      const transaction = db.transaction(["offlineAttendance"], "readwrite")
      const store = transaction.objectStore("offlineAttendance")
  
      // Add token for authentication when syncing
      const token = localStorage.getItem("accessToken")
  
      const request = store.add({
        data: attendanceData,
        token,
        timestamp: new Date().toISOString(),
      })
  
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(true)
        request.onerror = (event) => reject(event.target.error)
      })
    } catch (error) {
      console.error("Error saving offline attendance:", error)
      throw error
    }
  }
  
  // Function to get offline attendance data
  export const getOfflineAttendance = async () => {
    try {
      const db = await openDatabase()
      const transaction = db.transaction(["offlineAttendance"], "readonly")
      const store = transaction.objectStore("offlineAttendance")
      const request = store.getAll()
  
      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => resolve(event.target.result)
        request.onerror = (event) => reject(event.target.error)
      })
    } catch (error) {
      console.error("Error getting offline attendance:", error)
      throw error
    }
  }
  
  // Function to remove offline attendance data
  export const removeOfflineAttendance = async (id) => {
    try {
      const db = await openDatabase()
      const transaction = db.transaction(["offlineAttendance"], "readwrite")
      const store = transaction.objectStore("offlineAttendance")
      const request = store.delete(id)
  
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(true)
        request.onerror = (event) => reject(event.target.error)
      })
    } catch (error) {
      console.error("Error removing offline attendance:", error)
      throw error
    }
  }
  
  // Function to sync offline attendance data
  export const syncOfflineAttendance = async () => {
    try {
      // Request sync from service worker
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        await navigator.serviceWorker.ready
        await navigator.serviceWorker.sync.register("sync-attendance")
        return true
      }
  
      // If service worker sync is not available, do manual sync
      const offlineData = await getOfflineAttendance()
  
      if (offlineData.length === 0) {
        return true
      }
  
      for (const item of offlineData) {
        try {
          const response = await fetch("/api/attendance/mark", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${item.token}`,
            },
            body: JSON.stringify(item.data),
          })
  
          if (response.ok) {
            await removeOfflineAttendance(item.id)
          }
        } catch (error) {
          console.error("Error syncing attendance item:", error)
        }
      }
  
      return true
    } catch (error) {
      console.error("Error syncing offline attendance:", error)
      throw error
    }
  }
  
  // Function to check if there is offline data
  export const hasOfflineData = async () => {
    try {
      const data = await getOfflineAttendance()
      return data.length > 0
    } catch (error) {
      console.error("Error checking offline data:", error)
      return false
    }
  }
  
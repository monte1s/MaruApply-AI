/**
 * Chrome Storage Adapter for Supabase
 * This adapter allows Supabase to use Chrome's storage API instead of localStorage,
 * which is more reliable in Chrome extensions.
 * 
 * Uses an in-memory cache for synchronous access (as Supabase requires),
 * while persisting to Chrome storage asynchronously in the background.
 */

// In-memory cache for synchronous access
const memoryCache: { [key: string]: string } = {}

// Flag to track if we've loaded from Chrome storage
let isInitialized = false

// Initialize: Load all data from Chrome storage into memory cache
const initializeStorage = async () => {
  if (isInitialized) return
  
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    try {
      const allData = await new Promise<{ [key: string]: any }>((resolve) => {
        chrome.storage.local.get(null, (result) => {
          resolve(result || {})
        })
      })
      
      // Populate memory cache
      Object.keys(allData).forEach((key) => {
        if (typeof allData[key] === "string") {
          memoryCache[key] = allData[key]
        }
      })
      
      isInitialized = true
    } catch (err) {
      console.error("Error initializing Chrome storage:", err)
      isInitialized = true // Set to true to prevent infinite retries
    }
  } else {
    // Fallback: try to load from localStorage
    try {
      Object.keys(localStorage).forEach((key) => {
        memoryCache[key] = localStorage.getItem(key) || ""
      })
      isInitialized = true
    } catch {
      isInitialized = true
    }
  }
}

// Initialize immediately (non-blocking)
initializeStorage()

// Helper to ensure a specific key is loaded (for immediate access)
const ensureKeyLoaded = (key: string): void => {
  if (isInitialized || memoryCache.hasOwnProperty(key)) return
  
  // Try synchronous read from localStorage as fallback
  try {
    const value = localStorage.getItem(key)
    if (value !== null) {
      memoryCache[key] = value
    }
  } catch {
    // Ignore errors
  }
}

export const chromeStorageAdapter = {
  getItem: (key: string): string | null => {
    // Ensure key is loaded if not initialized yet (fallback to localStorage)
    if (!isInitialized) {
      ensureKeyLoaded(key)
    }
    // Return from memory cache immediately (synchronous)
    return memoryCache[key] || null
  },

  setItem: (key: string, value: string): void => {
    // Update memory cache immediately (synchronous)
    memoryCache[key] = value
    
    // Persist to Chrome storage asynchronously
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [key]: value }, () => {
        // Ignore errors silently
      })
    } else {
      // Fallback to localStorage
      try {
        localStorage.setItem(key, value)
      } catch {
        // Ignore errors silently
      }
    }
  },

  removeItem: (key: string): void => {
    // Remove from memory cache immediately (synchronous)
    delete memoryCache[key]
    
    // Remove from Chrome storage asynchronously
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove([key], () => {
        // Ignore errors silently
      })
    } else {
      // Fallback to localStorage
      try {
        localStorage.removeItem(key)
      } catch {
        // Ignore errors silently
      }
    }
  },
}


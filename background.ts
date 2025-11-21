// Set sidepanel options immediately when background script loads
// This ensures options are always available before user clicks
chrome.sidePanel.setOptions({
  enabled: true,
  path: "sidepanel.html"
})

// Set sidepanel options globally - this must be done before opening
// Set on startup to ensure options are always available
chrome.runtime.onStartup.addListener(() => {
  chrome.sidePanel.setOptions({
    enabled: true,
    path: "sidepanel.html"
  })
})

// Set sidepanel as default when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Set global sidepanel options
  chrome.sidePanel.setOptions({
    enabled: true,
    path: "sidepanel.html"
  })
})

// Open sidepanel when extension icon is clicked (default behavior)
chrome.action.onClicked.addListener((tab) => {
  // Call open() directly without any promise chaining to preserve user gesture context
  // Options are already set globally on startup/install
  // Using tabId is preferred for sidepanel API
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id })
  } else if (tab.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId })
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleSidePanel") {
    chrome.sidePanel
      .setOptions({
        enabled: true,
        path: "sidepanel.html"
      })
      .then(() => chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT }))
      .then(() => sendResponse({ success: true, action: "opened" }))
      .catch((error) => {
        console.error("Error opening side panel:", error)
        sendResponse({ success: false, error: error.message })
      })

    return true
  }

  if (message.action === "closeSidePanel") {
    chrome.sidePanel
      .setOptions({
        enabled: false
      })
      .then(() => sendResponse({ success: true, action: "closed" }))
      .catch((error) => {
        console.error("Error closing side panel:", error)
        sendResponse({ success: false, error: error.message })
      })

    return true
  }
})

// Background service worker for Chrome extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('MaruApply AI extension installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log') {
    console.log('Message from content script:', request.data);
  }
  return true;
});


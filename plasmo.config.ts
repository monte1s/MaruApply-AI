// Plasmo config - side panel will be configured dynamically
// The side_panel config is added to package.json manifest
// Plasmo will generate panel.html from panel.tsx during build
export default {
  manifest: {
    action: {
      // Omit default_popup to allow chrome.action.onClicked to work
      // This makes sidepanel the default when extension icon is clicked
    }
  }
}


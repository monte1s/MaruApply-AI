# MaruApply AI Chrome Extension

A simple Chrome extension built with React.

## Features

- Modern React-based popup interface
- Content script integration
- Background service worker
- Beautiful gradient UI

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. For development with watch mode:
```bash
npm run dev
```

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The extension icon should appear in your Chrome toolbar

## Project Structure

```
├── src/
│   ├── popup/          # React popup component
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── popup.html
│   │   └── styles.css
│   ├── background/     # Background service worker
│   │   └── background.js
│   └── content/        # Content script
│       └── content.js
├── manifest.json       # Chrome extension manifest
├── webpack.config.js   # Webpack configuration
└── package.json
```

## Building

The extension files are built into the `dist` directory. After building, load the `dist` folder as an unpacked extension in Chrome.

## Notes

- The extension requires the `activeTab` permission to interact with web pages
- Icons are referenced in the manifest but need to be added to the `icons` folder
- Make sure to rebuild after making changes to the source files


import React, { useState, useEffect } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setCurrentUrl(tabs[0].url || '');
      }
    });
  }, []);

  const handleButtonClick = () => {
    setCount(count + 1);
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'buttonClicked',
        count: count + 1
      });
    });
  };

  return (
    <div className="app">
      <div className="header">
        <h1>MaruApply AI</h1>
        <p className="subtitle">Chrome Extension</p>
      </div>
      
      <div className="content">
        <div className="card">
          <h2>Welcome!</h2>
          <p>This is a simple Chrome extension built with React.</p>
          
          <div className="counter-section">
            <p className="counter-label">Button clicked:</p>
            <p className="counter-value">{count} times</p>
            <button className="primary-button" onClick={handleButtonClick}>
              Click Me
            </button>
          </div>

          {currentUrl && (
            <div className="url-section">
              <p className="url-label">Current page:</p>
              <p className="url-value" title={currentUrl}>
                {currentUrl.length > 50 ? `${currentUrl.substring(0, 50)}...` : currentUrl}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;


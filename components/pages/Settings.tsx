import { useState } from "react"

const Settings = () => {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [autoSave, setAutoSave] = useState(true)

  return (
    <div className="page-container">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Customize your experience</p>

      <div className="card">
        <div className="setting-item">
          <div>
            <div className="setting-label">Notifications</div>
            <div className="setting-description">
              Receive alerts and updates
            </div>
          </div>
          <div
            className={`toggle-switch ${notifications ? "active" : ""}`}
            onClick={() => setNotifications(!notifications)}
          />
        </div>

        <div className="setting-item">
          <div>
            <div className="setting-label">Dark Mode</div>
            <div className="setting-description">Switch to dark theme</div>
          </div>
          <div
            className={`toggle-switch ${darkMode ? "active" : ""}`}
            onClick={() => setDarkMode(!darkMode)}
          />
        </div>

        <div className="setting-item">
          <div>
            <div className="setting-label">Auto Save</div>
            <div className="setting-description">Automatically save your work</div>
          </div>
          <div
            className={`toggle-switch ${autoSave ? "active" : ""}`}
            onClick={() => setAutoSave(!autoSave)}
          />
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Preferences</h2>
        <div className="card-content">
          <p style={{ marginBottom: "12px" }}>Language: English</p>
          <p style={{ marginBottom: "12px" }}>Region: United States</p>
          <p>Timezone: UTC-8</p>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">About</h2>
        <div className="card-content">
          <p style={{ marginBottom: "8px" }}>Version: 0.0.1</p>
          <p style={{ marginBottom: "8px" }}>Built with Plasmo Framework</p>
          <p>© 2024 Maru apply ai</p>
        </div>
      </div>
    </div>
  )
}

export default Settings


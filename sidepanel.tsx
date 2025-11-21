import { useState } from "react"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import Home from "./components/pages/Home"
import Profile from "./components/pages/Profile"
import Settings from "./components/pages/Settings"
import Account from "./components/pages/Account"
import Login from "./components/auth/Login"
import "./style.css"

type TabType = "home" | "profile" | "settings" | "account"

function IndexPanelContent() {
  const [activeTab, setActiveTab] = useState<TabType>("home")
  const { user, loading } = useAuth()

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />
      case "profile":
        return <Profile />
      case "settings":
        return <Settings />
      case "account":
        return <Account />
      default:
        return <Home />
    }
  }

  if (loading) {
    return (
      <div className="extension-container">
        <div className="content-area" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="extension-container">
        <div className="content-area auth-page">
          <Login />
        </div>
      </div>
    )
  }

  return (
    <div className="extension-container">
      <div className="content-area">
        {renderContent()}
      </div>

      <footer className="modern-footer">
        <button
          className={`footer-tab ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
          aria-label="Home"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </button>

        <button
          className={`footer-tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
          aria-label="Profile"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </button>

        <button
          className={`footer-tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
          aria-label="Settings"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
          <span>Settings</span>
        </button>

        <button
          className={`footer-tab ${activeTab === "account" ? "active" : ""}`}
          onClick={() => setActiveTab("account")}
          aria-label="Account"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Account</span>
        </button>
      </footer>
    </div>
  )
}

function IndexPanel() {
  return (
    <AuthProvider>
      <IndexPanelContent />
    </AuthProvider>
  )
}

export default IndexPanel


const Account = () => {
  return (
    <div className="page-container">
      <div className="account-header">
        <div className="avatar">MA</div>
        <h1 className="account-name">MaruApply User</h1>
        <p className="account-email">user@maruapply.ai</p>
      </div>

      <div className="card">
        <ul className="account-menu">
          <li className="menu-item">
            <svg
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
            <span>Edit Profile</span>
          </li>

          <li className="menu-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Security & Privacy</span>
          </li>

          <li className="menu-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Subscription</span>
          </li>

          <li className="menu-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Support</span>
          </li>

          <li className="menu-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </li>
        </ul>
      </div>

      <div className="card">
        <h2 className="card-title">Account Details</h2>
        <div className="card-content">
          <p style={{ marginBottom: "12px" }}>
            <strong>Member since:</strong> January 2024
          </p>
          <p style={{ marginBottom: "12px" }}>
            <strong>Plan:</strong> Premium
          </p>
          <p>
            <strong>Status:</strong> Active
          </p>
        </div>
      </div>
    </div>
  )
}

export default Account


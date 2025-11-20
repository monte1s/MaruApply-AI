const Home = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Welcome Home</h1>
      <p className="page-subtitle">Your AI-powered assistant is ready</p>

      <div className="card">
        <h2 className="card-title">Quick Actions</h2>
        <div className="card-content">
          <p>
            Get started with your AI assistant. Explore settings to customize
            your experience.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Recent Activity</h2>
        <div className="card-content">
          <p>
            No recent activity. Start using the extension to see your history
            here.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Tips & Tricks</h2>
        <div className="card-content">
          <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
            <li style={{ marginBottom: "8px" }}>
              Customize your settings for better results
            </li>
            <li style={{ marginBottom: "8px" }}>
              Check your account for subscription details
            </li>
            <li>Use keyboard shortcuts for faster access</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home


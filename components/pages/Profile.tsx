import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { analyzeResume } from "../../lib/openai"
import type { ProfileData, Experience, Education } from "../../types/profile"
import { supabase } from "../../lib/supabase"

const Profile = () => {
  const { user } = useAuth()
  const [inputMode, setInputMode] = useState<"upload" | "manual">("upload")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    birthday: "",
    linkedinLink: "",
    summary: "",
    skills: [],
    experience: [],
    education: [],
  })

  const [resumeText, setResumeText] = useState("")
  const [newSkill, setNewSkill] = useState("")

  // Load profile data on mount
  useEffect(() => {
    loadProfileData()
  }, [user])

  const loadProfileData = async () => {
    if (!user) return

    try {
      // Try to load from Supabase first, fallback to Chrome storage
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (!error && data) {
        setProfileData(data.profile_data as ProfileData)
      } else {
        // Fallback to Chrome storage
        const stored = await chrome.storage.local.get(`profile_${user.id}`)
        if (stored[`profile_${user.id}`]) {
          setProfileData(stored[`profile_${user.id}`])
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err)
    }
  }

  const saveProfileData = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSaveMessage(null)

    try {
      // Try to save to Supabase first
      const { error: supabaseError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          profile_data: profileData,
          updated_at: new Date().toISOString(),
        })

      if (supabaseError) {
        // Fallback to Chrome storage
        await chrome.storage.local.set({
          [`profile_${user.id}`]: profileData,
        })
      }

      setSaveMessage("Profile saved successfully!")
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      setError("Failed to save profile. Please try again.")
      console.error("Error saving profile:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const { extractTextFromPDF } = await import("../../lib/openai")
      const extractedText = await extractTextFromPDF(file)
      
      if (extractedText.trim()) {
        setResumeText(extractedText)
        setSaveMessage("PDF text extracted! Click 'Analyze Resume' to parse the information.")
        setTimeout(() => setSaveMessage(null), 5000)
      } else {
        setError("Could not extract text from PDF. Please try manual input.")
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to extract text from PDF. Please try manual input or ensure your PDF contains selectable text."
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) {
      setError("Please enter or paste your resume text")
      return
    }

    const apiKey = process.env.PLASMO_PUBLIC_OPENAI_API_KEY || ""
    if (!apiKey) {
      setError("OpenAI API key not configured. Please set PLASMO_PUBLIC_OPENAI_API_KEY in your .env file")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const analysis = await analyzeResume(resumeText, apiKey)
      setProfileData(analysis)
      setResumeText("") // Clear the text area
      setSaveMessage("Resume analyzed successfully! Please review and save.")
      setTimeout(() => setSaveMessage(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze resume")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((s) => s !== skill),
    })
  }

  const addExperience = () => {
    setProfileData({
      ...profileData,
      experience: [
        ...profileData.experience,
        {
          title: "",
          company: "",
          startDate: "",
          endDate: null,
          description: "",
        },
      ],
    })
  }

  const updateExperience = (index: number, field: keyof Experience, value: string | null) => {
    const updated = [...profileData.experience]
    updated[index] = { ...updated[index], [field]: value }
    setProfileData({ ...profileData, experience: updated })
  }

  const removeExperience = (index: number) => {
    setProfileData({
      ...profileData,
      experience: profileData.experience.filter((_, i) => i !== index),
    })
  }

  const addEducation = () => {
    setProfileData({
      ...profileData,
      education: [
        ...profileData.education,
        {
          degree: "",
          school: "",
          field: "",
          startDate: "",
          endDate: null,
        },
      ],
    })
  }

  const updateEducation = (index: number, field: keyof Education, value: string | null) => {
    const updated = [...profileData.education]
    updated[index] = { ...updated[index], [field]: value }
    setProfileData({ ...profileData, education: updated })
  }

  const removeEducation = (index: number) => {
    setProfileData({
      ...profileData,
      education: profileData.education.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">Manage your personal information</p>

      {error && (
        <div className="card" style={{ background: "#fee2e2", borderColor: "#ef4444" }}>
          <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>
        </div>
      )}

      {saveMessage && (
        <div className="card" style={{ background: "#d1fae5", borderColor: "#10b981" }}>
          <p style={{ color: "#059669", margin: 0 }}>{saveMessage}</p>
        </div>
      )}

      {/* Input Mode Toggle */}
      <div className="card">
        <h2 className="card-title">How would you like to add your information?</h2>
        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <button
            onClick={() => setInputMode("upload")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: `2px solid ${inputMode === "upload" ? "#667eea" : "#e5e7eb"}`,
              background: inputMode === "upload" ? "#eef2ff" : "white",
              color: inputMode === "upload" ? "#667eea" : "#374151",
              cursor: "pointer",
              fontWeight: inputMode === "upload" ? 600 : 400,
            }}
          >
            Upload Resume
          </button>
          <button
            onClick={() => setInputMode("manual")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: `2px solid ${inputMode === "manual" ? "#667eea" : "#e5e7eb"}`,
              background: inputMode === "manual" ? "#eef2ff" : "white",
              color: inputMode === "manual" ? "#667eea" : "#374151",
              cursor: "pointer",
              fontWeight: inputMode === "manual" ? 600 : 400,
            }}
          >
            Manual Input
          </button>
        </div>
      </div>

      {/* Upload/Text Input Section */}
      {inputMode === "upload" && (
        <div className="card">
          <h2 className="card-title">Upload Resume PDF</h2>
          <div className="card-content">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
              Or paste your resume text below:
            </p>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              style={{
                width: "100%",
                minHeight: "150px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontFamily: "inherit",
                fontSize: "14px",
                resize: "vertical",
              }}
            />
            <button
              onClick={handleAnalyzeResume}
              disabled={isAnalyzing || !resumeText.trim()}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                background: isAnalyzing ? "#9ca3af" : "#667eea",
                color: "white",
                fontWeight: 600,
                cursor: isAnalyzing ? "not-allowed" : "pointer",
              }}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>
        </div>
      )}

      {/* Personal Information Form */}
      <div className="card">
        <h2 className="card-title">Personal Information</h2>
        <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 500 }}>
              First Name *
            </label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 500 }}>
              Last Name *
            </label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 500 }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phoneNumber}
              onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 500 }}>
              Address
            </label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              placeholder="Street address"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            />
            <input
              type="text"
              value={profileData.city}
              onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
              placeholder="City"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            />
            <input
              type="text"
              value={profileData.state}
              onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
              placeholder="State"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            />
            <input
              type="text"
              value={profileData.zipCode}
              onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
              placeholder="ZIP Code"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            />
            <input
              type="text"
              value={profileData.country}
              onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
              placeholder="Country"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 500 }}>
              Birthday
            </label>
            <input
              type="date"
              value={profileData.birthday}
              onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 500 }}>
              LinkedIn Link
            </label>
            <input
              type="url"
              value={profileData.linkedinLink}
              onChange={(e) => setProfileData({ ...profileData, linkedinLink: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h2 className="card-title">Professional Summary</h2>
        <div className="card-content">
          <textarea
            value={profileData.summary}
            onChange={(e) => setProfileData({ ...profileData, summary: e.target.value })}
            placeholder="Write a brief professional summary..."
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontFamily: "inherit",
              fontSize: "14px",
              resize: "vertical",
            }}
          />
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <h2 className="card-title">Skills</h2>
        <div className="card-content">
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill"
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
            />
            <button
              onClick={addSkill}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: "#667eea",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {profileData.skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  background: "#eef2ff",
                  color: "#667eea",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#667eea",
                    cursor: "pointer",
                    fontSize: "18px",
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 className="card-title" style={{ margin: 0 }}>Experience</h2>
          <button
            onClick={addExperience}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: "#667eea",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            + Add Experience
          </button>
        </div>
        <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {profileData.experience.map((exp, index) => (
            <div
              key={index}
              style={{
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Experience {index + 1}</h3>
                <button
                  onClick={() => removeExperience(index)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateExperience(index, "title", e.target.value)}
                  placeholder="Job Title"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(index, "company", e.target.value)}
                  placeholder="Company"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                  placeholder="Start Date"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="month"
                  value={exp.endDate || ""}
                  onChange={(e) => updateExperience(index, "endDate", e.target.value || null)}
                  placeholder="End Date (leave empty if current)"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(index, "description", e.target.value)}
                  placeholder="Job description"
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          ))}
          {profileData.experience.length === 0 && (
            <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", padding: "20px" }}>
              No experience added yet. Click "Add Experience" to get started.
            </p>
          )}
        </div>
      </div>

      {/* Education */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 className="card-title" style={{ margin: 0 }}>Education</h2>
          <button
            onClick={addEducation}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: "#667eea",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            + Add Education
          </button>
        </div>
        <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {profileData.education.map((edu, index) => (
            <div
              key={index}
              style={{
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Education {index + 1}</h3>
                <button
                  onClick={() => removeEducation(index)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, "degree", e.target.value)}
                  placeholder="Degree (e.g., Bachelor's, Master's)"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updateEducation(index, "school", e.target.value)}
                  placeholder="School/University"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => updateEducation(index, "field", e.target.value)}
                  placeholder="Field of Study"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                  placeholder="Start Date"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="month"
                  value={edu.endDate || ""}
                  onChange={(e) => updateEducation(index, "endDate", e.target.value || null)}
                  placeholder="End Date (leave empty if current)"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
          ))}
          {profileData.education.length === 0 && (
            <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", padding: "20px" }}>
              No education added yet. Click "Add Education" to get started.
            </p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="card">
        <button
          onClick={saveProfileData}
          disabled={isSaving}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "8px",
            border: "none",
            background: isSaving ? "#9ca3af" : "#667eea",
            color: "white",
            fontWeight: 600,
            fontSize: "16px",
            cursor: isSaving ? "not-allowed" : "pointer",
          }}
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  )
}

export default Profile

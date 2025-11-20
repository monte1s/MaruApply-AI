// OpenAI API utility for resume analysis

export interface ResumeAnalysisResult {
  firstName: string
  lastName: string
  phoneNumber: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  birthday: string
  linkedinLink: string
  summary: string
  skills: string[]
  experience: Array<{
    title: string
    company: string
    startDate: string
    endDate: string | null
    description: string
  }>
  education: Array<{
    degree: string
    school: string
    field: string
    startDate: string
    endDate: string | null
  }>
}

export const analyzeResume = async (
  resumeText: string,
  apiKey: string
): Promise<ResumeAnalysisResult> => {
  const prompt = `Analyze the following resume text and extract the following information in JSON format. If any information is not found, use empty string for strings, empty array for arrays, and null for dates.

Required fields:
- firstName: First name
- lastName: Last name
- phoneNumber: Phone number
- address: Street address
- city: City name
- state: State/Province
- zipCode: ZIP/Postal code
- country: Country
- birthday: Date of birth (format: YYYY-MM-DD or empty string if not found)
- linkedinLink: LinkedIn profile URL
- summary: Professional summary or objective
- skills: Array of skills (as strings)
- experience: Array of work experience objects with: title, company, startDate, endDate (null if current), description
- education: Array of education objects with: degree, school, field, startDate, endDate (null if current)

Return ONLY valid JSON, no additional text or markdown formatting.

Resume text:
${resumeText}`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a resume parser. Extract information from resumes and return structured JSON data. Always return valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content received from OpenAI")
    }

    // Parse the JSON response
    const parsed = JSON.parse(content)

    // Ensure all required fields exist with defaults
    return {
      firstName: parsed.firstName || "",
      lastName: parsed.lastName || "",
      phoneNumber: parsed.phoneNumber || "",
      address: parsed.address || "",
      city: parsed.city || "",
      state: parsed.state || "",
      zipCode: parsed.zipCode || "",
      country: parsed.country || "",
      birthday: parsed.birthday || "",
      linkedinLink: parsed.linkedinLink || "",
      summary: parsed.summary || "",
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
    }
  } catch (error) {
    console.error("Error analyzing resume:", error)
    throw error
  }
}

// Extract text from PDF file using pdf.js
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Dynamically import pdf.js to avoid SSR issues
    const pdfjsLib = await import("pdfjs-dist")
    
    // Set worker source - use the worker file from assets directory
    // In Chrome extensions, use chrome.runtime.getURL() to get the correct path
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("assets/pdf.worker.min.mjs")

    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    let fullText = ""

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ")
      fullText += pageText + "\n\n"
    }

    if (!fullText.trim()) {
      throw new Error(
        "Could not extract text from PDF. The PDF might be scanned or image-based. Please use manual input or ensure your PDF contains selectable text."
      )
    }

    return fullText.trim()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to extract text from PDF")
  }
}

// Helper function to convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}


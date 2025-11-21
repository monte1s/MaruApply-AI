// Profile data types

export interface ProfileData {
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
  experience: Experience[]
  education: Education[]
  resumeUrl?: string // URL to the uploaded resume PDF in Supabase Storage (public URL or signed URL)
  resumePath?: string // File path in Supabase Storage (for regenerating signed URLs if needed)
}

export interface Experience {
  id?: string
  title: string
  company: string
  startDate: string
  endDate: string | null
  description: string
}

export interface Education {
  id?: string
  degree: string
  school: string
  field: string
  startDate: string
  endDate: string | null
}


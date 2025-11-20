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


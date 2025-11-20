import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, Session, AuthError } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null

    // Get initial session and check if it needs refresh
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error getting session:", error)
          setSession(null)
          setUser(null)
          setLoading(false)
          return
        }

        if (session) {
          setSession(session)
          setUser(session.user)
          
          // Check if session is expired or about to expire (within 5 minutes)
          const expiresAt = session.expires_at
          if (expiresAt) {
            const expiresIn = expiresAt - Math.floor(Date.now() / 1000)
            
            // If session expires in less than 5 minutes, refresh it
            if (expiresIn < 300) {
              console.log("Session expiring soon, refreshing...")
              const { data: { session: refreshedSession }, error: refreshError } = 
                await supabase.auth.refreshSession()
              
              if (!refreshError && refreshedSession) {
                setSession(refreshedSession)
                setUser(refreshedSession.user)
              }
            }
          }
        } else {
          setSession(null)
          setUser(null)
        }
      } catch (err) {
        console.error("Error initializing session:", err)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      
      // Handle token refresh
      if (event === "TOKEN_REFRESHED" && session) {
        setSession(session)
        setUser(session.user)
        return
      }

      // Handle signed out
      if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
        if (refreshInterval) {
          clearInterval(refreshInterval)
          refreshInterval = null
        }
        return
      }

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Set up periodic session refresh (every 10 minutes)
    refreshInterval = setInterval(async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (currentSession) {
          const expiresAt = currentSession.expires_at
          if (expiresAt) {
            const expiresIn = expiresAt - Math.floor(Date.now() / 1000)
            // Refresh if expires in less than 10 minutes
            if (expiresIn < 600) {
              console.log("Refreshing session proactively...")
              const { data: { session: refreshedSession }, error } = 
                await supabase.auth.refreshSession()
              
              if (!error && refreshedSession) {
                setSession(refreshedSession)
                setUser(refreshedSession.user)
              }
            }
          }
        }
      } catch (err) {
        console.error("Error refreshing session:", err)
      }
    }, 10 * 60 * 1000) // Check every 10 minutes

    return () => {
      subscription.unsubscribe()
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    try {
      // Check if we're in a Chrome extension context
      const isChromeExtension = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id
      const hasIdentityAPI = typeof chrome !== "undefined" && chrome.identity
      
      console.log("Chrome extension context:", isChromeExtension)
      console.log("Has identity API:", hasIdentityAPI)

      // For Chrome extensions, use chrome.identity API if available
      // Otherwise, use a standard redirect URL
      const redirectUrl = hasIdentityAPI
        ? chrome.identity.getRedirectURL()
        : window.location.origin + "/auth/callback"

      console.log("Starting Google OAuth with redirect URL:", redirectUrl)
      console.log("Make sure this URL is added to Supabase redirect URLs and Google OAuth settings")

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("Supabase OAuth error:", error)
        return { error }
      }

      if (!data?.url) {
        console.error("No OAuth URL returned from Supabase")
        return {
          error: {
            message: "Failed to get OAuth URL",
            name: "OAuthError",
          } as AuthError,
        }
      }

      console.log("OAuth URL:", data.url)

      if (typeof chrome !== "undefined" && chrome.identity) {
        // Use Chrome identity API for OAuth flow
        return new Promise((resolve) => {
          chrome.identity.launchWebAuthFlow(
            {
              url: data.url,
              interactive: true,
            },
            async (callbackUrl) => {
              if (chrome.runtime.lastError) {
                console.error("Chrome OAuth error:", chrome.runtime.lastError)
                resolve({
                  error: {
                    message: chrome.runtime.lastError.message || "OAuth flow failed",
                    name: "OAuthError",
                  } as AuthError,
                })
                return
              }

              if (!callbackUrl) {
                console.error("No callback URL received")
                resolve({
                  error: {
                    message: "No callback URL received",
                    name: "OAuthError",
                  } as AuthError,
                })
                return
              }

              console.log("Callback URL received:", callbackUrl)

              try {
                const url = new URL(callbackUrl)
                
                // Try hash fragments first (PKCE flow)
                let code: string | null = null
                let error: string | null = null
                let errorDescription: string | null = null

                if (url.hash) {
                  const hashParams = new URLSearchParams(url.hash.substring(1))
                  code = hashParams.get("code")
                  error = hashParams.get("error")
                  errorDescription = hashParams.get("error_description")
                }

                // If not in hash, try query parameters
                if (!code && url.search) {
                  const queryParams = new URLSearchParams(url.search)
                  code = queryParams.get("code")
                  error = queryParams.get("error")
                  errorDescription = queryParams.get("error_description")
                }

                if (error) {
                  console.error("OAuth error in callback:", error, errorDescription)
                  resolve({
                    error: {
                      message: errorDescription || error || "Authentication failed",
                      name: "OAuthError",
                    } as AuthError,
                  })
                  return
                }

                if (code) {
                  console.log("Exchanging code for session...")
                  const { error: exchangeError, data: sessionData } = await supabase.auth.exchangeCodeForSession(code)
                  
                  if (exchangeError) {
                    console.error("Exchange error:", exchangeError)
                    resolve({ error: exchangeError })
                  } else {
                    console.log("Session exchange successful:", sessionData)
                    resolve({ error: null })
                  }
                } else {
                  console.error("No code found in callback URL")
                  resolve({
                    error: {
                      message: "No authorization code found in callback",
                      name: "OAuthError",
                    } as AuthError,
                  })
                }
              } catch (err) {
                console.error("Error processing callback:", err)
                resolve({
                  error: {
                    message: err instanceof Error ? err.message : "Failed to process authentication",
                    name: "OAuthError",
                  } as AuthError,
                })
              }
            }
          )
        })
      }

      // Fallback: if chrome.identity is not available, redirect normally
      // This won't work well in extensions but provides a fallback
      if (data.url) {
        window.location.href = data.url
        return { error: null }
      }

      return {
        error: {
          message: "Chrome identity API not available",
          name: "OAuthError",
        } as AuthError,
      }
    } catch (err) {
      console.error("Google sign-in error:", err)
      return {
        error: {
          message: err instanceof Error ? err.message : "Failed to initiate Google sign-in",
          name: "GoogleSignInError",
        } as AuthError,
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


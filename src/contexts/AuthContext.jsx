import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Function to fetch user profile data
  const fetchUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return profile
    } catch (error) {
      console.error('Exception fetching user profile:', error)
      return null
    }
  }

  useEffect(() => {
    // This flag helps prevent race conditions
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Error getting session:', sessionError)
          if (isMounted) {
            setUser(null)
            setLoading(false)
            setAuthInitialized(true)
          }
          return
        }

        if (session?.user) {
          // Get user profile data
          const profile = await fetchUserProfile(session.user.id)

          if (profile && isMounted) {
            setUser({
              ...session.user,
              ...profile
            })
          } else if (isMounted) {
            // If no profile found, log out the user
            await supabase.auth.signOut()
            setUser(null)
          }
        } else if (isMounted) {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setAuthInitialized(true)
        }
      }
    }

    initializeAuth()

    // Set up auth state change listener only after initial auth check
    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session')

      if (event === 'SIGNED_IN' && session) {
        const profile = await fetchUserProfile(session.user.id)

        if (profile && isMounted) {
          setUser({
            ...session.user,
            ...profile
          })
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        if (isMounted) {
          setUser(null)
        }
      }

      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false;
      authListener.data.subscription.unsubscribe()
    }
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true)

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Manually fetch the profile to ensure we have it
      if (data.user) {
        const profile = await fetchUserProfile(data.user.id)

        if (profile) {
          setUser({
            ...data.user,
            ...profile
          })
        } else {
          // If no profile found, sign out
          await supabase.auth.signOut()
          throw new Error('User profile not found. Please contact an administrator.')
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Login error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setLoading(true)

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Manually set user to null for immediate UI update
      setUser(null)

      return { error: null }
    } catch (error) {
      console.error('Logout error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates) => {
    if (!user) {
      return { error: new Error('No user is logged in') }
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Update the user state with the new data
      setUser(prev => ({ ...prev, ...updates }))

      return { error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    authInitialized,
    login,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
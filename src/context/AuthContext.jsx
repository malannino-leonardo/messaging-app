import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { getUserById, updateOnlineStatus } from '../services/userService'
import { requestNotificationPermission } from '../services/notificationService'

const AuthContext = createContext({})

export const useAuthContext = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          // Clear any bad session data
          await supabase.auth.signOut()
          return
        }
        
        if (session?.user && mounted) {
          setUser(session.user)
          try {
            const profile = await getUserById(session.user.id)
            if (mounted) {
              setUserProfile(profile)
              await updateOnlineStatus(session.user.id, true)
              // Request notification permission on login
              requestNotificationPermission().catch(err => 
                console.log('Notification permission denied:', err)
              )
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError)
            // Profile doesn't exist, sign out
            if (profileError.message?.includes('No rows')) {
              await supabase.auth.signOut()
              setUser(null)
              setUserProfile(null)
            }
          }
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth event:', event)

        if (event === 'SIGNED_IN' && session?.user) {
          // Only fetch profile if we don't already have it (initial login)
          if (!userProfile || userProfile.id !== session.user.id) {
            setUser(session.user)
            setLoading(true)
            try {
              const profile = await getUserById(session.user.id)
              if (mounted) {
                setUserProfile(profile)
                await updateOnlineStatus(session.user.id, true)
              }
            } catch (error) {
              console.error('Error fetching user profile:', error)
            } finally {
              if (mounted) setLoading(false)
            }
          }
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          if (user && mounted) {
            try {
              await updateOnlineStatus(user.id, false)
            } catch (error) {
              console.error('Error updating status on signout:', error)
            }
          }
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          // Session refreshed, continue normally
          console.log('Token refreshed')
        }
      }
    )

    // Update online status on window focus/blur
    const handleVisibilityChange = async () => {
      if (user && initialized) {
        try {
          await updateOnlineStatus(user.id, !document.hidden)
        } catch (error) {
          console.error('Error updating visibility status:', error)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      mounted = false
      subscription?.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Update online status when user changes
  useEffect(() => {
    if (!user || !initialized) return

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability on page unload
      if (user && navigator.sendBeacon) {
        const url = `${supabase.supabaseUrl}/rest/v1/users?id=eq.${user.id}`
        const data = JSON.stringify({ is_online: false, last_seen: new Date().toISOString() })
        navigator.sendBeacon(url, data)
      } else if (user) {
        updateOnlineStatus(user.id, false).catch(console.error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [user, initialized])

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await getUserById(user.id)
        setUserProfile(profile)
      } catch (error) {
        console.error('Error refreshing profile:', error)
      }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    initialized,
    refreshUserProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

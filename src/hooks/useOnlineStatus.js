import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'

export const useOnlineStatus = () => {
  const { user } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState({})

  // Update own online status
  const updateStatus = useCallback(async (isOnline) => {
    if (!user) return
    
    try {
      await supabase
        .from('users')
        .update({ 
          is_online: isOnline, 
          last_seen: new Date().toISOString() 
        })
        .eq('id', user.id)
    } catch (error) {
      console.error('Error updating online status:', error)
    }
  }, [user])

  // Subscribe to online status changes
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('online-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: 'is_online=neq.null'
        },
        (payload) => {
          setOnlineUsers(prev => ({
            ...prev,
            [payload.new.id]: {
              is_online: payload.new.is_online,
              last_seen: payload.new.last_seen
            }
          }))
        }
      )
      .subscribe()

    // Set online on mount
    updateStatus(true)

    // Handle visibility change
    const handleVisibilityChange = () => {
      updateStatus(!document.hidden)
    }

    // Handle beforeunload
    const handleBeforeUnload = () => {
      updateStatus(false)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      supabase.removeChannel(subscription)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      updateStatus(false)
    }
  }, [user, updateStatus])

  // Check if a user is online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers[userId]?.is_online || false
  }, [onlineUsers])

  // Get last seen time for a user
  const getLastSeen = useCallback((userId) => {
    return onlineUsers[userId]?.last_seen || null
  }, [onlineUsers])

  return {
    onlineUsers,
    isUserOnline,
    getLastSeen,
    updateStatus,
  }
}

export default useOnlineStatus

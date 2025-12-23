import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'

export const useRealtime = (tableName, filter = null, callback = null) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from(tableName).select('*')
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      const { data: result, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      setData(result || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tableName, filter])

  // Subscribe to changes
  useEffect(() => {
    fetchData()

    const channelName = `realtime-${tableName}-${JSON.stringify(filter || {})}`
    
    let subscriptionConfig = {
      event: '*',
      schema: 'public',
      table: tableName,
    }
    
    if (filter) {
      const filterString = Object.entries(filter)
        .map(([key, value]) => `${key}=eq.${value}`)
        .join(',')
      subscriptionConfig.filter = filterString
    }

    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', subscriptionConfig, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item => 
            item.id === payload.new.id ? payload.new : item
          ))
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== payload.old.id))
        }
        
        if (callback) {
          callback(payload)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [tableName, filter, fetchData, callback])

  // Refresh data manually
  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refresh,
  }
}

export default useRealtime

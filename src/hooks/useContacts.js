import { useState, useCallback } from 'react'
import { searchUsers, getAllUsers, getChatContacts } from '../services/userService'
import { useAuth } from './useAuth'

export const useContacts = () => {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load all chat contacts
  const loadContacts = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const contactsList = await getChatContacts(user.id)
      setContacts(contactsList)
      return contactsList
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  // Search for users
  const search = useCallback(async (searchTerm) => {
    if (!user || !searchTerm.trim()) {
      setSearchResults([])
      return []
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const results = await searchUsers(searchTerm, user.id)
      setSearchResults(results)
      return results
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  // Get all users
  const loadAllUsers = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const users = await getAllUsers(user.id)
      return users
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([])
  }, [])

  return {
    contacts,
    searchResults,
    loading,
    error,
    loadContacts,
    search,
    loadAllUsers,
    clearSearch,
  }
}

export default useContacts

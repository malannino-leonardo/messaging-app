import { useState, useCallback } from 'react'
import { 
  sendMessage, 
  editMessage, 
  deleteMessage, 
  markMessageAsRead,
  markAllMessagesAsRead 
} from '../services/messageService'
import { useAuth } from './useAuth'
import { useChat } from './useChat'

export const useMessages = () => {
  const { user } = useAuth()
  const { selectedContact, addMessage, updateMessage, removeMessage } = useChat()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const send = useCallback(async (message, imageUrl = null) => {
    if (!user || !selectedContact) return null
    
    setSending(true)
    setError(null)
    
    try {
      const newMessage = await sendMessage(user.id, selectedContact.id, message, imageUrl)
      addMessage(newMessage)
      return newMessage
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSending(false)
    }
  }, [user, selectedContact, addMessage])

  const edit = useCallback(async (messageId, newMessage) => {
    setError(null)
    
    try {
      const updated = await editMessage(messageId, newMessage)
      updateMessage(updated)
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [updateMessage])

  const remove = useCallback(async (messageId) => {
    setError(null)
    
    try {
      await deleteMessage(messageId)
      removeMessage(messageId)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [removeMessage])

  const markAsRead = useCallback(async (messageId) => {
    try {
      await markMessageAsRead(messageId)
    } catch (err) {
      console.error('Error marking message as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async (senderId) => {
    if (!user) return
    
    try {
      await markAllMessagesAsRead(senderId, user.id)
    } catch (err) {
      console.error('Error marking all messages as read:', err)
    }
  }, [user])

  return {
    send,
    edit,
    remove,
    markAsRead,
    markAllAsRead,
    sending,
    error,
  }
}

export default useMessages

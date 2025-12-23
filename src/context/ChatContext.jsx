import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuthContext } from './AuthContext'
import { 
  getMessages, 
  getLatestMessages, 
  subscribeToMessages, 
  unsubscribeFromMessages,
  markAllMessagesAsRead,
  getUnreadCount
} from '../services/messageService'
import { getChatContacts, getUserById } from '../services/userService'
import { showMessageNotification, requestNotificationPermission } from '../services/notificationService'

const ChatContext = createContext({})

export const useChatContext = () => useContext(ChatContext)

export const ChatProvider = ({ children }) => {
  const { user } = useAuthContext()
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [latestMessages, setLatestMessages] = useState([])
  const [unreadCounts, setUnreadCounts] = useState({})
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState(null)

  // Load contacts
  const loadContacts = useCallback(async () => {
    if (!user) return
    try {
      const contactsList = await getChatContacts(user.id)
      setContacts(contactsList)
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }, [user])

  // Load latest messages for chat list
  const loadLatestMessages = useCallback(async () => {
    if (!user) return
    try {
      const latest = await getLatestMessages(user.id)
      setLatestMessages(latest)
    } catch (error) {
      console.error('Error loading latest messages:', error)
    }
  }, [user])

  // Load messages for selected contact
  const loadMessages = useCallback(async (contactId) => {
    if (!user || !contactId) return
    setLoading(true)
    try {
      const msgs = await getMessages(user.id, contactId)
      setMessages(msgs)
      
      // Mark messages as read
      await markAllMessagesAsRead(contactId, user.id)
      
      // Update unread counts
      setUnreadCounts(prev => ({ ...prev, [contactId]: 0 }))
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load unread counts for all contacts
  const loadUnreadCounts = useCallback(async () => {
    if (!user || contacts.length === 0) return
    try {
      const counts = {}
      for (const contact of contacts) {
        counts[contact.id] = await getUnreadCount(user.id, contact.id)
      }
      setUnreadCounts(counts)
    } catch (error) {
      console.error('Error loading unread counts:', error)
    }
  }, [user, contacts])

  // Select a contact
  const selectContact = useCallback(async (contactId) => {
    if (!contactId) {
      setSelectedContact(null)
      setMessages([])
      return
    }

    try {
      const contact = contacts.find(c => c.id === contactId) || await getUserById(contactId)
      setSelectedContact(contact)
      await loadMessages(contactId)
    } catch (error) {
      console.error('Error selecting contact:', error)
    }
  }, [contacts, loadMessages])

  // Add new message to state
  const addMessage = useCallback((newMessage) => {
    setMessages(prev => [...prev, newMessage])
    
    // Show notification for incoming messages (not from current user)
    if (newMessage.sender_id !== user?.id && document.hidden) {
      getUserById(newMessage.sender_id).then(sender => {
        showMessageNotification(
          sender.username,
          newMessage.message || 'Sent an image',
          () => {
            // Focus window and select the sender
            window.focus()
            selectContact(newMessage.sender_id)
          }
        )
      }).catch(err => console.error('Error showing notification:', err))
    }
    
    // Update latest messages
    setLatestMessages(prev => {
      const otherUserId = newMessage.sender_id === user?.id 
        ? newMessage.receiver_id 
        : newMessage.sender_id
      
      const filtered = prev.filter(msg => {
        const msgOtherId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id
        return msgOtherId !== otherUserId
      })
      
      return [newMessage, ...filtered]
    })
  }, [user, selectContact])

  // Update message in state
  const updateMessage = useCallback((updatedMessage) => {
    setMessages(prev => 
      prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
    )
  }, [])

  // Remove message from state
  const removeMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }, [])

  // Initialize data when user logs in
  useEffect(() => {
    if (user) {
      loadContacts()
      loadLatestMessages()
    } else {
      setContacts([])
      setSelectedContact(null)
      setMessages([])
      setLatestMessages([])
      setUnreadCounts({})
    }
  }, [user, loadContacts, loadLatestMessages])

  // Load unread counts when contacts change
  useEffect(() => {
    loadUnreadCounts()
  }, [contacts, loadUnreadCounts])

  // Subscribe to realtime messages
  useEffect(() => {
    if (!user) return

    const sub = subscribeToMessages(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new
        
        // If message is from selected contact, add it
        if (selectedContact && 
            (newMessage.sender_id === selectedContact.id || newMessage.receiver_id === selectedContact.id)) {
          addMessage(newMessage)
          
          // Mark as read if from contact
          if (newMessage.sender_id === selectedContact.id) {
            markAllMessagesAsRead(selectedContact.id, user.id)
          }
        } else if (newMessage.sender_id !== user.id) {
          // Update unread count for other contacts
          setUnreadCounts(prev => ({
            ...prev,
            [newMessage.sender_id]: (prev[newMessage.sender_id] || 0) + 1
          }))
        }
        
        // Update latest messages
        loadLatestMessages()
        
        // Add to contacts if new
        if (!contacts.find(c => c.id === newMessage.sender_id)) {
          loadContacts()
        }
      } else if (payload.eventType === 'UPDATE') {
        updateMessage(payload.new)
      } else if (payload.eventType === 'DELETE') {
        removeMessage(payload.old.id)
      }
    })

    setSubscription(sub)

    return () => {
      if (sub) {
        unsubscribeFromMessages(sub)
      }
    }
  }, [user, selectedContact, contacts, addMessage, updateMessage, removeMessage, loadLatestMessages, loadContacts])

  const value = {
    contacts,
    selectedContact,
    messages,
    latestMessages,
    unreadCounts,
    loading,
    loadContacts,
    loadMessages,
    selectContact,
    addMessage,
    updateMessage,
    removeMessage,
    refreshLatestMessages: loadLatestMessages,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export default ChatContext

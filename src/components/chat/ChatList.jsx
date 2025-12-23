import { useEffect, useRef } from 'react'
import { useChat } from '../../hooks/useChat'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import { formatDistanceToNow } from 'date-fns'

const ChatList = ({ onSelectChat }) => {
  const { userProfile } = useAuth()
  const { contacts, latestMessages, unreadCounts, selectedContact, selectContact } = useChat()

  // Get latest message for a contact
  const getLatestMessage = (contactId) => {
    return latestMessages.find(msg => 
      msg.sender_id === contactId || msg.receiver_id === contactId
    )
  }

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  const handleSelect = (contact) => {
    selectContact(contact.id)
    if (onSelectChat) onSelectChat(contact)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-center">No conversations yet</p>
            <p className="text-sm text-center mt-1">Search for users to start chatting</p>
          </div>
        ) : (
          contacts.map(contact => {
            const latestMessage = getLatestMessage(contact.id)
            const unreadCount = unreadCounts[contact.id] || 0
            const isSelected = selectedContact?.id === contact.id

            return (
              <div
                key={contact.id}
                onClick={() => handleSelect(contact)}
                className={`
                  flex items-center gap-3 p-4 cursor-pointer transition-colors
                  hover:bg-gray-50 border-b
                  ${isSelected ? 'bg-primary-50' : ''}
                `}
              >
                <Avatar 
                  src={contact.avatar_url} 
                  alt={contact.username} 
                  size="md"
                  online={contact.is_online}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{contact.username}</h3>
                    {latestMessage && (
                      <span className="text-xs text-gray-500">
                        {formatTime(latestMessage.sent_at)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 truncate">
                      {latestMessage?.sender_id === userProfile?.id && (
                        <span className="text-gray-400">You: </span>
                      )}
                      {latestMessage?.message || 'No messages yet'}
                    </p>
                    
                    {unreadCount > 0 && (
                      <span className="bg-primary-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ChatList

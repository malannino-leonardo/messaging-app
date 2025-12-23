import { useState } from 'react'
import Avatar from '../ui/Avatar'
import { format } from 'date-fns'
import { useMessages } from '../../hooks/useMessages'

const MessageBubble = ({ message, isOwn, showAvatar, contact }) => {
  const { edit, remove } = useMessages()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.message)

  const handleEdit = async () => {
    if (editText.trim() && editText !== message.message) {
      try {
        await edit(message.id, editText)
      } catch (error) {
        console.error('Failed to edit message:', error)
      }
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    try {
      await remove(message.id)
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
    setShowMenu(false)
  }

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="w-8 flex-shrink-0">
        {showAvatar && !isOwn && (
          <Avatar 
            src={contact?.avatar_url} 
            alt={contact?.username || 'User'} 
            size="sm"
          />
        )}
      </div>

      {/* Message content */}
      <div 
        className={`
          relative max-w-[70%] group
          ${isOwn ? 'items-end' : 'items-start'}
        `}
        onMouseLeave={() => setShowMenu(false)}
      >
        {/* Bubble */}
        <div 
          className={`
            px-4 py-2 rounded-2xl
            ${isOwn 
              ? 'bg-primary-500 text-white rounded-tr-sm' 
              : 'bg-white text-gray-900 rounded-tl-sm shadow-sm'
            }
          `}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="bg-transparent border-b border-white/50 outline-none text-inherit"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEdit()
                  if (e.key === 'Escape') setIsEditing(false)
                }}
              />
              <div className="flex gap-2 text-xs">
                <button onClick={handleEdit} className="hover:underline">Save</button>
                <button onClick={() => setIsEditing(false)} className="hover:underline">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap break-words">{message.message}</p>
              
              {/* Image attachment */}
              {message.image_url && (
                <img 
                  src={message.image_url} 
                  alt="Attachment"
                  className="mt-2 rounded-lg max-w-full max-h-60 object-cover"
                />
              )}
            </>
          )}
        </div>

        {/* Time and status */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{format(new Date(message.sent_at), 'HH:mm')}</span>
          {message.is_edited && <span>(edited)</span>}
          {isOwn && (
            <span>
              {message.is_read ? (
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </span>
          )}
        </div>

        {/* Menu button (own messages only) */}
        {isOwn && !isEditing && (
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="absolute top-1 -left-8 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        )}

        {/* Context menu */}
        {showMenu && (
          <div className="absolute top-0 -left-24 bg-white rounded-lg shadow-lg border py-1 z-10">
            <button 
              onClick={() => { setIsEditing(true); setShowMenu(false) }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              Edit
            </button>
            <button 
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble

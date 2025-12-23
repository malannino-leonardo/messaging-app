import Avatar from '../ui/Avatar'
import { formatDistanceToNow } from 'date-fns'
import { Phone, Video, MoreVertical } from 'lucide-react'

const ChatHeader = ({ contact }) => {
  if (!contact) return null

  const getStatusText = () => {
    if (contact.is_online) return 'Online'
    if (contact.last_seen) {
      return `Last seen ${formatDistanceToNow(new Date(contact.last_seen), { addSuffix: true })}`
    }
    return 'Offline'
  }

  return (
    <div className="flex items-center gap-3 p-4 border-b bg-white">
      <Avatar 
        src={contact.avatar_url} 
        alt={contact.username} 
        size="md"
        online={contact.is_online}
      />
      
      <div className="flex-1">
        <h3 className="font-semibold">{contact.username}</h3>
        <p className={`text-sm ${contact.is_online ? 'text-green-500' : 'text-gray-500'}`}>
          {getStatusText()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader

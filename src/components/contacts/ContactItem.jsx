import Avatar from '../ui/Avatar'
import { formatDistanceToNow } from 'date-fns'

const ContactItem = ({ contact, onClick, isSelected }) => {
  const getStatusText = () => {
    if (contact.is_online) return 'Online'
    if (contact.last_seen) {
      return formatDistanceToNow(new Date(contact.last_seen), { addSuffix: true })
    }
    return 'Offline'
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-lg transition-colors
        ${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'}
      `}
    >
      <Avatar 
        src={contact.avatar_url} 
        alt={contact.username} 
        size="md"
        online={contact.is_online}
      />
      
      <div className="flex-1 text-left">
        <p className="font-medium">{contact.username}</p>
        <p className={`text-sm ${contact.is_online ? 'text-green-500' : 'text-gray-500'}`}>
          {getStatusText()}
        </p>
      </div>
    </button>
  )
}

export default ContactItem

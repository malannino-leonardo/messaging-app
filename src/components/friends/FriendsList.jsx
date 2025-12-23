import { useState, useEffect } from 'react'
import { getFriends, removeFriend, unsubscribeFriendRequests } from '../../services/friendService'
import { supabase } from '../../services/supabase'
import { UserCircle, UserMinus, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const FriendsList = () => {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadFriends = async () => {
    try {
      const data = await getFriends()
      setFriends(data)
    } catch (error) {
      console.error('Error loading friends:', error)
      toast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFriends()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('friends-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
        },
        () => {
          loadFriends()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleRemoveFriend = async (friendId, username) => {
    if (!confirm(`Remove ${username} from friends?`)) return

    try {
      await removeFriend(friendId)
      toast.success(`${username} removed from friends`)
      loadFriends()
    } catch (error) {
      console.error('Error removing friend:', error)
      toast.error('Failed to remove friend')
    }
  }

  const handleMessage = (friendId) => {
    navigate('/', { state: { selectedUserId: friendId } })
  }

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never'
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCircle className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          No friends yet
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Search for users and send friend requests to start connecting!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          {/* Avatar */}
          <div className="relative">
            {friend.avatar_url ? (
              <img
                src={friend.avatar_url}
                alt={friend.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            {friend.is_online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {friend.username}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {friend.is_online ? 'Online' : `Last seen ${formatLastSeen(friend.last_seen)}`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => handleMessage(friend.id)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              title="Send message"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleRemoveFriend(friend.id, friend.username)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
              title="Remove friend"
            >
              <UserMinus className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FriendsList

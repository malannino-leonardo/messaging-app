import { useState, useEffect } from 'react'
import {
  searchNonFriends,
  sendFriendRequest,
  getFriendRequestStatus,
  checkFriendship,
  getFriendSuggestions,
} from '../../services/friendService'
import { UserCircle, UserPlus, Clock, Check, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [requestStatuses, setRequestStatuses] = useState({})

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true)
      const data = await getFriendSuggestions(10)
      setSuggestions(data)

      // Load statuses for suggestions
      const statuses = {}
      for (const user of data) {
        const status = await getFriendRequestStatus(user.id)
        statuses[user.id] = status
      }
      setRequestStatuses(statuses)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  useEffect(() => {
    loadSuggestions()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    try {
      setLoading(true)
      const results = await searchNonFriends(searchTerm)
      setSearchResults(results)

      // Load statuses for search results
      const statuses = {}
      for (const user of results) {
        const status = await getFriendRequestStatus(user.id)
        statuses[user.id] = status
      }
      setRequestStatuses(statuses)
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (userId, username) => {
    try {
      await sendFriendRequest(userId)
      toast.success(`Friend request sent to ${username}`)

      // Update status
      setRequestStatuses((prev) => ({ ...prev, [userId]: 'sent' }))
    } catch (error) {
      console.error('Error sending request:', error)
      if (error.message.includes('duplicate')) {
        toast.error('Friend request already sent')
      } else {
        toast.error('Failed to send friend request')
      }
    }
  }

  const getButtonContent = (userId) => {
    const status = requestStatuses[userId]

    if (status === 'friends') {
      return (
        <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm flex items-center gap-1">
          <Check className="w-4 h-4" />
          Friends
        </span>
      )
    }

    if (status === 'sent') {
      return (
        <span className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm flex items-center gap-1">
          <Clock className="w-4 h-4" />
          Pending
        </span>
      )
    }

    if (status === 'received') {
      return (
        <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
          Respond to request
        </span>
      )
    }

    return (
      <button
        onClick={() => handleSendRequest(userId, searchResults.find((u) => u.id === userId)?.username || suggestions.find((u) => u.id === userId)?.username)}
        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
      >
        <UserPlus className="w-4 h-4" />
        Add Friend
      </button>
    )
  }

  const renderUserList = (users, title) => {
    if (users.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {title}
        </h3>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              {/* Avatar */}
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                </div>
              )}

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.username}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>

              {/* Action Button */}
              {getButtonContent(user.id)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by username..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Search Results */}
      {!loading && searchResults.length > 0 && renderUserList(searchResults, 'Search Results')}

      {/* No Results */}
      {!loading && searchTerm && searchResults.length === 0 && (
        <div className="text-center py-12">
          <UserCircle className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No users found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Try searching with a different username
          </p>
        </div>
      )}

      {/* Suggestions */}
      {!loading && !searchTerm && (
        <>
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            renderUserList(suggestions, 'People you may know')
          )}
        </>
      )}
    </div>
  )
}

export default UserSearch

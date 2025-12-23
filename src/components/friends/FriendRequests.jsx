import { useState, useEffect } from 'react'
import {
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  subscribeFriendRequests,
  unsubscribeFriendRequests,
} from '../../services/friendService'
import { UserCircle, Check, X, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const FriendRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('received') // 'received' or 'sent'

  const loadRequests = async () => {
    try {
      const [pending, sent] = await Promise.all([
        getPendingRequests(),
        getSentRequests(),
      ])
      setPendingRequests(pending)
      setSentRequests(sent)
    } catch (error) {
      console.error('Error loading requests:', error)
      toast.error('Failed to load friend requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()

    // Subscribe to real-time updates
    const subscription = subscribeFriendRequests(() => {
      loadRequests()
    })

    return () => {
      unsubscribeFriendRequests(subscription)
    }
  }, [])

  const handleAccept = async (requestId, username) => {
    try {
      await acceptFriendRequest(requestId)
      toast.success(`You are now friends with ${username}!`)
      loadRequests()
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error('Failed to accept friend request')
    }
  }

  const handleReject = async (requestId, username) => {
    try {
      await rejectFriendRequest(requestId)
      toast.success(`Rejected friend request from ${username}`)
      loadRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject friend request')
    }
  }

  const handleCancel = async (requestId, username) => {
    try {
      await cancelFriendRequest(requestId)
      toast.success(`Cancelled friend request to ${username}`)
      loadRequests()
    } catch (error) {
      console.error('Error cancelling request:', error)
      toast.error('Failed to cancel friend request')
    }
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'received'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Received ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'sent'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Sent ({sentRequests.filter((r) => r.status === 'pending').length})
        </button>
      </div>

      {/* Received Requests */}
      {activeTab === 'received' && (
        <div className="space-y-2">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No pending requests
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Friend requests will appear here
              </p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                {/* Avatar */}
                {request.sender.avatar_url ? (
                  <img
                    src={request.sender.avatar_url}
                    alt={request.sender.username}
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
                    {request.sender.username}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(request.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleAccept(request.id, request.sender.username)
                    }
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleReject(request.id, request.sender.username)
                    }
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sent Requests */}
      {activeTab === 'sent' && (
        <div className="space-y-2">
          {sentRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No sent requests
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Requests you send will appear here
              </p>
            </div>
          ) : (
            sentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                {/* Avatar */}
                {request.receiver.avatar_url ? (
                  <img
                    src={request.receiver.avatar_url}
                    alt={request.receiver.username}
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
                    {request.receiver.username}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {request.status === 'pending' && `Sent ${formatDate(request.created_at)}`}
                    {request.status === 'accepted' && 'Accepted ✓'}
                    {request.status === 'rejected' && 'Declined'}
                  </p>
                </div>

                {/* Actions */}
                {request.status === 'pending' && (
                  <button
                    onClick={() =>
                      handleCancel(request.id, request.receiver.username)
                    }
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                )}
                {request.status !== 'pending' && (
                  <span
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      request.status === 'accepted'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {request.status === 'accepted' ? 'Accepted' : 'Declined'}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default FriendRequests

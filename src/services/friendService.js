import { supabase } from './supabase'

// Send a friend request
export const sendFriendRequest = async (receiverId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('friend_requests')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Accept friend request using database function
export const acceptFriendRequest = async (requestId) => {
  const { data, error } = await supabase
    .rpc('accept_friend_request', { request_id: requestId })

  if (error) throw error
  return data
}

// Reject friend request using database function
export const rejectFriendRequest = async (requestId) => {
  const { data, error } = await supabase
    .rpc('reject_friend_request', { request_id: requestId })

  if (error) throw error
  return data
}

// Cancel sent friend request
export const cancelFriendRequest = async (requestId) => {
  const { error } = await supabase
    .from('friend_requests')
    .delete()
    .eq('id', requestId)

  if (error) throw error
}

// Get pending friend requests received
export const getPendingRequests = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('friend_requests')
    .select(`
      id,
      sender_id,
      created_at,
      sender:users!sender_id (
        id,
        username,
        email,
        avatar_url,
        is_online,
        last_seen
      )
    `)
    .eq('receiver_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get sent friend requests
export const getSentRequests = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('friend_requests')
    .select(`
      id,
      receiver_id,
      status,
      created_at,
      receiver:users!receiver_id (
        id,
        username,
        email,
        avatar_url,
        is_online,
        last_seen
      )
    `)
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get all friends using the view
export const getFriends = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('friends')
    .select(`
      id,
      created_at,
      friend:users!friend_id (
        id,
        username,
        email,
        avatar_url,
        is_online,
        last_seen
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(f => ({ ...f.friend, friendship_id: f.id, friendship_date: f.created_at }))
}

// Remove friend using database function
export const removeFriend = async (friendId) => {
  const { data, error } = await supabase
    .rpc('remove_friend', { friend_user_id: friendId })

  if (error) throw error
  return data
}

// Check if users are friends
export const checkFriendship = async (userId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .rpc('are_friends', { user1_id: user.id, user2_id: userId })

  if (error) throw error
  return data
}

// Get friend request status between two users
export const getFriendRequestStatus = async (userId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .rpc('get_friend_request_status', { user1_id: user.id, user2_id: userId })

  if (error) throw error
  return data
}

// Search for users (non-friends)
export const searchNonFriends = async (searchTerm) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current friends
  const friends = await getFriends()
  const friendIds = friends.map(f => f.id)

  // Search for users excluding self and current friends
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, avatar_url, is_online, last_seen')
    .neq('id', user.id)
    .not('id', 'in', `(${friendIds.length > 0 ? friendIds.join(',') : 'null'})`)
    .ilike('username', `%${searchTerm}%`)
    .limit(20)

  if (error) throw error
  return data
}

// Get friend suggestions (users with mutual friends)
export const getFriendSuggestions = async (limit = 10) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current friends
  const friends = await getFriends()
  const friendIds = friends.map(f => f.id)

  if (friendIds.length === 0) {
    // If no friends yet, just return random users
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar_url, is_online, last_seen')
      .neq('id', user.id)
      .limit(limit)

    if (error) throw error
    return data
  }

  // Find friends of friends
  const { data, error } = await supabase
    .from('friends')
    .select(`
      friend_id,
      friend:users!friend_id (
        id,
        username,
        email,
        avatar_url,
        is_online,
        last_seen
      )
    `)
    .in('user_id', friendIds)
    .not('friend_id', 'in', `(${[user.id, ...friendIds].join(',')})`)
    .limit(limit)

  if (error) throw error

  // Deduplicate and format
  const seen = new Set()
  const suggestions = []

  for (const item of data) {
    if (!seen.has(item.friend_id)) {
      seen.add(item.friend_id)
      suggestions.push(item.friend)
    }
  }

  return suggestions
}

// Subscribe to friend requests
export const subscribeFriendRequests = (callback) => {
  const { data: { user } } = supabase.auth.getUser()

  const subscription = supabase
    .channel('friend_requests')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'friend_requests',
        filter: `receiver_id=eq.${user.id}`,
      },
      callback
    )
    .subscribe()

  return subscription
}

// Unsubscribe
export const unsubscribeFriendRequests = (subscription) => {
  supabase.removeChannel(subscription)
}

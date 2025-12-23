import { supabase } from './supabase'

// Get user profile by ID
export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user by ID:', error)
    throw error
  }
  if (!data) {
    console.error('User not found with ID:', userId)
    throw new Error('User not found')
  }
  return data
}

// Get user profile by username
export const getUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('User not found')
  return data
}

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('User not found')
  return data
}

// Update avatar URL
export const updateAvatar = async (userId, avatarUrl) => {
  return updateUserProfile(userId, { avatar_url: avatarUrl })
}

// Search users by username
export const searchUsers = async (searchTerm, currentUserId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, avatar_url, is_online, last_seen')
    .neq('id', currentUserId)
    .ilike('username', `%${searchTerm}%`)
    .limit(20)

  if (error) throw error
  return data
}

// Get all users except current user
export const getAllUsers = async (currentUserId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, avatar_url, is_online, last_seen')
    .neq('id', currentUserId)
    .order('username', { ascending: true })

  if (error) throw error
  return data
}

// Update user online status
export const updateOnlineStatus = async (userId, isOnline) => {
  const { error } = await supabase
    .from('users')
    .update({ 
      is_online: isOnline, 
      last_seen: new Date().toISOString() 
    })
    .eq('id', userId)

  if (error) throw error
}

// Update user status (online, inactive, dnd, offline)
export const updateUserStatus = async (userId, status) => {
  const { error } = await supabase
    .from('users')
    .update({ 
      status,
      is_online: status === 'online',
      last_seen: new Date().toISOString() 
    })
    .eq('id', userId)

  if (error) throw error
}

// Get users the current user has chatted with
export const getChatContacts = async (currentUserId) => {
  // Get unique users from messages
  const { data: sentMessages, error: sentError } = await supabase
    .from('messages')
    .select('receiver_id')
    .eq('sender_id', currentUserId)

  if (sentError) throw sentError

  const { data: receivedMessages, error: receivedError } = await supabase
    .from('messages')
    .select('sender_id')
    .eq('receiver_id', currentUserId)

  if (receivedError) throw receivedError

  // Get unique user IDs
  const userIds = [...new Set([
    ...sentMessages.map(m => m.receiver_id),
    ...receivedMessages.map(m => m.sender_id)
  ])]

  if (userIds.length === 0) return []

  // Fetch user details
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username, email, avatar_url, is_online, last_seen')
    .in('id', userIds)

  if (usersError) throw usersError
  return users
}

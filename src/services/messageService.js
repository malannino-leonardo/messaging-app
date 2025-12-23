import { supabase } from './supabase'

// Send a message
export const sendMessage = async (senderId, receiverId, message, imageUrl = null) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message,
      image_url: imageUrl,
      is_read: false,
      is_edited: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get messages between two users
export const getMessages = async (userId1, userId2, limit = 50, offset = 0) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
    )
    .order('sent_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

// Get latest messages for chat list
export const getLatestMessages = async (userId) => {
  // Get latest message with each contact
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('sent_at', { ascending: false })

  if (error) throw error

  // Group by conversation and get latest
  const conversations = new Map()
  data.forEach((msg) => {
    const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
    if (!conversations.has(otherUserId)) {
      conversations.set(otherUserId, msg)
    }
  })

  return Array.from(conversations.values())
}

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Mark all messages from a sender as read
export const markAllMessagesAsRead = async (senderId, receiverId) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('is_read', false)
    .select()

  if (error) throw error
  return data
}

// Edit a message
export const editMessage = async (messageId, newMessage) => {
  const { data, error } = await supabase
    .from('messages')
    .update({
      message: newMessage,
      is_edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Delete a message
export const deleteMessage = async (messageId) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (error) throw error
}

// Get unread message count
export const getUnreadCount = async (receiverId, senderId = null) => {
  let query = supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .eq('receiver_id', receiverId)
    .eq('is_read', false)

  if (senderId) {
    query = query.eq('sender_id', senderId)
  }

  const { count, error } = await query

  if (error) throw error
  return count
}

// Subscribe to new messages (realtime)
export const subscribeToMessages = (userId, callback) => {
  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload)
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return subscription
}

// Unsubscribe from messages
export const unsubscribeFromMessages = (subscription) => {
  supabase.removeChannel(subscription)
}

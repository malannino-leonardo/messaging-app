import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

// Format message timestamp
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  
  if (isToday(date)) {
    return format(date, 'HH:mm')
  }
  
  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'HH:mm')}`
  }
  
  return format(date, 'MMM d, HH:mm')
}

// Format relative time
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return ''
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

// Format full date
export const formatFullDate = (timestamp) => {
  if (!timestamp) return ''
  return format(new Date(timestamp), 'MMMM d, yyyy')
}

// Format chat list date
export const formatChatListDate = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  
  if (isToday(date)) {
    return format(date, 'HH:mm')
  }
  
  if (isYesterday(date)) {
    return 'Yesterday'
  }
  
  return format(date, 'MMM d')
}

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

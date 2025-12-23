// Browser notification service for messages

let permission = 'default'

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    permission = 'granted'
    return true
  }

  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission()
    permission = result
    return result === 'granted'
  }

  return false
}

// Check if notifications are supported and enabled
export const areNotificationsEnabled = () => {
  return 'Notification' in window && Notification.permission === 'granted'
}

// Show a notification
export const showNotification = (title, options = {}) => {
  if (!areNotificationsEnabled()) {
    return null
  }

  const defaultOptions = {
    icon: '/icon-192x192.png', // You can create this icon
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'message-notification',
    requireInteraction: false,
    ...options,
  }

  try {
    const notification = new Notification(title, defaultOptions)
    
    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000)
    
    return notification
  } catch (error) {
    console.error('Error showing notification:', error)
    return null
  }
}

// Show message notification
export const showMessageNotification = (sender, message, onClick) => {
  const notification = showNotification(
    sender,
    {
      body: message,
      icon: '/icon-192x192.png',
      tag: `message-${sender}`,
      data: { sender },
    }
  )

  if (notification && onClick) {
    notification.onclick = () => {
      window.focus()
      onClick()
      notification.close()
    }
  }

  return notification
}

// Clear all notifications
export const clearAllNotifications = () => {
  // Modern browsers don't provide a way to clear all notifications
  // But we can close them if we have references
  console.log('Notifications cleared')
}

// Get notification permission status
export const getNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

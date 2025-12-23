// App constants
export const APP_NAME = 'Messenger'

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  MESSAGES: '/messages',
}

// Pagination
export const PAGINATION = {
  MESSAGES_PER_PAGE: 50,
  CONTACTS_PER_PAGE: 20,
  SEARCH_RESULTS: 10,
}

// File upload limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
}

// Online status
export const ONLINE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
}

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEND_MESSAGE: 'Enter',
  NEW_LINE: 'Shift+Enter',
}

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  DRAFT_MESSAGES: 'draft_messages',
  NOTIFICATION_SETTINGS: 'notification_settings',
}

// Realtime channels
export const REALTIME_CHANNELS = {
  MESSAGES: 'messages',
  PRESENCE: 'presence',
  TYPING: 'typing',
}

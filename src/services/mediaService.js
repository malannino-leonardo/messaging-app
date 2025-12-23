import { supabase } from './supabase'
import { imageKitConfig } from './imagekit'

// Upload image to ImageKit.io via server endpoint
// Note: For security, ImageKit authentication should happen on a backend server
export const uploadImage = async (file, folder = 'chat-images') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileName', `${Date.now()}_${file.name}`)
  formData.append('folder', folder)

  // You need to create a backend endpoint for ImageKit authentication
  // This is a simplified example - in production, use a proper backend
  const response = await fetch(import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Failed to upload image')
  }

  const data = await response.json()
  return data.url
}

// Direct upload using ImageKit Upload API (requires authentication endpoint)
export const getImageKitAuthParams = async () => {
  const response = await fetch(`${import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT}/auth`)
  
  if (!response.ok) {
    throw new Error('Failed to get ImageKit authentication')
  }

  return response.json()
}

// Upload avatar image
export const uploadAvatar = async (file, userId) => {
  return uploadImage(file, `avatars/${userId}`)
}

// Upload chat image
export const uploadChatImage = async (file, chatId) => {
  return uploadImage(file, `chat-images/${chatId}`)
}

// Delete image from ImageKit
export const deleteImage = async (fileId) => {
  const response = await fetch(`${import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT}/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileId }),
  })

  if (!response.ok) {
    throw new Error('Failed to delete image')
  }

  return response.json()
}

// Validate image file
export const validateImageFile = (file, maxSizeMB = 5) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = maxSizeMB * 1024 * 1024

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.')
  }

  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`)
  }

  return true
}

// Compress image before upload (client-side)
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

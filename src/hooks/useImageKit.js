import { useState, useCallback } from 'react'
import { IKContext, IKUpload } from 'imagekitio-react'
import { imageKitConfig, getOptimizedImageUrl, getThumbnailUrl, getAvatarUrl, getChatImageUrl } from '../services/imagekit'
import { validateImageFile, compressImage } from '../services/mediaService'

export const useImageKit = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)

  // Authenticator function for ImageKit upload
  const authenticator = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT)
      if (!response.ok) {
        throw new Error('Authentication failed')
      }
      return await response.json()
    } catch (err) {
      throw new Error('Failed to authenticate with ImageKit')
    }
  }

  // Handle successful upload
  const onSuccess = useCallback((res) => {
    setUploading(false)
    setUploadProgress(0)
    return res
  }, [])

  // Handle upload error
  const onError = useCallback((err) => {
    setUploading(false)
    setUploadProgress(0)
    setError(err.message || 'Upload failed')
  }, [])

  // Handle upload progress
  const onProgress = useCallback((progress) => {
    setUploadProgress(Math.round((progress.loaded / progress.total) * 100))
  }, [])

  // Upload file
  const uploadFile = useCallback(async (file, folder = 'uploads', onSuccessCallback) => {
    setError(null)
    setUploading(true)
    
    try {
      // Validate file
      validateImageFile(file)
      
      // Compress if needed
      const processedFile = await compressImage(file)
      
      // Upload logic would go here with IKUpload component
      // This is typically done via the component, but here's the pattern
      return { file: processedFile, folder }
    } catch (err) {
      setError(err.message)
      setUploading(false)
      throw err
    }
  }, [])

  // Get optimized URL
  const getOptimizedUrl = useCallback((path, options) => {
    return getOptimizedImageUrl(path, options)
  }, [])

  // Get thumbnail
  const getThumbnail = useCallback((path, width, height) => {
    return getThumbnailUrl(path, width, height)
  }, [])

  // Get avatar
  const getAvatar = useCallback((path, size) => {
    return getAvatarUrl(path, size)
  }, [])

  // Get chat image
  const getChatImage = useCallback((path, maxWidth) => {
    return getChatImageUrl(path, maxWidth)
  }, [])

  return {
    config: imageKitConfig,
    authenticator,
    uploadFile,
    uploading,
    uploadProgress,
    error,
    onSuccess,
    onError,
    onProgress,
    getOptimizedUrl,
    getThumbnail,
    getAvatar,
    getChatImage,
    IKContext,
    IKUpload,
  }
}

export default useImageKit

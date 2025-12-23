import ImageKit from 'imagekit-javascript'

const imageKitPublicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY
const imageKitUrlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT

// ImageKit.io configuration
export const imageKitConfig = {
  publicKey: imageKitPublicKey,
  urlEndpoint: imageKitUrlEndpoint,
}

// For client-side transformations
export const imageKit = new ImageKit({
  publicKey: imageKitPublicKey,
  urlEndpoint: imageKitUrlEndpoint,
})

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (imagePath, options = {}) => {
  const defaultOptions = {
    transformation: [
      {
        quality: 'auto',
        format: 'auto',
      },
    ],
  }

  return imageKit.url({
    path: imagePath,
    ...defaultOptions,
    ...options,
  })
}

// Get thumbnail URL
export const getThumbnailUrl = (imagePath, width = 100, height = 100) => {
  return imageKit.url({
    path: imagePath,
    transformation: [
      {
        width: width.toString(),
        height: height.toString(),
        crop: 'at_max',
        quality: 'auto',
        format: 'auto',
      },
    ],
  })
}

// Get avatar URL with circular crop
export const getAvatarUrl = (imagePath, size = 80) => {
  return imageKit.url({
    path: imagePath,
    transformation: [
      {
        width: size.toString(),
        height: size.toString(),
        crop: 'maintain_ratio',
        focus: 'face',
        quality: 'auto',
        format: 'auto',
      },
    ],
  })
}

// Get chat image URL (medium size for chat)
export const getChatImageUrl = (imagePath, maxWidth = 400) => {
  return imageKit.url({
    path: imagePath,
    transformation: [
      {
        width: maxWidth.toString(),
        crop: 'at_max',
        quality: 'auto',
        format: 'auto',
      },
    ],
  })
}

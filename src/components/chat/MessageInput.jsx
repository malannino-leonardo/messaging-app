import { useState, useRef } from 'react'
import { useMessages } from '../../hooks/useMessages'
import { useImageKit } from '../../hooks/useImageKit'
import toast from 'react-hot-toast'
import { Paperclip, Smile, Send, X, Loader2 } from 'lucide-react'

const MessageInput = () => {
  const { send, sending } = useMessages()
  const { uploadFile, uploading, uploadProgress } = useImageKit()
  const [message, setMessage] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!message.trim() && !imageFile) return

    try {
      let imageUrl = null
      
      // Upload image if selected
      if (imageFile) {
        // In a real app, you'd upload to ImageKit here
        // imageUrl = await uploadFile(imageFile, 'chat-images')
        toast.error('Image upload requires backend setup')
      }

      await send(message.trim(), imageUrl)
      setMessage('')
      setImagePreview(null)
      setImageFile(null)
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
      {/* Image preview */}
      {imagePreview && (
        <div className="relative inline-block mb-2">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="h-20 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">{uploadProgress}%</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <Paperclip className="w-6 h-6" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-2 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-32"
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* Emoji button */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={(!message.trim() && !imageFile) || sending || uploading}
          className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Send className="w-6 h-6" />
          )}
        </button>
      </div>
    </form>
  )
}

export default MessageInput

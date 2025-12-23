import { useState, useRef } from 'react'
import { IKContext, IKUpload } from 'imagekitio-react'
import { useImageKit } from '../../hooks/useImageKit'
import { validateImageFile, compressImage } from '../../services/mediaService'
import toast from 'react-hot-toast'
import { X, Upload, Loader2 } from 'lucide-react'

const ImageUploader = ({ onUploadSuccess, folder = 'uploads', className = '' }) => {
  const { config, authenticator, uploading, uploadProgress, onError } = useImageKit()
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  const handleUploadStart = (evt) => {
    console.log('Upload started:', evt)
  }

  const handleUploadSuccess = (res) => {
    console.log('Upload success:', res)
    setPreview(null)
    toast.success('Image uploaded successfully!')
    if (onUploadSuccess) {
      onUploadSuccess(res.url, res.fileId)
    }
  }

  const handleUploadError = (err) => {
    console.error('Upload error:', err)
    toast.error('Failed to upload image')
    onError(err)
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      validateImageFile(file)
      
      // Show preview
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error(error.message)
      e.target.value = ''
    }
  }

  return (
    <IKContext
      publicKey={config.publicKey}
      urlEndpoint={config.urlEndpoint}
      authenticator={authenticator}
    >
      <div className={className}>
        {preview && (
          <div className="relative mb-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full max-h-48 object-contain rounded-lg"
            />
            <button
              onClick={() => {
                setPreview(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
            
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="w-16 h-16 animate-spin mx-auto mb-2" />
                  <p>{uploadProgress}%</p>
                </div>
              </div>
            )}
          </div>
        )}

        <IKUpload
          ref={inputRef}
          fileName="image"
          folder={folder}
          onUploadStart={handleUploadStart}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors disabled:opacity-50"
        >
          <Upload className="w-6 h-6" />
          <span>Upload Image</span>
        </button>
      </div>
    </IKContext>
  )
}

export default ImageUploader

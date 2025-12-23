import { useState } from 'react'
import Modal from '../ui/Modal'
import { ZoomIn, ZoomOut, Minus, Plus, X } from 'lucide-react'

const ImageViewer = ({ isOpen, onClose, imageUrl, alt = 'Image' }) => {
  const [scale, setScale] = useState(1)

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))
  const handleReset = () => setScale(1)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" showCloseButton={false}>
      <div className="relative bg-black">
        {/* Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center min-h-[60vh] overflow-auto p-4">
          <img
            src={imageUrl}
            alt={alt}
            style={{ transform: `scale(${scale})` }}
            className="max-w-full max-h-[80vh] object-contain transition-transform duration-200"
          />
        </div>
      </div>
    </Modal>
  )
}

export default ImageViewer

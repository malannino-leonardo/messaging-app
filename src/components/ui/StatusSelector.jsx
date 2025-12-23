import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { updateUserStatus } from '../../services/userService'
import { Circle, Moon, MinusCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: 'online', label: 'Online', icon: Circle, color: 'text-green-500', bgColor: 'bg-green-500' },
  { value: 'inactive', label: 'Inactive', icon: Moon, color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
  { value: 'dnd', label: 'Do Not Disturb', icon: MinusCircle, color: 'text-red-500', bgColor: 'bg-red-500' },
  { value: 'offline', label: 'Offline', icon: XCircle, color: 'text-gray-500', bgColor: 'bg-gray-500' },
]

const StatusSelector = () => {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const currentStatus = userProfile?.status || 'online'
  const currentStatusOption = STATUS_OPTIONS.find(s => s.value === currentStatus) || STATUS_OPTIONS[0]

  const handleStatusChange = async (status) => {
    if (!user) return
    
    setLoading(true)
    try {
      await updateUserStatus(user.id, status)
      await refreshUserProfile()
      toast.success(`Status changed to ${STATUS_OPTIONS.find(s => s.value === status)?.label}`)
      setIsOpen(false)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const StatusIcon = currentStatusOption.icon

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        title={currentStatusOption.label}
      >
        <StatusIcon className={`w-4 h-4 ${currentStatusOption.color}`} />
        <span className="text-sm text-gray-700 dark:text-gray-300">{currentStatusOption.label}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-20">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Set your status
            </div>
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon
              const isActive = option.value === currentStatus
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={loading}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                    ${isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <Icon className={`w-4 h-4 ${option.color}`} />
                  <span className="text-sm">{option.label}</span>
                  {isActive && (
                    <span className="ml-auto">
                      <Circle className="w-2 h-2 fill-current" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default StatusSelector

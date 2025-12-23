import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { updateUserProfile, updateAvatar } from '../../services/userService'
import Avatar from '../ui/Avatar'
import Input from '../ui/Input'
import Button from '../ui/Button'
import ImageUploader from '../media/ImageUploader'
import Loader from '../ui/Loader'
import toast from 'react-hot-toast'

const UserProfile = () => {
  const { userProfile, refreshUserProfile, loading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: userProfile?.username || '',
  })
  const [loading, setLoading] = useState(false)

  // Update form when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username || '',
      })
    }
  }, [userProfile])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateUserProfile(userProfile.id, formData)
      await refreshUserProfile()
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (url) => {
    try {
      await updateAvatar(userProfile.id, url)
      await refreshUserProfile()
      toast.success('Avatar updated successfully')
    } catch (error) {
      toast.error('Failed to update avatar')
    }
  }

  if (authLoading || !userProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <Avatar 
            src={userProfile.avatar_url} 
            alt={userProfile.username} 
            size="xl"
          />
          <div className="mt-4">
            <ImageUploader 
              onUploadSuccess={handleAvatarUpload}
              folder={`avatars/${userProfile.id}`}
            />
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <div className="flex gap-2">
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Username</label>
              <p className="font-medium">{userProfile.username}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{userProfile.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Member since</label>
              <p className="font-medium">
                {new Date(userProfile.created_at).toLocaleDateString()}
              </p>
            </div>

            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile

import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { updatePassword } from '../../services/authService'
import Input from '../ui/Input'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const Settings = () => {
  const { userProfile } = useAuth()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      await updatePassword(passwordData.newPassword)
      toast.success('Password updated successfully')
      setShowPasswordForm(false)
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-6">
        {/* Account section */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Account</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{userProfile?.email}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Account verified</label>
              <p className="font-medium">
                {userProfile?.is_verified ? (
                  <span className="text-green-500">Verified</span>
                ) : (
                  <span className="text-yellow-500">Not verified</span>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Security section */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Security</h3>

          {showPasswordForm ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={errors.newPassword}
                placeholder="••••••••"
              />
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
              />
              
              <div className="flex gap-2">
                <Button type="submit" loading={loading}>
                  Update Password
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setShowPasswordForm(true)}>
              Change Password
            </Button>
          )}
        </section>

        {/* Notifications section */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>Push notifications</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span>Email notifications</span>
              <input type="checkbox" className="toggle" />
            </label>
            <label className="flex items-center justify-between">
              <span>Sound</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
          </div>
        </section>

        {/* Danger zone */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
          <h3 className="text-lg font-semibold mb-4 text-red-500">Danger Zone</h3>
          
          <p className="text-sm text-gray-500 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          
          <Button variant="danger">
            Delete Account
          </Button>
        </section>
      </div>
    </div>
  )
}

export default Settings

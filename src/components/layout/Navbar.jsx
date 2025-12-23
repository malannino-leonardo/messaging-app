import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../services/authService'
import Avatar from '../ui/Avatar'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { userProfile } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <nav className="bg-white border-b px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary-600">
          Messenger
        </Link>

        <div className="flex items-center gap-4">
          <Link 
            to="/profile" 
            className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg"
          >
            <Avatar 
              src={userProfile?.avatar_url} 
              alt={userProfile?.username || 'User'} 
              size="sm"
            />
            <span className="font-medium">{userProfile?.username}</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-red-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

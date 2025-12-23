import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { signOut } from '../../services/authService'
import Avatar from '../ui/Avatar'
import StatusSelector from '../ui/StatusSelector'
import ContactSearch from '../contacts/ContactSearch'
import ChatList from '../chat/ChatList'
import toast from 'react-hot-toast'
import { MessageCircle, User, Users, Settings, Moon, Sun } from 'lucide-react'

const Sidebar = () => {
  const { userProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const navItems = [
    { path: '/chat', icon: 'chat', label: 'Messages' },
    { path: '/friends', icon: 'friends', label: 'Friends' },
    { path: '/profile', icon: 'profile', label: 'Profile' },
    { path: '/settings', icon: 'settings', label: 'Settings' },
  ]

  const getIcon = (icon) => {
    switch (icon) {
      case 'chat':
        return <MessageCircle className="w-6 h-6" />
      case 'friends':
        return <Users className="w-6 h-6" />
      case 'profile':
        return <User className="w-6 h-6" />
      case 'settings':
        return <Settings className="w-6 h-6" />
      default:
        return null
    }
  }

  return (
    <aside className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Messenger</h1>
          
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Avatar 
                  src={userProfile?.avatar_url} 
                  alt={userProfile?.username || 'User'} 
                  size="sm"
                />
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-20"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{userProfile?.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{userProfile?.email}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    Settings
                  </Link>
                  <div className="px-4 py-2 border-t dark:border-gray-700 mt-1 pt-2">
                    <StatusSelector />
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <ContactSearch />
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        <ChatList />
      </div>

      {/* Bottom nav */}
      <nav className="border-t dark:border-gray-700 p-2">
        <div className="flex justify-around">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg transition-colors
                ${location.pathname.startsWith(item.path) 
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {getIcon(item.icon)}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar

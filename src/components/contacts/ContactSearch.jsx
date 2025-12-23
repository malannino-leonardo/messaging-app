import { useState, useEffect } from 'react'
import { useContacts } from '../../hooks/useContacts'
import { useChat } from '../../hooks/useChat'
import Avatar from '../ui/Avatar'
import Input from '../ui/Input'
import Loader from '../ui/Loader'

const ContactSearch = ({ onSelect }) => {
  const { search, searchResults, loading, clearSearch } = useContacts()
  const { selectContact } = useChat()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim()) {
        search(query)
      } else {
        clearSearch()
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, search, clearSearch])

  const handleSelect = (user) => {
    selectContact(user.id)
    if (onSelect) onSelect(user)
    setQuery('')
    clearSearch()
  }

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-10"
      />
      
      {/* Search icon */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        {loading ? (
          <Loader size="sm" />
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>

      {/* Search results dropdown */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
          {searchResults.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
            >
              <Avatar 
                src={user.avatar_url} 
                alt={user.username} 
                size="sm"
                online={user.is_online}
              />
              <div className="text-left">
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {query && !loading && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 p-4 text-center text-gray-500">
          No users found
        </div>
      )}
    </div>
  )
}

export default ContactSearch

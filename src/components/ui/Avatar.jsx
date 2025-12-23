const Avatar = ({ 
  src, 
  alt = 'User', 
  size = 'md', 
  online = false,
  className = '' 
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  }

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  }

  // Get initials from alt text
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizes[size]} rounded-full object-cover bg-gray-200`}
        />
      ) : (
        <div 
          className={`${sizes[size]} rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium`}
        >
          {getInitials(alt)}
        </div>
      )}
      
      {online !== undefined && (
        <span 
          className={`
            absolute bottom-0 right-0 
            ${statusSizes[size]} 
            rounded-full border-2 border-white
            ${online ? 'bg-green-500' : 'bg-gray-400'}
          `}
        />
      )}
    </div>
  )
}

export default Avatar

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Username validation (3-30 characters, alphanumeric and underscores)
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  return usernameRegex.test(username)
}

// Password validation (minimum 6 characters)
export const isValidPassword = (password) => {
  return password && password.length >= 6
}

// Strong password validation
export const isStrongPassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return strongRegex.test(password)
}

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {}

  Object.keys(rules).forEach((field) => {
    const value = data[field]
    const fieldRules = rules[field]

    // Required check
    if (fieldRules.required && (!value || value.trim() === '')) {
      errors[field] = fieldRules.message || `${field} is required`
      return
    }

    // Min length check
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] = `${field} must be at least ${fieldRules.minLength} characters`
      return
    }

    // Max length check
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors[field] = `${field} must be less than ${fieldRules.maxLength} characters`
      return
    }

    // Email check
    if (fieldRules.email && value && !isValidEmail(value)) {
      errors[field] = 'Please enter a valid email address'
      return
    }

    // Match field check (for password confirmation)
    if (fieldRules.match && value !== data[fieldRules.match]) {
      errors[field] = fieldRules.matchMessage || 'Fields do not match'
      return
    }

    // Custom validation
    if (fieldRules.custom && !fieldRules.custom(value, data)) {
      errors[field] = fieldRules.customMessage || 'Invalid value'
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

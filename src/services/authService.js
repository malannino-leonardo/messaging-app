import { supabase } from './supabase'

// Sign up with email and password
export const signUp = async (email, password, username) => {
  // First, sign up with Supabase Auth
  // Using options to skip email confirmation for development
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // For development, you can disable email confirmation in Supabase Dashboard
      // Auth > Providers > Email > Disable "Confirm email"
      data: {
        username: username,
      },
    },
  })

  if (authError) {
    // Handle email sending error gracefully
    if (authError.message.includes('sending confirmation email')) {
      console.warn('Email confirmation disabled or not configured. User created without email verification.')
      // Continue if user was actually created
      if (!authData?.user) throw authError
    } else {
      throw authError
    }
  }

  // Then create user profile in users table
  if (authData?.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      username,
      email,
      is_verified: false,
    })

    if (profileError) {
      // If profile creation fails due to duplicate, user might already exist
      if (!profileError.message.includes('duplicate')) {
        throw profileError
      }
    }
  }

  return authData
}

// Sign in with email or username and password
export const signIn = async (emailOrUsername, password) => {
  let email = emailOrUsername

  // Check if input is a username (doesn't contain @)
  if (!emailOrUsername.includes('@')) {
    // Query the users table to get the email for this username
    // Use public access since user is not authenticated yet
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('username', emailOrUsername)
      .maybeSingle()

    if (userError) {
      console.error('Error fetching user by username:', userError)
      throw new Error('Failed to look up username. Please try again.')
    }

    if (!userData) {
      throw new Error('Username not found')
    }

    email = userData.email
  }

  // Now sign in with email
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Provide clearer error messages
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid username or password')
    }
    throw error
  }

  // Update user online status
  if (data.user) {
    await supabase
      .from('users')
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq('id', data.user.id)
  }

  return data
}

// Sign out
export const signOut = async () => {
  // Update user online status before signing out
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    await supabase
      .from('users')
      .update({ is_online: false, last_seen: new Date().toISOString() })
      .eq('id', user.id)
  }

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Request password reset
export const requestPasswordReset = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
  return data
}

// Update password
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data
}

// Resend verification email
export const resendVerificationEmail = async (email) => {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) throw error
  return data
}

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

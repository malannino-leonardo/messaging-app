import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { resendVerificationEmail } from '../services/authService'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const VerifyEmailPage = () => {
  const location = useLocation()
  const email = location.state?.email
  const [resending, setResending] = useState(false)

  const handleResend = async () => {
    if (!email) {
      toast.error('No email address available')
      return
    }

    setResending(true)
    
    try {
      await resendVerificationEmail(email)
      toast.success('Verification email sent!')
    } catch (error) {
      toast.error(error.message || 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-primary-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
          <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a verification link to{' '}
            {email ? <strong>{email}</strong> : 'your email address'}.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Click the link in the email to verify your account.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleResend}
            loading={resending}
            variant="secondary"
            className="w-full"
          >
            Resend verification email
          </Button>

          <Link 
            to="/login" 
            className="block text-primary-600 hover:text-primary-500 font-medium"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage

// Toast is handled by react-hot-toast, but here's a custom wrapper if needed
import { toast as hotToast } from 'react-hot-toast'

export const toast = {
  success: (message) => hotToast.success(message),
  error: (message) => hotToast.error(message),
  loading: (message) => hotToast.loading(message),
  dismiss: (id) => hotToast.dismiss(id),
  custom: (message, options) => hotToast(message, options),
}

export default toast

import { toast } from '@/hooks/use-toast'

export const toastUtils = {
  success: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: 'success',
    })
  },

  error: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: 'destructive',
    })
  },

  warning: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: 'warning',
    })
  },

  info: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: 'info',
    })
  },

  default: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: 'default',
    })
  },
}

// Common toast messages for admin operations
export const adminToasts = {
  // Success messages
  created: (item: string) => toastUtils.success(`${item} created successfully`),
  updated: (item: string) => toastUtils.success(`${item} updated successfully`),
  deleted: (item: string) => toastUtils.success(`${item} deleted successfully`),
  saved: (item: string) => toastUtils.success(`${item} saved successfully`),
  
  // Error messages
  createError: (item: string, error?: string) => toastUtils.error(`Failed to create ${item}`, error),
  updateError: (item: string, error?: string) => toastUtils.error(`Failed to update ${item}`, error),
  deleteError: (item: string, error?: string) => toastUtils.error(`Failed to delete ${item}`, error),
  saveError: (item: string, error?: string) => toastUtils.error(`Failed to save ${item}`, error),
  fetchError: (item: string, error?: string) => toastUtils.error(`Failed to fetch ${item}`, error),
  
  // Info messages
  loading: (item: string) => toastUtils.info(`Loading ${item}...`),
  processing: (action: string) => toastUtils.info(`Processing ${action}...`),
  
  // Warning messages
  confirmDelete: (item: string) => toastUtils.warning(`Are you sure you want to delete this ${item}?`),
  unsavedChanges: () => toastUtils.warning('You have unsaved changes'),
}

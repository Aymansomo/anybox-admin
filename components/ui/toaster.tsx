'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-600" />,
  destructive: <AlertCircle className="h-5 w-5 text-red-600" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  info: <Info className="h-5 w-5 text-blue-600" />,
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant = 'default', ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1 flex-1">
              <div className="flex items-center gap-2">
                {variant !== 'default' && icons[variant as keyof typeof icons]}
                {title && <ToastTitle>{title}</ToastTitle>}
              </div>
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

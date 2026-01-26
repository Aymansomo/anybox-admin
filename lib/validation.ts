import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format').max(254, 'Email too long')

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const staffLoginSchema = loginSchema

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description too long').optional(),
  image: z.string().url('Invalid image URL').optional()
})

export const categoryUpdateSchema = categorySchema.partial()

// Product schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(2000, 'Description too long').optional(),
  price: z.number().min(0, 'Price must be positive').max(999999.99, 'Price too high'),
  category_id: z.number().int().positive('Category ID must be a positive integer'),
  stock: z.number().int().min(0, 'Stock must be non-negative').max(999999, 'Stock too high'),
  is_active: z.boolean().default(true)
})

export const productUpdateSchema = productSchema.partial()

// Staff schemas
export const staffCreateSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  full_name: nameSchema,
  password: passwordSchema,
  role: z.enum(['staff', 'manager'], { required_error: 'Role is required' })
})

export const staffUpdateSchema = z.object({
  username: usernameSchema.optional(),
  email: emailSchema.optional(),
  full_name: nameSchema.optional(),
  role: z.enum(['staff', 'manager']).optional(),
  is_active: z.boolean().optional()
})

// Order schemas
export const orderUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    required_error: 'Status is required'
  }),
  staff_id: z.number().int().positive().optional()
})

// File upload schemas
export const fileUploadSchema = z.object({
  bucket: z.string().min(1, 'Bucket name is required').max(50, 'Bucket name too long'),
  folder: z.string().max(100, 'Folder path too long').optional(),
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    'File size must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
    'Only JPEG, PNG, GIF, and WebP images are allowed'
  )
})

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10)
})

// Validation helper function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - consider using a library like DOMPurify for production
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

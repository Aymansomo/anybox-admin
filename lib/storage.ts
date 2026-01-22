import { supabase } from './supabase'

export interface FileUploadResponse {
  path: string
  fullPath: string
  error?: string
}

export interface FileMetadata {
  id: number
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  bucket_id: string
  owner_id: string
  owner_type: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export class StorageService {
  // Upload file to Supabase Storage
  static async uploadFile(
    file: File,
    bucket: string = 'uploads',
    owner_id: string,
    owner_type: string = 'user',
    isPublic: boolean = false
  ): Promise<FileUploadResponse> {
    try {
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${bucket}/${fileName}`

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        return { path: '', fullPath: '', error: error.message }
      }

      // Get public URL if needed
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      // Store file metadata in database
      const { error: metadataError } = await supabase
        .from('file_metadata')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          bucket_id: bucket,
          owner_id,
          owner_type,
          is_public: isPublic
        })
        .select()
        .single()

      if (metadataError) {
        console.error('Metadata error:', metadataError)
        return { path: '', fullPath: '', error: metadataError.message }
      }

      return {
        path: filePath,
        fullPath: publicUrl || '',
        error: undefined
      }
    } catch (error) {
      console.error('Upload service error:', error)
      return {
        path: '',
        fullPath: '',
        error: error instanceof Error ? error.message : 'Unknown upload error'
      }
    }
  }

  // Get public URL for a file
  static async getPublicUrl(filePath: string, bucket: string = 'uploads'): Promise<string | null> {
    try {
      const { data } = await supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return data?.publicUrl || null
    } catch (error) {
      console.error('Error getting public URL:', error)
      return null
    }
  }

  // Delete file from storage
  static async deleteFile(filePath: string, bucket: string = 'uploads'): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) {
        console.error('Delete error:', error)
        return { error: error.message }
      }

      // Delete metadata from database
      const { error: metadataError } = await supabase
        .from('file_metadata')
        .delete()
        .eq('file_path', filePath)

      if (metadataError) {
        console.error('Metadata deletion error:', metadataError)
        return { error: metadataError.message }
      }

      return { error: undefined }
    } catch (error) {
      console.error('Delete service error:', error)
      return { error: error instanceof Error ? error.message : 'Unknown delete error' }
    }
  }

  // List files for a specific owner
  static async listFiles(
    ownerId: string,
    ownerType: string = 'user',
    bucket: string = 'uploads'
  ): Promise<FileMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('file_metadata')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('owner_type', ownerType)
        .eq('bucket_id', bucket)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('List files error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('List files service error:', error)
      return []
    }
  }

  // Update file visibility
  static async updateFileVisibility(
    filePath: string,
    isPublic: boolean,
    bucket: string = 'uploads'
  ): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('file_metadata')
        .update({ is_public: isPublic })
        .eq('file_path', filePath)
        .eq('bucket_id', bucket)

      if (error) {
        console.error('Update visibility error:', error)
        return { error: error.message }
      }

      return { error: undefined }
    } catch (error) {
      console.error('Update visibility service error:', error)
      return { error: error instanceof Error ? error.message : 'Unknown update error' }
    }
  }
}

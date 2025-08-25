import { supabase } from './supabase'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

// Storage bucket name
const STORAGE_BUCKET = 'documents'

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

// Supported file types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
]

export interface UploadResult {
  path: string
  url: string
  size: number
  mimeType: string
}

export interface FileInfo {
  name: string
  size: number
  mimeType: string
  uri: string
}

/**
 * Convert a file URI to a Blob for upload
 */
export const uriToBlob = async (uri: string): Promise<Blob> => {
  try {
    // Handle content:// URIs on Android
    if (Platform.OS === 'android' && uri.startsWith('content://')) {
      const response = await fetch(uri)
      return await response.blob()
    }

    // For file:// URIs, read the file
    const response = await fetch(uri)
    return await response.blob()
  } catch (error) {
    console.error('Error converting URI to blob:', error)
    throw new Error('Failed to process file')
  }
}

/**
 * Get file information from URI
 */
export const getFileInfo = async (uri: string): Promise<FileInfo> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri)
    
    if (!fileInfo.exists) {
      throw new Error('File does not exist')
    }

    // Get file extension and determine MIME type
    const extension = uri.split('.').pop()?.toLowerCase()
    const mimeType = getMimeType(extension || '')

    return {
      name: uri.split('/').pop() || 'unknown',
      size: fileInfo.size || 0,
      mimeType,
      uri
    }
  } catch (error) {
    console.error('Error getting file info:', error)
    throw new Error('Failed to get file information')
  }
}

/**
 * Get MIME type from file extension
 */
export const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
    'csv': 'text/csv'
  }

  return mimeTypes[extension] || 'application/octet-stream'
}

/**
 * Validate file for upload
 */
export const validateFile = (fileInfo: FileInfo): void => {
  // Check file size
  if (fileInfo.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Check if file type is supported
  const isImage = SUPPORTED_IMAGE_TYPES.includes(fileInfo.mimeType)
  const isDocument = SUPPORTED_DOCUMENT_TYPES.includes(fileInfo.mimeType)

  if (!isImage && !isDocument) {
    throw new Error('File type not supported')
  }

  // Additional size check for images
  if (isImage && fileInfo.size > MAX_IMAGE_SIZE) {
    throw new Error(`Image size exceeds maximum limit of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`)
  }
}

/**
 * Generate unique filename
 */
export const generateFilename = (originalName: string, orgId: string, clientId: string): string => {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  const baseName = originalName.replace(/\.[^/.]+$/, '') // Remove extension
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_')
  
  return `${orgId}/${clientId}/${sanitizedName}_${timestamp}.${extension}`
}

/**
 * Upload document file
 */
export const uploadDocument = async (
  uri: string,
  orgId: string,
  clientId: string,
  // jobId?: string
): Promise<UploadResult> => {
  try {
    // Get file information
    const fileInfo = await getFileInfo(uri)
    
    // Validate file
    validateFile(fileInfo)

    // Generate unique filename
    const filename = generateFilename(fileInfo.name, orgId, clientId)
    const path = `${orgId}/${clientId}/${filename}`

    // Convert URI to Blob
    const blob = await uriToBlob(uri)

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, blob, {
        contentType: fileInfo.mimeType,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw new Error('Failed to upload file')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path)

    return {
      path,
      url: urlData.publicUrl,
      size: fileInfo.size,
      mimeType: fileInfo.mimeType
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

/**
 * Upload organization logo
 */
export const uploadLogo = async (uri: string, orgId: string): Promise<UploadResult> => {
  try {
    // Get file information
    const fileInfo = await getFileInfo(uri)
    
    // Validate file (must be image)
    if (!SUPPORTED_IMAGE_TYPES.includes(fileInfo.mimeType)) {
      throw new Error('Logo must be an image file')
    }

    if (fileInfo.size > MAX_IMAGE_SIZE) {
      throw new Error(`Image size exceeds maximum limit of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`)
    }

    // Generate filename for logo
    const extension = fileInfo.name.split('.').pop()
    const filename = `logo_${Date.now()}.${extension}`
    const path = `${orgId}/logos/${filename}`

    // Convert URI to Blob
    const blob = await uriToBlob(uri)

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, blob, {
        contentType: fileInfo.mimeType,
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Logo upload error:', error)
      throw new Error('Failed to upload logo')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path)

    return {
      path,
      url: urlData.publicUrl,
      size: fileInfo.size,
      mimeType: fileInfo.mimeType
    }
  } catch (error) {
    console.error('Logo upload error:', error)
    throw error
  }
}

/**
 * Get signed URL for file access
 */
export const getSignedUrl = async (path: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      throw new Error('Failed to generate signed URL')
    }

    return data.signedUrl
  } catch (error) {
    console.error('Signed URL error:', error)
    throw error
  }
}

/**
 * Get public URL for file
 */
export const getPublicUrl = (path: string): string => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Delete file from storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path])

    if (error) {
      console.error('File deletion error:', error)
      throw new Error('Failed to delete file')
    }
  } catch (error) {
    console.error('File deletion error:', error)
    throw error
  }
}

/**
 * Delete document from storage (alias for deleteFile)
 */
export const deleteDocument = async (path: string): Promise<void> => {
  return deleteFile(path)
}

/**
 * List files in a directory
 */
export const listFiles = async (path: string): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(path)

    if (error) {
      console.error('List files error:', error)
      throw new Error('Failed to list files')
    }

    return (data as unknown as Record<string, unknown>[]) || []
  } catch (error) {
    console.error('List files error:', error)
    throw error
  }
}

/**
 * Download file to local storage
 */
export const downloadFile = async (path: string, localPath: string): Promise<void> => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(path)

    if (error) {
      console.error('Download error:', error)
      throw new Error('Failed to download file')
    }

    // Convert blob to base64 and write to file
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      const base64Data = base64.split(',')[1]
      
      await FileSystem.writeAsStringAsync(localPath, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      })
    }
    reader.readAsDataURL(data)
  } catch (error) {
    console.error('Download error:', error)
    throw error
  }
}

/**
 * Clean up orphaned files
 */
export const cleanupOrphanedFiles = async (): Promise<void> => {
  try {
    // This would typically be called from the serverless function
    // For client-side, we can only clean up local files
    console.log('Cleanup should be performed server-side')
  } catch (error) {
    console.error('Cleanup error:', error)
    throw error
  }
}

/**
 * Get file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Check if file is an image
 */
export const isImage = (mimeType: string): boolean => {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType)
}

/**
 * Check if file is a document
 */
export const isDocument = (mimeType: string): boolean => {
  return SUPPORTED_DOCUMENT_TYPES.includes(mimeType)
}

/**
 * Get file icon based on MIME type
 */
export const getFileIcon = (mimeType: string): string => {
  if (isImage(mimeType)) return '📷'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
  if (mimeType === 'text/csv') return '📋'
  if (mimeType === 'text/plain') return '��'
  return '📎'
}

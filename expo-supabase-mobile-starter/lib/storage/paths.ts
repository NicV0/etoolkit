/**
 * Storage path utilities for organizing files in Supabase Storage
 */

// Storage bucket name
export const STORAGE_BUCKET = 'documents'

/**
 * Get document path for client files
 */
export const getDocumentPath = (orgId: string, clientId: string, filename: string): string => {
  return `${orgId}/clients/${clientId}/documents/${filename}`
}

/**
 * Get job document path
 */
export const getJobDocumentPath = (orgId: string, clientId: string, jobId: string, filename: string): string => {
  return `${orgId}/clients/${clientId}/jobs/${jobId}/documents/${filename}`
}

/**
 * Get logo path for organization
 */
export const getLogoPath = (orgId: string, filename?: string): string => {
  const logoFilename = filename || `logo_${Date.now()}.png`
  return `${orgId}/logos/${logoFilename}`
}

/**
 * Get PDF path for quotes/invoices
 */
export const getPDFPath = (orgId: string, type: 'quote' | 'invoice', id: string): string => {
  return `${orgId}/pdfs/${type}s/${id}.pdf`
}

/**
 * Get temporary upload path
 */
export const getTempPath = (orgId: string, filename: string): string => {
  return `${orgId}/temp/${Date.now()}_${filename}`
}

/**
 * Get backup path for files
 */
export const getBackupPath = (orgId: string, originalPath: string): string => {
  const timestamp = new Date().toISOString().split('T')[0]
  return `${orgId}/backups/${timestamp}/${originalPath}`
}

/**
 * Extract organization ID from path
 */
export const extractOrgIdFromPath = (path: string): string | null => {
  const parts = path.split('/')
  return parts[0] || null
}

/**
 * Extract client ID from path
 */
export const extractClientIdFromPath = (path: string): string | null => {
  const parts = path.split('/')
  if (parts.length >= 3 && parts[1] === 'clients') {
    return parts[2]
  }
  return null
}

/**
 * Extract job ID from path
 */
export const extractJobIdFromPath = (path: string): string | null => {
  const parts = path.split('/')
  if (parts.length >= 5 && parts[1] === 'clients' && parts[3] === 'jobs') {
    return parts[4]
  }
  return null
}

/**
 * Extract file type from path
 */
export const extractFileTypeFromPath = (path: string): string | null => {
  const parts = path.split('/')
  const filename = parts[parts.length - 1]
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension || null
}

/**
 * Check if path is a logo
 */
export const isLogoPath = (path: string): boolean => {
  return path.includes('/logos/')
}

/**
 * Check if path is a PDF
 */
export const isPDFPath = (path: string): boolean => {
  return path.includes('/pdfs/') && path.endsWith('.pdf')
}

/**
 * Check if path is a temporary file
 */
export const isTempPath = (path: string): boolean => {
  return path.includes('/temp/')
}

/**
 * Check if path is a backup
 */
export const isBackupPath = (path: string): boolean => {
  return path.includes('/backups/')
}

/**
 * Get relative path from full path
 */
export const getRelativePath = (fullPath: string): string => {
  const parts = fullPath.split('/')
  // Remove bucket name if present
  if (parts[0] === STORAGE_BUCKET) {
    parts.shift()
  }
  return parts.join('/')
}

/**
 * Get full path with bucket
 */
export const getFullPath = (relativePath: string): string => {
  return `${STORAGE_BUCKET}/${relativePath}`
}

/**
 * Sanitize filename for storage
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid characters with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase()
}

/**
 * Generate unique filename with timestamp
 */
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  const baseName = originalName.replace(/\.[^/.]+$/, '')
  const sanitizedName = sanitizeFilename(baseName)
  
  return `${sanitizedName}_${timestamp}.${extension}`
}

/**
 * Get file category from path
 */
export const getFileCategory = (path: string): string => {
  if (isLogoPath(path)) return 'logo'
  if (isPDFPath(path)) return 'pdf'
  if (isTempPath(path)) return 'temp'
  if (isBackupPath(path)) return 'backup'
  if (path.includes('/documents/')) return 'document'
  return 'other'
}

/**
 * Get organization storage usage path
 */
export const getOrgStoragePath = (orgId: string): string => {
  return `${orgId}/`
}

/**
 * Get client storage path
 */
export const getClientStoragePath = (orgId: string, clientId: string): string => {
  return `${orgId}/clients/${clientId}/`
}

/**
 * Get job storage path
 */
export const getJobStoragePath = (orgId: string, clientId: string, jobId: string): string => {
  return `${orgId}/clients/${clientId}/jobs/${jobId}/`
}

/**
 * Validate storage path format
 */
export const validateStoragePath = (path: string): boolean => {
  // Check for valid characters
  const validPathRegex = /^[a-zA-Z0-9\-_\/.]+$/
  if (!validPathRegex.test(path)) {
    return false
  }

  // Check for double slashes
  if (path.includes('//')) {
    return false
  }

  // Check for leading/trailing slashes
  if (path.startsWith('/') || path.endsWith('/')) {
    return false
  }

  return true
}

/**
 * Get path depth
 */
export const getPathDepth = (path: string): number => {
  return path.split('/').length
}

/**
 * Get parent path
 */
export const getParentPath = (path: string): string | null => {
  const parts = path.split('/')
  if (parts.length <= 1) {
    return null
  }
  return parts.slice(0, -1).join('/')
}

/**
 * Get filename from path
 */
export const getFilenameFromPath = (path: string): string => {
  const parts = path.split('/')
  return parts[parts.length - 1] || ''
}

/**
 * Get directory from path
 */
export const getDirectoryFromPath = (path: string): string => {
  const parts = path.split('/')
  return parts.slice(0, -1).join('/')
}

/**
 * Check if path is within organization
 */
export const isPathInOrganization = (path: string, orgId: string): boolean => {
  return path.startsWith(`${orgId}/`)
}

/**
 * Get storage quota path for organization
 */
export const getStorageQuotaPath = (orgId: string): string => {
  return `${orgId}/quota.json`
}

/**
 * Get storage analytics path for organization
 */
export const getStorageAnalyticsPath = (orgId: string): string => {
  return `${orgId}/analytics/`
}

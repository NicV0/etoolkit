import { supabase } from '../supabase'
import { logActivity } from '../db/mutations'
import { uploadDocument, getSignedUrl, deleteDocument } from '../storage'
import { z } from 'zod'
import * as FileSystem from 'expo-file-system'

export interface DocumentFilters {
  client_id?: string
  job_id?: string
  mime_type?: string
  limit?: number
  offset?: number
}

export interface DocumentWithUrl {
  id: string
  org_id: string
  client_id: string
  job_id?: string
  title: string
  path: string
  mime: string
  size: number
  uploaded_by: string
  created_at: string
  updated_at: string
  signed_url?: string
}

export interface UploadResult {
  document: DocumentWithUrl
  success: boolean
  error?: string
}

// Document validation schema
const documentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  client_id: z.string().uuid('Invalid client ID'),
  job_id: z.string().uuid('Invalid job ID').optional(),
  mime: z.string().min(1, 'MIME type is required'),
  size: z.number().positive('Size must be positive')
})

export const documentAPI = {
  // Upload document from URI
  upload: async (
    uri: string, 
    orgId: string, 
    clientId: string, 
    metadata: {
      title: string
      jobId?: string
      mime?: string
    }
  ): Promise<UploadResult> => {
    try {
      // Get file info
      const fileName = uri.split('/').pop() || 'document'
      const mimeType = metadata.mime || 'application/octet-stream'
      
      // Upload to storage
      const uploadResult = await uploadDocument(uri, orgId, clientId, metadata.jobId)
      
      // Get actual file size using expo-file-system
      const fileInfo = await FileSystem.getInfoAsync(uri)
      const size = fileInfo.exists ? fileInfo.size || 0 : 0
      
      // Create database record
      const { data: document, error } = await supabase
        .from('documents')
        .insert({
          org_id: orgId,
          client_id: clientId,
          job_id: metadata.jobId,
          title: metadata.title,
          path: uploadResult.path,
          mime: mimeType,
          size,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || 'unknown'
        })
        .select()
        .single()

      if (error) {
        // Clean up uploaded file if DB insert fails
        await deleteDocument(uploadResult.path)
        throw new Error(`Failed to create document record: ${error.message}`)
      }

      // Log activity
      await logActivity(orgId, 'document', document.id, 'uploaded', {
        document_title: document.title,
        client_id: clientId
      })

      return { document, success: true }
    } catch (error) {
      return {
        document: {} as DocumentWithUrl,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // List documents with optional filtering
  list: async (orgId: string, filters?: DocumentFilters): Promise<DocumentWithUrl[]> => {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id)
    }

    if (filters?.job_id) {
      query = query.eq('job_id', filters.job_id)
    }

    if (filters?.mime_type) {
      query = query.eq('mime', filters.mime_type)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`)
    }

    return data || []
  },

  // Get single document with signed URL
  get: async (documentId: string): Promise<DocumentWithUrl> => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch document: ${error.message}`)
    }

    // Get signed URL for download
    const signedUrl = await getSignedUrl(data.path)

    return {
      ...data,
      signed_url: signedUrl
    }
  },

  // Get signed URL for document
  getSignedUrl: async (documentId: string): Promise<string> => {
    const { data, error } = await supabase
      .from('documents')
      .select('path')
      .eq('id', documentId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch document: ${error.message}`)
    }

    return getSignedUrl(data.path)
  },

  // Update document metadata
  update: async (documentId: string, updates: { title?: string }): Promise<DocumentWithUrl> => {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update document: ${error.message}`)
    }

    // Log activity
    await logActivity(data.org_id, 'document', documentId, 'updated', {
      document_title: data.title
    })

    return data
  },

  // Delete document (removes from storage and database)
  delete: async (documentId: string): Promise<void> => {
    // Get document info first
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch document: ${fetchError.message}`)
    }

    // Delete from storage
    await deleteDocument(document.path)

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`)
    }

    // Log activity
    await logActivity(document.org_id, 'document', documentId, 'deleted', {
      document_title: document.title
    })
  },

  // Bulk delete documents
  bulkDelete: async (documentIds: string[]): Promise<{ success: number; errors: string[] }> => {
    const errors: string[] = []
    let successCount = 0

    for (const documentId of documentIds) {
      try {
        await documentAPI.delete(documentId)
        successCount++
      } catch (error) {
        errors.push(`Document ${documentId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return { success: successCount, errors }
  },

  // Search documents by title
  search: async (orgId: string, query: string): Promise<DocumentWithUrl[]> => {
    if (!query.trim()) {
      return []
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('org_id', orgId)
      .ilike('title', `%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to search documents: ${error.message}`)
    }

    return data || []
  },

  // Get document statistics
  getStats: async (orgId: string) => {
    const { data, error } = await supabase
      .from('documents')
      .select('mime, size')
      .eq('org_id', orgId)

    if (error) {
      throw new Error(`Failed to fetch document stats: ${error.message}`)
    }

    const stats = {
      total: data.length,
      totalSize: data.reduce((sum, doc) => sum + (doc.size || 0), 0),
      byType: data.reduce((acc, doc) => {
        const type = doc.mime.split('/')[0] || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return stats
  },

  // Get documents by client
  getByClient: async (clientId: string): Promise<DocumentWithUrl[]> => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch client documents: ${error.message}`)
    }

    return data || []
  },

  // Get documents by job
  getByJob: async (jobId: string): Promise<DocumentWithUrl[]> => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch job documents: ${error.message}`)
    }

    return data || []
  },

  // Validate file type and size
  validateFile: (file: { uri: string; name: string; size?: number; type?: string }) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    const maxSize = 10 * 1024 * 1024 // 10MB

    if (file.size && file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit')
    }

    if (file.type && !allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed')
    }

    return true
  }
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all files in storage
    const { data: files, error: listError } = await supabase.storage
      .from('documents')
      .list('', { limit: 1000 })

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`)
    }

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No files found to clean up' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const orphanedFiles: string[] = []
    const deletedFiles: string[] = []
    const errors: string[] = []

    // Check each file against the database
    for (const file of files) {
      try {
        // Extract org_id, client_id, and filename from path
        // Expected path format: {org_id}/{client_id}/{filename}
        const pathParts = file.name.split('/')
        
        if (pathParts.length < 3) {
          // Invalid path format, mark as orphaned
          orphanedFiles.push(file.name)
          continue
        }

        const [orgId, clientId, filename] = pathParts

        // Check if this file exists in the documents table
        const { data: document, error: dbError } = await supabase
          .from('documents')
          .select('id, path')
          .eq('org_id', orgId)
          .eq('client_id', clientId)
          .eq('path', file.name)
          .single()

        if (dbError && dbError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for orphaned files
          errors.push(`Database error for ${file.name}: ${dbError.message}`)
          continue
        }

        if (!document) {
          // File not found in database, mark as orphaned
          orphanedFiles.push(file.name)
        }
      } catch (error) {
        errors.push(`Error processing ${file.name}: ${error.message}`)
      }
    }

    // Delete orphaned files
    for (const orphanedFile of orphanedFiles) {
      try {
        const { error: deleteError } = await supabase.storage
          .from('documents')
          .remove([orphanedFile])

        if (deleteError) {
          errors.push(`Failed to delete ${orphanedFile}: ${deleteError.message}`)
        } else {
          deletedFiles.push(orphanedFile)
        }
      } catch (error) {
        errors.push(`Error deleting ${orphanedFile}: ${error.message}`)
      }
    }

    // Log cleanup results
    const cleanupLog = {
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      orphanedFiles: orphanedFiles.length,
      deletedFiles: deletedFiles.length,
      errors: errors.length,
      orphanedFileList: orphanedFiles,
      deletedFileList: deletedFiles,
      errorList: errors
    }

    // Store cleanup log in database
    await supabase
      .from('activities')
      .insert({
        org_id: null, // System activity
        entity_type: 'system',
        entity_id: '00000000-0000-0000-0000-000000000000',
        action: 'storage_cleanup',
        meta: cleanupLog
      })

    return new Response(
      JSON.stringify({
        message: 'Storage cleanup completed',
        summary: {
          totalFiles: files.length,
          orphanedFiles: orphanedFiles.length,
          deletedFiles: deletedFiles.length,
          errors: errors.length
        },
        details: cleanupLog
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Storage cleanup error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Storage cleanup failed', 
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

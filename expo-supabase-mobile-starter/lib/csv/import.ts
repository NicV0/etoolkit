import { parse, ParseResult } from 'papaparse'
import { clientAPI } from '../api/clients'
import { clientImportSchema, csvColumnMappers, CSVImportConfig } from '../validation/clientSchemas'
import { logActivity } from '../db/mutations'

export interface CSVImportResult {
  success: number
  errors: string[]
  warnings: string[]
  totalRows: number
  skippedRows: number
  processingTime: number
}

export interface CSVValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  sampleData: any[]
  columnMapping: Record<string, string>
}

export class CSVImporter {
  private config: CSVImportConfig

  constructor(config: Partial<CSVImportConfig> = {}) {
    this.config = {
      hasHeader: true,
      delimiter: ',',
      skipEmptyLines: true,
      transformHeader: true,
      ...config
    }
  }

  // Validate CSV content before import
  validateCSV(csvContent: string): CSVValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const sampleData: any[] = []

    try {
      const result = parse(csvContent, {
        header: this.config.hasHeader,
        delimiter: this.config.delimiter,
        skipEmptyLines: this.config.skipEmptyLines,
        transformHeader: this.config.transformHeader ? 
          (header: string) => header.toLowerCase().replace(/\s+/g, '_') : 
          undefined,
        preview: 5 // Get first 5 rows for validation
      })

      if (result.errors.length > 0) {
        errors.push(...result.errors.map(err => `Parse error: ${err.message}`))
      }

      if (result.data.length === 0) {
        errors.push('No data found in CSV file')
        return { isValid: false, errors, warnings, sampleData, columnMapping: {} }
      }

      // Store sample data
      sampleData.push(...result.data.slice(0, 3))

      // Validate headers if present
      if (this.config.hasHeader && result.meta.fields) {
        const headers = result.meta.fields
        const columnMapping = csvColumnMappers.mapHeaders(headers)

        // Check for required fields
        if (!columnMapping.name) {
          errors.push('Required column "name" not found. Available columns: ' + headers.join(', '))
        }

        // Check for optional but important fields
        if (!columnMapping.email && !columnMapping.phone) {
          warnings.push('Neither email nor phone column found. Client records may be incomplete.')
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
          sampleData,
          columnMapping
        }
      }

      // If no headers, assume standard column order
      const standardColumns = ['name', 'email', 'phone', 'address_line1', 'city', 'state', 'postal', 'notes', 'status']
      const columnMapping = standardColumns.reduce((acc, col, index) => {
        acc[col] = `Column ${index + 1}`
        return acc
      }, {} as Record<string, string>)

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        sampleData,
        columnMapping
      }

    } catch (error) {
      errors.push(`CSV validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { isValid: false, errors, warnings, sampleData, columnMapping: {} }
    }
  }

  // Import clients from CSV
  async importClients(
    csvContent: string, 
    orgId: string, 
    options: {
      onProgress?: (current: number, total: number) => void
      dryRun?: boolean
    } = {}
  ): Promise<CSVImportResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []
    let successCount = 0
    let skippedRows = 0

    try {
      // First validate the CSV
      const validation = this.validateCSV(csvContent)
      if (!validation.isValid) {
        return {
          success: 0,
          errors: validation.errors,
          warnings: validation.warnings,
          totalRows: 0,
          skippedRows: 0,
          processingTime: Date.now() - startTime
        }
      }

      // Parse the full CSV
      const result = parse(csvContent, {
        header: this.config.hasHeader,
        delimiter: this.config.delimiter,
        skipEmptyLines: this.config.skipEmptyLines,
        transformHeader: this.config.transformHeader ? 
          (header: string) => header.toLowerCase().replace(/\s+/g, '_') : 
          undefined
      })

      const totalRows = result.data.length
      let currentRow = 0

      // Process each row
      for (let i = 0; i < result.data.length; i++) {
        const row = result.data[i] as any
        const rowNumber = i + (this.config.hasHeader ? 2 : 1) // +2 for header row, +1 for 0-based index
        currentRow++

        // Skip empty rows
        if (!row || Object.keys(row).length === 0 || Object.values(row).every(val => !val)) {
          skippedRows++
          continue
        }

        try {
          // Map CSV data to our schema
          const clientData = this.mapCSVRowToClient(row, validation.columnMapping)

          // Validate the data
          const validatedData = clientImportSchema.parse(clientData)

          // Skip if this is a dry run
          if (options.dryRun) {
            successCount++
            continue
          }

          // Create the client
          await clientAPI.create(orgId, validatedData)
          successCount++

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Row ${rowNumber}: ${errorMessage}`)
        }

        // Report progress
        if (options.onProgress) {
          options.onProgress(currentRow, totalRows)
        }
      }

      // Log import activity
      if (successCount > 0 && !options.dryRun) {
        await logActivity(orgId, 'client', 'bulk', 'imported', {
          count: successCount,
          errors_count: errors.length,
          total_rows: totalRows,
          skipped_rows: skippedRows
        })
      }

      return {
        success: successCount,
        errors,
        warnings: [...validation.warnings, ...warnings],
        totalRows,
        skippedRows,
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        success: successCount,
        errors,
        warnings,
        totalRows: 0,
        skippedRows,
        processingTime: Date.now() - startTime
      }
    }
  }

  // Map CSV row to client data
  private mapCSVRowToClient(row: any, columnMapping: Record<string, string>): any {
    const clientData: any = {}

    // Map each field using the column mapping
    for (const [field, csvColumn] of Object.entries(columnMapping)) {
      if (row[csvColumn] !== undefined && row[csvColumn] !== null && row[csvColumn] !== '') {
        clientData[field] = row[csvColumn]
      }
    }

    // Handle alternative field names
    if (!clientData.name && row.client_name) {
      clientData.name = row.client_name
    }
    if (!clientData.phone && row.phone_number) {
      clientData.phone = row.phone_number
    }
    if (!clientData.postal && row.postal_code) {
      clientData.postal = row.postal_code
    }
    if (!clientData.postal && row.zip) {
      clientData.postal = row.zip
    }
    if (!clientData.notes && row.comments) {
      clientData.notes = row.comments
    }

    // Set defaults
    if (!clientData.status) {
      clientData.status = 'active'
    }
    if (!clientData.country) {
      clientData.country = 'US'
    }

    return clientData
  }

  // Export clients to CSV
  async exportClients(
    orgId: string, 
    filters?: any, 
    options: {
      includeHeaders?: boolean
      delimiter?: string
    } = {}
  ): Promise<string> {
    const clients = await clientAPI.list(orgId, filters)
    
    const delimiter = options.delimiter || ','
    const includeHeaders = options.includeHeaders !== false

    // Define headers
    const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Postal', 'Status', 'Notes']

    // Convert clients to rows
    const rows = clients.map(client => [
      client.name,
      client.email || '',
      client.phone || '',
      client.address_line1 || '',
      client.city || '',
      client.state || '',
      client.postal || '',
      client.status,
      client.notes || ''
    ])

    // Build CSV content
    const csvRows = includeHeaders ? [headers, ...rows] : rows
    
    const csvContent = csvRows
      .map(row => row.map(field => this.escapeCSVField(field)))
      .join('\n')

    return csvContent
  }

  // Escape CSV field
  private escapeCSVField(field: any): string {
    const stringField = String(field)
    
    // If field contains delimiter, quote, or newline, wrap in quotes
    if (stringField.includes(this.config.delimiter) || 
        stringField.includes('"') || 
        stringField.includes('\n') ||
        stringField.includes('\r')) {
      return `"${stringField.replace(/"/g, '""')}"`
    }
    
    return stringField
  }

  // Get CSV template
  getTemplate(): string {
    const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Postal', 'Status', 'Notes']
    const sampleRow = [
      'John Doe',
      'john@example.com',
      '+1234567890',
      '123 Main St',
      'Anytown',
      'CA',
      '12345',
      'active',
      'Sample client'
    ]

    return [headers, sampleRow]
      .map(row => row.map(field => this.escapeCSVField(field)))
      .join('\n')
  }
}

// Convenience functions
export const csvImport = {
  // Quick import function
  importClients: async (
    csvContent: string, 
    orgId: string, 
    options?: {
      onProgress?: (current: number, total: number) => void
      dryRun?: boolean
    }
  ): Promise<CSVImportResult> => {
    const importer = new CSVImporter()
    return importer.importClients(csvContent, orgId, options)
  },

  // Quick validation function
  validateCSV: (csvContent: string): CSVValidationResult => {
    const importer = new CSVImporter()
    return importer.validateCSV(csvContent)
  },

  // Quick export function
  exportClients: async (orgId: string, filters?: any): Promise<string> => {
    const importer = new CSVImporter()
    return importer.exportClients(orgId, filters)
  },

  // Get template
  getTemplate: (): string => {
    const importer = new CSVImporter()
    return importer.getTemplate()
  }
}

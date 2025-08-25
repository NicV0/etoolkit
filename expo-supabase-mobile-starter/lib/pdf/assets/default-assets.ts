// Default assets for PDF generation
// These are base64 encoded to ensure they work offline and don't require external dependencies

export const DEFAULT_ASSETS = {
  // Default logo (simple SVG)
  logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iIzNiODJmNiIvPgo8dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmVMb2dvPC90ZXh0Pgo8L3N2Zz4K',
  
  // Web-safe fonts (no base64 needed, these are system fonts)
  fonts: {
    arial: 'Arial, sans-serif',
    helvetica: 'Helvetica, Arial, sans-serif',
    times: 'Times New Roman, serif',
    courier: 'Courier New, monospace',
    georgia: 'Georgia, serif',
    verdana: 'Verdana, Geneva, sans-serif'
  },
  
  // Default color schemes
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    dark: '#1f2937',
    light: '#f9fafb'
  },
  
  // Default icons (SVG)
  icons: {
    checkmark: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2LjY2NyA3LjVMMTAgMTQuMTY3TDMuMzMzIDcuNSIgc3Ryb2tlPSIjMTA5ODgxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K',
    warning: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDJMMTggMTZIMkwxMCAyWiIgZmlsbD0iI2Y1OWUwYiIvPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjE0IiByPSIxIiBmaWxsPSIjZjU5ZTBiIi8+Cjwvc3ZnPgo=',
    error: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDJMMTggMTZIMkwxMCAyWiIgZmlsbD0iI2VmNDQ0NCIvPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjE0IiByPSIxIiBmaWxsPSIjZWY0NDQ0Ii8+Cjwvc3ZnPgo='
  },
  
  // Default patterns and backgrounds
  patterns: {
    dots: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iI2YzZjRmNiIvPgo8L3N2Zz4K',
    lines: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMTBoMjAiIHN0cm9rZT0iI2YzZjRmNiIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPgo='
  }
}

// Asset utility functions
export const AssetUtils = {
  /**
   * Get default logo for organization
   */
  getDefaultLogo(): string {
    return DEFAULT_ASSETS.logo
  },
  
  /**
   * Get font family by name
   */
  getFont(fontName: keyof typeof DEFAULT_ASSETS.fonts): string {
    return DEFAULT_ASSETS.fonts[fontName]
  },
  
  /**
   * Get color by name
   */
  getColor(colorName: keyof typeof DEFAULT_ASSETS.colors): string {
    return DEFAULT_ASSETS.colors[colorName]
  },
  
  /**
   * Get icon by name
   */
  getIcon(iconName: keyof typeof DEFAULT_ASSETS.icons): string {
    return DEFAULT_ASSETS.icons[iconName]
  },
  
  /**
   * Get pattern by name
   */
  getPattern(patternName: keyof typeof DEFAULT_ASSETS.patterns): string {
    return DEFAULT_ASSETS.patterns[patternName]
  },
  
  /**
   * Convert image to base64 (for embedding in PDFs)
   */
  async imageToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri)
      const blob = await response.blob()
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.warn('Failed to convert image to base64:', error)
      return DEFAULT_ASSETS.logo
    }
  },
  
  /**
   * Validate if a string is a valid base64 image
   */
  isValidBase64Image(str: string): boolean {
    return str.startsWith('data:image/') && str.includes('base64,')
  },
  
  /**
   * Get asset with fallback
   */
  getAssetWithFallback<T extends keyof typeof DEFAULT_ASSETS>(
    assetType: T,
    assetName: keyof typeof DEFAULT_ASSETS[T],
    fallback?: string
  ): string {
    const asset = DEFAULT_ASSETS[assetType][assetName]
    return (asset || fallback || DEFAULT_ASSETS.logo) as string
  }
}

// Export default assets for direct access
export default DEFAULT_ASSETS

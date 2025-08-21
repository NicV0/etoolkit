# PDF Generation Dependencies Research

## Overview

This document outlines the research and recommendations for PDF generation dependencies in the eToolkit mobile application, addressing potential bundle size concerns.

## Current Dependencies

### Already Installed
- ✅ `expo-print` - Basic printing functionality
- ✅ `expo-sharing` - File sharing capabilities

## PDF Generation Options

### Option 1: React Native HTML to PDF (Recommended)

**Package**: `react-native-html-to-pdf`
**Bundle Size Impact**: ~2-3MB
**Pros**:
- Lightweight and efficient
- Uses native HTML rendering
- Good performance on both iOS and Android
- Supports custom CSS styling
- Can embed base64 images and fonts

**Cons**:
- Requires native linking
- Limited to HTML-based templates

**Installation**:
```bash
npm install react-native-html-to-pdf
# Requires additional native setup
```

### Option 2: Expo Print with HTML Templates

**Package**: `expo-print` (already installed)
**Bundle Size Impact**: Minimal (already included)
**Pros**:
- No additional bundle size
- Works with existing Expo setup
- Good HTML support
- Can generate PDFs from HTML strings

**Cons**:
- Limited to HTML-based generation
- Less control over PDF formatting
- May not support all advanced PDF features

### Option 3: React Native PDF Library

**Package**: `react-native-pdf-lib`
**Bundle Size Impact**: ~5-8MB
**Pros**:
- Full PDF generation capabilities
- Programmatic PDF creation
- Advanced formatting options
- Support for complex layouts

**Cons**:
- Significant bundle size increase
- More complex API
- Requires native linking

### Option 4: Cloud-based PDF Generation

**Package**: None (server-side)
**Bundle Size Impact**: None
**Pros**:
- No bundle size impact
- Unlimited PDF generation capabilities
- Can use advanced libraries like Puppeteer
- Consistent rendering across platforms

**Cons**:
- Requires internet connection
- Additional server costs
- Potential latency issues
- Privacy concerns for sensitive data

## Recommendation: Hybrid Approach

### Phase 1: Expo Print (Immediate Implementation)
Use `expo-print` for basic PDF generation with HTML templates.

**Implementation**:
```typescript
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'

export const generatePDF = async (html: string, filename: string) => {
  const { uri } = await Print.printToFileAsync({ html })
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: filename
  })
}
```

**Bundle Size**: No additional impact
**Timeline**: Week 7 implementation

### Phase 2: Enhanced PDF Generation (Future)
Consider `react-native-html-to-pdf` for more advanced features.

**Bundle Size**: +2-3MB
**Timeline**: Post-MVP enhancement

## Template System Design

### HTML Template Structure
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Embedded CSS for consistent rendering */
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 200px; height: auto; }
    .invoice-table { width: 100%; border-collapse: collapse; }
    .invoice-table th, .invoice-table td { 
      border: 1px solid #ddd; padding: 8px; text-align: left; 
    }
    .totals { margin-top: 20px; text-align: right; }
    .footer { margin-top: 40px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <!-- Template content with placeholders -->
  <div class="header">
    <img src="{{logo}}" alt="Company Logo" class="logo">
    <h1>{{company_name}}</h1>
  </div>
  
  <div class="invoice-details">
    <h2>{{document_type}} #{{number}}</h2>
    <p><strong>Date:</strong> {{date}}</p>
    <p><strong>Due Date:</strong> {{due_date}}</p>
  </div>
  
  <div class="client-info">
    <h3>Bill To:</h3>
    <p>{{client_name}}</p>
    <p>{{client_address}}</p>
  </div>
  
  <table class="invoice-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {{#items}}
      <tr>
        <td>{{description}}</td>
        <td>{{quantity}}</td>
        <td>${{unit_price}}</td>
        <td>${{line_total}}</td>
      </tr>
      {{/items}}
    </tbody>
  </table>
  
  <div class="totals">
    <p><strong>Subtotal:</strong> ${{subtotal}}</p>
    <p><strong>Tax:</strong> ${{tax_total}}</p>
    <p><strong>Total:</strong> ${{total}}</p>
  </div>
  
  <div class="footer">
    <p>{{terms}}</p>
  </div>
</body>
</html>
```

### Template Engine
Use a lightweight template engine like `handlebars` or custom string replacement.

**Bundle Size Impact**: ~50KB for Handlebars
**Alternative**: Custom template engine (~10KB)

## Font and Asset Management

### Embedded Fonts
- Use web-safe fonts (Arial, Helvetica, Times New Roman)
- Embed custom fonts as base64 for consistent rendering
- Limit font file sizes to <100KB each

### Logo and Images
- Convert logos to base64 for embedding
- Optimize image sizes (max 200px width for logos)
- Use SVG where possible for scalability

### Asset Optimization
```typescript
// Asset optimization utilities
export const optimizeImage = async (uri: string, maxWidth: number = 200) => {
  // Image optimization logic
}

export const embedAsset = async (uri: string): Promise<string> => {
  // Convert to base64 for embedding
}
```

## Performance Considerations

### Template Caching
- Cache compiled templates in memory
- Pre-compile common templates
- Use template versioning for updates

### PDF Generation Optimization
- Generate PDFs in background threads
- Implement progress indicators
- Cache generated PDFs temporarily

### Memory Management
- Clean up temporary files
- Limit concurrent PDF generation
- Monitor memory usage during generation

## Security Considerations

### HTML Injection Prevention
- Sanitize all user input
- Use template engines with built-in escaping
- Validate all data before template rendering

### File Security
- Generate PDFs in secure temporary directories
- Implement proper file cleanup
- Validate file permissions

## Implementation Plan

### Week 7: Basic PDF Generation
1. **Template System**: Create HTML templates for quotes and invoices
2. **Template Engine**: Implement lightweight template engine
3. **PDF Generation**: Use expo-print for basic PDF generation
4. **Asset Management**: Implement base64 asset embedding
5. **Testing**: Test PDF generation with various data sets

### Future Enhancements
1. **Advanced Templates**: Add more template variations
2. **Custom Fonts**: Support for custom font embedding
3. **Interactive PDFs**: Add form fields and digital signatures
4. **Batch Generation**: Generate multiple PDFs efficiently

## Bundle Size Summary

| Component | Size | Impact |
|-----------|------|--------|
| expo-print | Already included | None |
| expo-sharing | Already included | None |
| Template Engine | ~10-50KB | Minimal |
| Custom Templates | ~100KB | Minimal |
| **Total Additional** | **~110-150KB** | **Low** |

## Conclusion

The recommended approach using `expo-print` with HTML templates provides:
- ✅ Minimal bundle size impact
- ✅ Good performance
- ✅ Consistent rendering
- ✅ Easy implementation
- ✅ Future extensibility

This approach addresses the bundle size concerns while providing robust PDF generation capabilities for the eToolkit application.

# UI Components

This directory contains reusable UI components built with React Native and TypeScript.

## Components

### Button
A versatile button component with multiple variants and states.

```tsx
import { Button, PrimaryButton, SecondaryButton } from './ui';

<Button 
  title="Click me" 
  onPress={() => {}} 
  variant="primary" 
  size="md" 
/>
```

**Props:**
- `title`: Button text
- `onPress`: Press handler
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: Disable button
- `loading`: Show loading state
- `fullWidth`: Full width button

### Input
A form input component with validation and accessibility support.

```tsx
import { Input } from './ui';

<Input 
  label="Email" 
  placeholder="Enter email" 
  value={email} 
  onChangeText={setEmail} 
  error="Invalid email" 
/>
```

### Card
A container component for content with optional interaction.

```tsx
import { Card } from './ui';

<Card variant="elevated" onPress={() => {}}>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Badge
A status indicator component.

```tsx
import { Badge, SuccessBadge, ErrorBadge } from './ui';

<Badge variant="success">Active</Badge>
<SuccessBadge>Success</SuccessBadge>
```

### Modal
A modal dialog component.

```tsx
import { Modal, ModalHeader, ModalContent, ModalFooter } from './ui';

<Modal visible={isVisible} onClose={() => {}}>
  <ModalHeader>Title</ModalHeader>
  <ModalContent>Content</ModalContent>
  <ModalFooter>Actions</ModalFooter>
</Modal>
```

### Toast
A notification component.

```tsx
import { Toast } from './ui';

<Toast 
  type="success" 
  title="Success!" 
  message="Operation completed" 
  visible={true} 
  onDismiss={() => {}} 
/>
```

### LoadingSpinner
A loading indicator component.

```tsx
import { LoadingSpinner, LoadingOverlay } from './ui';

<LoadingSpinner size="md" color="#007AFF" />
<LoadingOverlay visible={isLoading}>Content</LoadingOverlay>
```

### Skeleton
A loading placeholder component.

```tsx
import { Skeleton, SkeletonText, SkeletonCard } from './ui';

<Skeleton variant="text" lines={3} />
<SkeletonCard />
```### SearchBar (primitive)
Purpose: Consistent, accessible search input using tokens.ts only.

Accessibility
- Container: accessibilityRole="search"
- Input: accessibilityLabel (e.g., "Search"), returnKeyType="search"
- Clear button: accessibilityLabel="Clear search"

Test IDs
- Wrapper: testID (e.g., "searchbar")
- Input: inputTestID (e.g., "searchbar.input")
- Clear: clearButtonTestID (e.g., "searchbar.clear")

Props
- value: string
- onChange(text: string)
- onSubmit?(text: string) — trimmed text when user presses the keyboard "Search"
- onClear?() — fires when clear is tapped; input becomes ""
- placeholder?: string
- allowClear?: boolean (default true)
- autoFocus?: boolean (default false)
- maxLength?: number
- debounceMs?: number | undefined (unspecified = no debounce)
- testID?, inputTestID?, clearButtonTestID?

Styling
- Uses tokens.ts semantic aliases only:
  - input.background, border.subtle, text.primary, text.muted (placeholder), radii.md, spacing.{sm,md}
  - No hard-coded colors; respects tokens

Keyboard
- returnKeyType="search" on the TextInput

Behavior
- Clear button hides when empty; visible when value is non-empty

Example
```tsx
import { SearchBar } from './ui';

<SearchBar
  value={query}
  onChangeText={setQuery}
  onSubmit={(t) => doSearch(t)}
  onClear={() => setQuery('')}
  placeholder="Search"
  testID="searchbar"
  inputTestID="searchbar.input"
  clearButtonTestID="searchbar.clear"
/>
```

### SearchInput
A search input with debouncing.

```tsx
import { SearchInput } from './ui';

<SearchInput 
  placeholder="Search..." 
  onSearch={(query) => {}} 
  debounceMs={300} 
/>
```

## Design System

All components use a consistent design system defined in `lib/theme/tokens.ts`:

- **Colors**: Primary, secondary, status colors
- **Typography**: Font families, sizes, weights
- **Spacing**: Consistent spacing scale
- **Shadows**: Elevation system
- **Animation**: Duration and easing curves

## Accessibility

All components include:
- Proper accessibility labels and hints
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## Performance

Components are optimized with:
- React.memo for preventing unnecessary re-renders
- Proper dependency arrays in hooks
- Efficient animation handling
- Lazy loading where appropriate

## Testing

Each component includes:
- Unit tests for functionality
- Accessibility testing
- Visual regression testing
- Performance testing

## Usage Guidelines

1. **Consistent Styling**: Always use theme tokens for colors, spacing, and typography
2. **Accessibility First**: Include proper accessibility props
3. **Performance**: Use React.memo for components that don't need frequent updates
4. **Error Handling**: Include proper error boundaries and fallbacks
5. **Documentation**: Keep component documentation up to date



# Item Selection UI - Design System (Light Theme)

## Overview

The DWPL application uses a **consistent light-theme design system** across all Masters and transaction pages. The item selection UI is fully integrated with the dashboard's color scheme and styling, ensuring a cohesive and professional user experience.

## Design System

### Color Palette (CSS Variables)

The application uses CSS variables defined in `globals.css`:

```css
--background: #f5f7fa;        /* Page background */
--foreground: #1a202c;        /* Primary text */
--primary: #3b82f6;           /* Primary blue */
--primary-dark: #2563eb;      /* Darker blue for hover */
--secondary: #64748b;         /* Secondary gray */
--accent: #f59e0b;            /* Accent orange */
--success: #10b981;           /* Success green */
--error: #ef4444;             /* Error red */
--border: #e2e8f0;            /* Border color */
--card-bg: #ffffff;           /* Card background */
--hover-bg: #f8fafc;          /* Hover state */
--table-header-bg: #f9fafb;   /* Table headers */
--text-muted: #6b7280;        /* Muted text */
```

### Typography

- **Font Family**: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Font Weights**: 
  - Regular: 400
  - Medium: 500
  - Semibold: 600
  - Bold: 700

## Components

### 1. ItemSelector Component

**Location**: `src/components/ItemSelector.tsx`

**Purpose**: A dropdown-style item selector with integrated search functionality.

**Styling**:
- Uses CSS variables for all colors
- No dark mode classes
- Consistent with dashboard design
- Matches input field styling from `globals.css`

**Usage Example**:
```tsx
<ItemSelector
  label="Sending Party"
  value={formData.sendingParty}
  onChange={(value) => setFormData({ ...formData, sendingParty: value })}
  items={parties}
  placeholder="Select Party"
  required
  renderSelected={(party) => (
    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
      {party.partyName}
    </span>
  )}
  renderOption={(party) => (
    <div>
      <div className="font-medium" style={{ color: 'var(--foreground)' }}>
        {party.partyName}
      </div>
    </div>
  )}
  getSearchableText={(party) => party.partyName}
/>
```

### 2. ItemSelectionModal Component

**Location**: `src/components/ItemSelectionModal.tsx`

**Purpose**: A full modal-based item selector for complex selection scenarios.

**Styling**:
- Uses CSS variables throughout
- Light theme only
- Consistent with Modal component
- Matches card styling from `globals.css`

## Styling Guidelines

### Using CSS Variables

Always use CSS variables instead of hardcoded colors or Tailwind dark mode classes:

✅ **Correct:**
```tsx
<span style={{ color: 'var(--foreground)' }}>Text</span>
<div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
  Content
</div>
```

❌ **Incorrect:**
```tsx
<span className="text-slate-900 dark:text-white">Text</span>
<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
  Content
</div>
```

### Color Usage

| Element | CSS Variable | Usage |
|---------|-------------|--------|
| Primary text | `var(--foreground)` | Main content, headings |
| Muted text | `var(--text-muted)` | Helper text, placeholders |
| Primary action | `var(--primary)` | Buttons, links, selected states |
| Background | `var(--card-bg)` | Cards, modals, dropdowns |
| Borders | `var(--border)` | Dividers, input borders |
| Hover state | `var(--hover-bg)` | Hover backgrounds |
| Selected state | `#EFF6FF` | Selected items (light blue) |

### Render Function Patterns

#### Selected Item (Minimal Info)
```tsx
renderSelected={(item) => (
  <span className="font-medium" style={{ color: 'var(--foreground)' }}>
    {item.name}
  </span>
)}
```

#### Option Item (Detailed Info)
```tsx
renderOption={(item) => (
  <div>
    <div className="font-medium" style={{ color: 'var(--foreground)' }}>
      {item.name}
    </div>
    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
      {item.description}
    </div>
  </div>
)}
```

#### With Multiple Fields
```tsx
renderSelected={(item) => (
  <div className="flex items-center gap-2">
    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
      {item.primary}
    </span>
    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
      {item.secondary}
    </span>
  </div>
)}
```

## Implementation Examples

### GRN - Party Selection
```tsx
<ItemSelector
  label="Sending Party"
  value={formData.sendingParty}
  onChange={(value) => setFormData({ ...formData, sendingParty: value })}
  items={parties}
  placeholder="Select Party"
  required
  renderSelected={(party) => (
    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
      {party.partyName}
    </span>
  )}
  renderOption={(party) => (
    <div>
      <div className="font-medium" style={{ color: 'var(--foreground)' }}>
        {party.partyName}
      </div>
    </div>
  )}
  getSearchableText={(party) => party.partyName}
/>
```

### GRN - RM Size Selection
```tsx
<ItemSelector
  label="RM Size"
  value={formData.rmSize}
  onChange={(value) => setFormData({ ...formData, rmSize: value })}
  items={rmItems}
  placeholder="Select RM Size"
  required
  helperText="Select the raw material size for this GRN"
  renderSelected={(item) => (
    <div className="flex items-center gap-2">
      <span className="font-medium" style={{ color: 'var(--foreground)' }}>
        {item.size}
      </span>
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {item.grade} ({item.mill})
      </span>
    </div>
  )}
  renderOption={(item) => (
    <div>
      <div className="font-medium" style={{ color: 'var(--foreground)' }}>
        {item.size} - {item.grade}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        Mill: {item.mill}
      </div>
    </div>
  )}
  getSearchableText={(item) => 
    `${item.size} ${item.grade} ${item.mill}`
  }
/>
```

## Consistency Checklist

When creating or updating item selectors:

- [ ] Use CSS variables for all colors
- [ ] No dark mode classes (no `dark:` prefixes)
- [ ] Match input styling from `globals.css`
- [ ] Use `var(--foreground)` for primary text
- [ ] Use `var(--text-muted)` for secondary text
- [ ] Use `var(--border)` for borders
- [ ] Use `var(--hover-bg)` for hover states
- [ ] Use `var(--primary)` for selected states
- [ ] Follow typography guidelines
- [ ] Test visual consistency with dashboard

## Design Principles

### 1. Visual Cohesion
All components share the same color palette, typography, and spacing as the dashboard.

### 2. Light Theme Only
The application uses a single, consistent light theme. No dark mode support.

### 3. CSS Variables First
Always use CSS variables instead of hardcoded colors for maintainability.

### 4. Consistent Interactions
All selectors have the same hover, focus, and selected states.

### 5. Professional Appearance
Clean, modern design matching enterprise software standards.

## Browser Support

The item selection UI works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance

- Efficient filtering with memoization
- Smooth animations and transitions
- Optimized re-renders
- Fast search performance

## Accessibility

- Proper ARIA labels
- Keyboard navigation
- Clear focus states
- Screen reader friendly

---

**Last Updated**: December 21, 2025
**Version**: 2.0.0 (Light Theme)
**Status**: ✅ Production Ready

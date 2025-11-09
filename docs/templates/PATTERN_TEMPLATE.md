# [Pattern Name]

Quick template for documenting composed patterns (Layer 2).

---

## Pattern Information

**Location:** `/components/composed/[category]/[PatternName].tsx`
**Category:** [data-display | layouts | forms | feedback | media | navigation]
**Created:** [Date]
**Last Updated:** [Date]
**Status:** [Draft | In Use | Stable]

---

## Purpose

Brief 1-2 sentence description of what problem this pattern solves.

**Example:** "A reusable data table component with sorting, filtering, pagination, and row selection. Replaces repetitive table implementations across feature modules."

---

## When to Use

- ✅ Use case 1
- ✅ Use case 2
- ✅ Use case 3

---

## When NOT to Use

- ❌ Anti-pattern 1 (explain why)
- ❌ Anti-pattern 2 (explain why)
- ❌ When you have business logic (keep in feature module)

---

## Dependencies

### shadcn/ui Components (Layer 1)
- [ ] component-name
- [ ] component-name
- [ ] component-name

### External Libraries (if any)
- [ ] library-name (version)
- [ ] library-name (version)

### Other Composed Patterns (if any)
- [ ] PatternName
- [ ] PatternName

---

## Props API

```typescript
interface PatternNameProps {
  /**
   * Description of the prop
   * @example "Example value"
   */
  propName: PropType;

  /**
   * Optional prop with default
   * @default defaultValue
   */
  optionalProp?: PropType;

  /**
   * Callback function
   * @param param - Description
   */
  onAction?: (param: ParamType) => void;
}
```

### Prop Details

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `propName` | `PropType` | ✅ | - | Description |
| `optionalProp` | `PropType` | ❌ | `defaultValue` | Description |
| `onAction` | `(param: ParamType) => void` | ❌ | - | Description |

---

## Usage Examples

### Basic Usage

```typescript
import { PatternName } from '@/components/composed/[category]/PatternName';

export function MyFeatureComponent() {
  return (
    <PatternName
      propName="value"
      optionalProp="value"
      onAction={handleAction}
    />
  );
}
```

### With Server Component

```typescript
export async function MyServerComponent() {
  const data = await getData(); // Server Action

  return (
    <PatternName
      data={data}
      onAction={clientAction}
    />
  );
}
```

### Advanced Example

```typescript
export function AdvancedExample() {
  const [state, setState] = useState();

  return (
    <PatternName
      propName="value"
      optionalProp="advanced"
      onAction={async (param) => {
        // Complex handler
        const result = await serverAction(param);
        setState(result);
      }}
    />
  );
}
```

### Real-World Feature Usage

```typescript
// Example from actual feature module
// Location: /modules/products/components/ProductList.tsx

export async function ProductList() {
  const result = await getProducts();

  if (!result.success) {
    return <ErrorState error={result.error} />;
  }

  return (
    <PatternName
      data={result.data}
      // ... feature-specific props
    />
  );
}
```

---

## Implementation Notes

### Key Design Decisions

1. **Decision 1**: Explanation of why this approach was chosen
2. **Decision 2**: Trade-offs considered
3. **Decision 3**: Alternative approaches rejected

### Gotchas & Edge Cases

- **Gotcha 1**: Description and workaround
- **Gotcha 2**: Description and workaround
- **Edge case**: How it's handled

### Performance Considerations

- **Optimization 1**: Description
- **Optimization 2**: Description
- **Known limitations**: Description

---

## Accessibility

### ARIA Attributes

- [ ] Proper ARIA labels on interactive elements
- [ ] ARIA live regions for dynamic content
- [ ] ARIA descriptions for complex interactions

### Keyboard Navigation

- [ ] Tab navigation works correctly
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals/popovers
- [ ] Arrow keys for lists/menus (if applicable)

### Screen Reader Support

- [ ] All interactive elements are announced
- [ ] Loading states are announced
- [ ] Error states are announced
- [ ] Success feedback is announced

### Focus Management

- [ ] Focus visible on all interactive elements
- [ ] Focus trapped in modals (if applicable)
- [ ] Focus returned after closing overlays

---

## Testing Checklist

### Functionality

- [ ] Renders without errors
- [ ] All props work as expected
- [ ] Callbacks fire correctly
- [ ] Edge cases handled

### Visual

- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Responsive on mobile (< 640px)
- [ ] Responsive on tablet (640px - 1024px)
- [ ] Responsive on desktop (> 1024px)

### Accessibility

- [ ] Passes keyboard navigation
- [ ] Screen reader tested
- [ ] Focus management works
- [ ] ARIA attributes correct

### Performance

- [ ] No unnecessary re-renders
- [ ] Large datasets handled efficiently
- [ ] Loading states smooth

---

## Related Patterns

### Patterns This Uses
- [PatternName](./PatternName.md) - How it's used

### Patterns That Use This
- [PatternName](./PatternName.md) - How it's used

### Alternative Patterns
- [PatternName](./PatternName.md) - When to use instead

---

## Code Structure

### File Organization

```
/components/composed/[category]/
├── PatternName.tsx          # Main component
├── PatternNameItem.tsx      # Sub-component (if needed)
├── PatternNameActions.tsx   # Actions sub-component (if needed)
└── types.ts                 # Type definitions (if complex)
```

### Component Skeleton

```typescript
'use client'; // Only if needed

import * as React from 'react';
import { cn } from '@/lib/utils';
// Import shadcn components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface PatternNameProps {
  className?: string;
  // ... other props
}

export function PatternName({
  className,
  // ... other props
}: PatternNameProps) {
  // State and logic

  return (
    <div className={cn('base-classes', className)}>
      {/* Component JSX */}
    </div>
  );
}

// Display name for debugging
PatternName.displayName = 'PatternName';
```

---

## Styling

### Base Classes

```css
/* Default classes applied */
.pattern-name {
  /* Base styles */
}
```

### Customization

```typescript
<PatternName
  className="custom-class" // Merged with base classes
/>
```

### Theme Variables Used

- `--background`
- `--foreground`
- `--primary`
- `--border`
- (List all CSS variables this pattern uses)

---

## Changelog

### [Date] - Version 1.0
- Initial implementation
- Features: feature 1, feature 2

### [Date] - Version 1.1
- Added: new feature
- Fixed: bug description
- Changed: breaking change description

---

## Migration Guide

### From Previous Version

If this pattern replaced an older implementation:

**Before:**
```typescript
// Old approach
```

**After:**
```typescript
// New pattern approach
```

### Breaking Changes

- **Change 1**: Description and migration path
- **Change 2**: Description and migration path

---

## Future Enhancements

Potential improvements for future versions:

- [ ] Enhancement 1 - Description
- [ ] Enhancement 2 - Description
- [ ] Enhancement 3 - Description

---

## References

**Official Docs:**
- [shadcn Component](https://ui.shadcn.com/docs/components/component-name)
- [Related Library](https://example.com/docs)

**Inspiration:**
- [Example 1](https://example.com) - What we learned
- [Example 2](https://example.com) - What we adapted

**Related Documentation:**
- [Architecture Overview](../development-planning/architecture-overview.md)
- [Component Decision Framework](../development-planning/component-decision-framework.md)
- [Component Inventory](../COMPONENT_INVENTORY.md)

---

## Maintainers

**Created by:** [Name]
**Current maintainer:** [Name]
**Last reviewed:** [Date]

---

## Questions or Issues?

If you encounter issues with this pattern:

1. Check this documentation for usage examples
2. Review related patterns that might be better suited
3. Check if you should be using a feature component instead
4. Update this documentation if you discover new patterns

---

**Remember:** This is a Layer 2 (composed pattern) component. It should:
- ✅ Use only Layer 1 (shadcn) primitives
- ✅ Accept data via props
- ✅ Emit events via callbacks
- ❌ NO Server Actions
- ❌ NO database access
- ❌ NO business logic

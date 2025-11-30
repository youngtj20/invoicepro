# Mobile Responsiveness Guide

## Overview

This guide documents the responsive design patterns and mobile optimizations implemented across the Invoice SaaS platform.

## Breakpoints

We use Tailwind CSS default breakpoints:

```css
sm:  640px  /* Small devices (landscape phones) */
md:  768px  /* Medium devices (tablets) */
lg:  1024px /* Large devices (desktops) */
xl:  1280px /* Extra large devices (large desktops) */
2xl: 1536px /* 2X large devices (larger desktops) */
```

## Responsive Patterns

### 1. Navigation

**Desktop (lg+):**
- Full horizontal navigation
- All menu items visible
- User menu in header

**Mobile (< lg):**
- Hamburger menu icon
- Slide-in drawer navigation
- Stacked menu items
- Touch-friendly tap targets (min 44x44px)

### 2. Dashboard Layout

**Desktop:**
```typescript
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* 4 columns on large screens */}
</div>
```

**Tablet:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 2 columns on tablets */}
</div>
```

**Mobile:**
```typescript
<div className="grid grid-cols-1 gap-6">
  {/* Single column on mobile */}
</div>
```

### 3. Tables

**Desktop:**
- Full table layout with all columns
- Fixed column widths
- Horizontal scrolling if needed

**Mobile:**
- Card-based layout (recommended)
- Stack information vertically
- Show only essential columns
- "View Details" button for full info

**Example:**
```typescript
{/* Desktop Table */}
<div className="hidden md:block">
  <table className="min-w-full">
    {/* Full table */}
  </table>
</div>

{/* Mobile Cards */}
<div className="md:hidden space-y-4">
  {items.map(item => (
    <div key={item.id} className="bg-white p-4 rounded-lg border">
      {/* Card content */}
    </div>
  ))}
</div>
```

### 4. Forms

**All Devices:**
- Full-width inputs on mobile
- Comfortable touch targets
- Clear error messages
- Sticky submit button on mobile

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormField label="First Name">
    <input className="w-full" />
  </FormField>
  <FormField label="Last Name">
    <input className="w-full" />
  </FormField>
</div>
```

### 5. Modals

**Desktop:**
- Centered overlay
- Max width container
- Backdrop blur

**Mobile:**
- Full screen or bottom sheet
- Easy to dismiss
- Scrollable content

```typescript
<div className="fixed inset-0 z-50 overflow-y-auto">
  <div className="flex min-h-screen items-center justify-center p-4">
    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
      {/* Modal content */}
    </div>
  </div>
</div>
```

## Component-Specific Guidelines

### Invoice List

**Desktop:**
```
┌─────────────────────────────────────────┐
│ Invoice # │ Customer │ Amount │ Status │
│ INV-001   │ John Doe │ $100   │ PAID   │
└─────────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────────────┐
│ INV-001              │
│ John Doe             │
│ $100 • PAID          │
│ Dec 15, 2024         │
│           [View >]   │
└──────────────────────┘
```

### Dashboard Cards

**Desktop (4 columns):**
```
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ Card1 │ │ Card2 │ │ Card3 │ │ Card4 │
└───────┘ └───────┘ └───────┘ └───────┘
```

**Tablet (2 columns):**
```
┌───────┐ ┌───────┐
│ Card1 │ │ Card2 │
└───────┘ └───────┘
┌───────┐ ┌───────┐
│ Card3 │ │ Card4 │
└───────┘ └───────┘
```

**Mobile (1 column):**
```
┌───────┐
│ Card1 │
└───────┘
┌───────┐
│ Card2 │
└───────┘
┌───────┐
│ Card3 │
└───────┘
┌───────┐
│ Card4 │
└───────┘
```

### Action Buttons

**Desktop:**
- Inline buttons with icons and text
- Hover states

**Mobile:**
- Icon-only buttons (save space)
- Tooltips on long press
- Larger touch targets

```typescript
<button className="p-2 md:px-4 md:py-2">
  <Icon className="w-5 h-5" />
  <span className="hidden md:inline ml-2">Action</span>
</button>
```

## Touch Optimization

### Minimum Touch Target Size

All interactive elements should be at least 44x44px:

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

### Tap Highlighting

Disable default tap highlight, use custom feedback:

```css
* {
  -webkit-tap-highlight-color: transparent;
}

.button:active {
  background-color: #e5e7eb; /* Custom highlight */
}
```

### Swipe Gestures

Consider implementing:
- Swipe to delete (lists)
- Pull to refresh (data tables)
- Swipe between tabs

## Typography

### Font Sizes

```typescript
// Mobile-first approach
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Title
</h1>

<p className="text-sm md:text-base lg:text-lg">
  Body text
</p>
```

### Line Height

Increase line height for better mobile readability:

```css
body {
  line-height: 1.6; /* vs 1.5 on desktop */
}
```

## Spacing

### Container Padding

```typescript
<div className="px-4 md:px-6 lg:px-8">
  {/* More padding on larger screens */}
</div>
```

### Gap Between Elements

```typescript
<div className="space-y-4 md:space-y-6 lg:space-y-8">
  {/* Larger gaps on bigger screens */}
</div>
```

## Images & Media

### Responsive Images

```typescript
<img
  src="/image.jpg"
  alt="Description"
  className="w-full h-auto"
  loading="lazy"
/>
```

### Srcset for Different Resolutions

```typescript
<img
  srcSet="
    /image-320.jpg 320w,
    /image-640.jpg 640w,
    /image-1024.jpg 1024w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  src="/image-640.jpg"
  alt="Description"
/>
```

## Performance

### Mobile-Specific Optimizations

1. **Lazy Load Images**
```typescript
<img loading="lazy" />
```

2. **Code Splitting**
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

3. **Reduce Bundle Size**
- Tree-shake unused code
- Use smaller libraries for mobile
- Lazy load non-critical features

4. **Optimize Fonts**
```css
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/font.woff2') format('woff2');
  font-display: swap;
}
```

## Testing Checklist

### Visual Testing

- [ ] All pages render correctly on:
  - [ ] iPhone SE (375px)
  - [ ] iPhone 12/13 (390px)
  - [ ] iPhone 14 Pro Max (430px)
  - [ ] iPad (768px)
  - [ ] iPad Pro (1024px)

### Interaction Testing

- [ ] All buttons tappable (min 44x44px)
- [ ] Forms usable with on-screen keyboard
- [ ] Scrolling smooth and natural
- [ ] No horizontal scrolling
- [ ] Modals dismissible
- [ ] Dropdowns work on touch
- [ ] Date pickers mobile-friendly

### Orientation Testing

- [ ] Portrait mode works
- [ ] Landscape mode works
- [ ] Layout adapts smoothly

## Common Issues & Solutions

### Issue: Horizontal Scroll

**Solution:**
```css
body {
  overflow-x: hidden;
}

.container {
  max-width: 100%;
  overflow-x: auto;
}
```

### Issue: Small Touch Targets

**Solution:**
```typescript
// Before
<button className="p-1">X</button>

// After
<button className="p-3">X</button>
```

### Issue: Text Too Small

**Solution:**
```css
/* Minimum font size */
body {
  font-size: 16px; /* Prevents zoom on iOS */
}
```

### Issue: Fixed Position Issues on iOS

**Solution:**
```css
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  /* Add safe area insets for notch */
  padding-top: env(safe-area-inset-top);
}
```

## Accessibility on Mobile

### Screen Reader Support

```typescript
<button aria-label="Close menu">
  <X className="w-6 h-6" />
</button>
```

### Focus Management

```typescript
// Trap focus in modal
useEffect(() => {
  if (isOpen) {
    firstElementRef.current?.focus();
  }
}, [isOpen]);
```

### Keyboard Navigation

Ensure keyboard users can:
- Navigate with Tab
- Activate with Enter/Space
- Dismiss with Escape
- Use arrow keys in lists

## Tools for Testing

### Browser DevTools

- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- Safari Responsive Design Mode

### Online Tools

- BrowserStack
- LambdaTest
- Responsively App

### Physical Devices

Test on actual devices when possible:
- iPhone (iOS)
- Android phone (Samsung, Pixel)
- iPad
- Android tablet

## Mobile Navigation Pattern

### Recommended Implementation

```typescript
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2"
        aria-label="Toggle menu"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsOpen(false)}
          />
          <nav className="absolute top-0 right-0 h-full w-64 bg-white shadow-xl">
            {/* Navigation items */}
          </nav>
        </div>
      )}
    </>
  );
}
```

## Conclusion

Following these responsive design patterns ensures:
- ✅ Consistent user experience across devices
- ✅ Optimized performance on mobile
- ✅ Accessible to all users
- ✅ Touch-friendly interfaces
- ✅ Professional appearance on all screens

Regular testing on real devices is essential to catch issues that simulators might miss.

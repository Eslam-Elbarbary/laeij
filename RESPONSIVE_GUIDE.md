# Responsive Design Guide

## Full-Width Layout Implementation

The UI has been optimized for full-width display across all screen sizes with proper responsive behavior.

## Key Features

### 1. Full-Width Sections
- All sections use `w-full` to span the entire viewport width
- Proper padding applied responsively: `px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20`
- No max-width constraints on main containers (except content areas)

### 2. Horizontal Scrolling on Mobile
- **Categories**: Scroll horizontally on mobile (< 768px), grid layout on desktop
- **Products**: Scroll horizontally on mobile (< 768px), grid layout on desktop
- Uses `flex` with `overflow-x-auto` on mobile
- Uses `grid` with `overflow-x-visible` on desktop

### 3. Responsive Breakpoints

#### Mobile (< 640px)
- Single column layouts
- Horizontal scrolling for categories and products
- Compact spacing: `px-4`, `py-6`
- Smaller text sizes
- Full-width buttons

#### Tablet (640px - 768px)
- 2-column grids
- Medium spacing: `px-6`, `py-8`
- Medium text sizes

#### Desktop (768px - 1024px)
- 3-4 column grids
- Standard spacing: `px-8`, `py-10`
- Standard text sizes

#### Large Desktop (1024px - 1536px)
- 4-6 column grids
- Generous spacing: `px-12`, `py-12`
- Larger text sizes

#### Extra Large (1536px+)
- Maximum columns (6 for categories, 4 for products)
- Maximum spacing: `px-16` or `px-20`
- Largest text sizes

## Component Responsive Behavior

### Navbar
- Height: `h-14 sm:h-16 lg:h-20`
- Logo: `text-2xl sm:text-3xl lg:text-4xl`
- Navigation: Hidden on mobile, visible on desktop
- Icons: Scale with screen size

### Category Cards
- Mobile: Fixed width `w-[280px]` in horizontal scroll
- Desktop: Full width in grid
- Height: `h-40 sm:h-48`
- Icons: `text-5xl sm:text-6xl`

### Product Cards
- Mobile: Fixed width `w-[160px]` in horizontal scroll
- Desktop: Full width in grid
- Image height: `min-h-[150px] sm:min-h-[180px] md:min-h-[200px]`
- Text: Responsive sizing `text-xs sm:text-sm md:text-base`

### Hero Section
- Padding: `py-12 md:py-16 lg:py-20`
- Heading: `text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl`
- Buttons: Full width on mobile, auto width on desktop

## Layout Structure

```
PageLayout (w-full, overflow-x-hidden)
  └── Navbar (w-full, responsive padding)
  └── Main (w-full)
      └── Sections (w-full, responsive padding)
          └── Content (max-w-7xl mx-auto for centering)
```

## Horizontal Scroll Implementation

```jsx
// Mobile: Horizontal scroll
<div className="flex overflow-x-auto scrollbar-hide">
  {items.map(item => (
    <div className="flex-shrink-0 w-[fixed-width]">
      <Card />
    </div>
  ))}
</div>

// Desktop: Grid layout
<div className="md:grid md:grid-cols-3 md:overflow-x-visible">
  {items.map(item => (
    <div className="md:w-full">
      <Card />
    </div>
  ))}
</div>
```

## Testing Checklist

- [x] Mobile (320px - 640px): Horizontal scroll works
- [x] Tablet (640px - 768px): Grid layout appears
- [x] Desktop (768px+): Full grid layout
- [x] Large screens (1536px+): Maximum columns
- [x] All sections are full-width
- [x] No horizontal overflow on any screen size
- [x] Text is readable on all sizes
- [x] Buttons are touch-friendly on mobile
- [x] Navigation works on all devices

## CSS Utilities

- `.scrollbar-hide`: Hides scrollbar but keeps functionality
- `overflow-x-hidden`: Prevents horizontal overflow on body
- `w-full`: Ensures full width
- Responsive padding utilities for consistent spacing


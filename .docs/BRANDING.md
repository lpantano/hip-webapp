# Branding Guide: Evidence Decoded

## Overview

Evidence Decoded uses a modern, friendly color palette built around sky blue and orange accents. The design system is fully implemented using HSL color values with comprehensive light and dark mode support.

## Primary Color Palette

### Light Mode

#### Primary Colors
- **Primary (Sky Blue)**: `hsl(191, 46%, 54%)` - #3FD0F1
  - A bright, modern sky blue that conveys trust and clarity
  - Foreground: White `hsl(0, 0%, 100%)`
  - Inspired by palette: #1995AD, #A1D6E2, #F1F1F2 (teal blue, light blue, and light gray)

- **Secondary (Light Purple)**: `hsl(275, 85%, 76%)`
  - Foreground: White `hsl(0, 0%, 100%)`

- **Accent (Bright Orange)**: `hsl(32, 100%, 62%)`
  - A vibrant tangerine orange for calls-to-action and highlights
  - Foreground: Dark blue-gray `hsl(220, 50%, 15%)`

#### Neutrals
- **Background**: White `hsl(0, 0%, 100%)`
- **Foreground**: Very dark blue-gray `hsl(222.2, 84%, 4.9%)`
- **Muted**: Very light gray `hsl(220, 20%, 95%)`
- **Muted Foreground**: Medium gray `hsl(220, 15%, 45%)`
- **Border**: Light gray-blue `hsl(214.3, 31.8%, 91.4%)`

#### Functional Colors
- **Destructive (Red)**: `hsl(0, 84.2%, 60.2%)`
  - Foreground: Very light blue-gray `hsl(210, 40%, 98%)`
- **Ring/Focus**: Light blue `hsl(204, 90%, 65%)`

### Dark Mode

#### Primary Colors
- **Primary**: Medium blue `hsl(204, 90%, 48%)`
  - A slightly deeper sky blue optimized for dark backgrounds
  - Foreground: White `hsl(0, 0%, 100%)`

- **Secondary**: Dark gray `hsl(220, 15%, 20%)`
  - Foreground: Light gray `hsl(220, 20%, 85%)`

- **Tertiary (Teal)**: `hsl(165, 79%, 46%)`
  - Foreground: Dark teal `hsl(165, 50%, 15%)`

- **Accent (Orange)**: `hsl(24, 95%, 60%)`
  - Foreground: White `hsl(0, 0%, 100%)`

#### Neutrals
- **Background**: Very dark blue-gray `hsl(222.2, 84%, 4.9%)`
- **Foreground**: Very light blue-gray `hsl(210, 40%, 98%)`
- **Muted**: Dark gray `hsl(220, 15%, 20%)`
- **Muted Foreground**: Medium gray `hsl(220, 10%, 65%)`
- **Border**: Dark gray-blue `hsl(217.2, 32.6%, 17.5%)`

#### Functional Colors
- **Destructive**: Dark red `hsl(0, 62.8%, 30.6%)`
  - Foreground: Very light blue-gray `hsl(210, 40%, 98%)`
- **Ring/Focus**: Medium blue `hsl(204, 90%, 48%)`

## Gradients

### Light Mode
- **Hero Gradient**: Linear gradient from medium blue to light sky blue
  - `linear-gradient(135deg, hsl(199 46% 54%) 0%, hsl(204 90% 85%) 100%)`
- **Card Gradient**: Linear gradient from white to very light blue-gray
  - `linear-gradient(145deg, hsl(0 0% 100%) 0%, hsl(210 40% 98%) 100%)`

### Dark Mode
- **Hero Gradient**: Linear gradient from dark blue to dark teal
  - `linear-gradient(135deg, hsl(210 79% 26%) 0%, hsl(165 78% 26%) 100%)`
- **Card Gradient**: Linear gradient from very dark blue-gray to dark gray-blue
  - `linear-gradient(145deg, hsl(222.2 84% 4.9%) 0%, hsl(217.2 32.6% 17.5%) 100%)`

## Evidence Classification Colors

The application uses a color-coded system for evidence classification badges:

| Classification | Background | Text | Purpose |
|---------------|-----------|------|---------|
| Unreliable / Invalid | Gray-200 | Gray-700 | Low credibility markers |
| Fallacy | Orange-200 | Gray-700 | Logical fallacies |
| Not tested in humans | Gray-300 | Gray-700 | No human trials |
| Limited tested in humans | Blue-100 | Blue-800 | Early stage testing |
| Tested in humans | Teal-300 | Gray-700 | Established evidence |
| Widely tested in humans | Green-300 | Green-900 | Strong evidence base |

## Sidebar Colors

### Light Mode
- **Background**: Very light gray `hsl(0, 0%, 98%)`
- **Foreground**: Dark gray `hsl(240, 5.3%, 26.1%)`
- **Primary**: Medium blue `hsl(204, 90%, 50%)`
- **Accent**: Very light blue-gray `hsl(240, 4.8%, 95.9%)`
- **Border**: Light gray `hsl(220, 13%, 91%)`

### Dark Mode
- **Background**: Very dark gray `hsl(240, 5.9%, 10%)`
- **Foreground**: Very light gray `hsl(240, 4.8%, 95.9%)`
- **Primary**: Darker blue `hsl(204, 90%, 40%)`
- **Accent**: Dark gray `hsl(240, 3.7%, 15.9%)`
- **Border**: Dark gray `hsl(240, 3.7%, 15.9%)`

## Design System Notes

- **All colors use HSL format** for better manipulation and consistency
- **Border radius**: Base radius is `0.75rem` with calculated variants (md: radius - 2px, sm: radius - 4px)
- **Color philosophy**: Friendly, modern, and accessible - the sky blue conveys trust and clarity while the orange accent adds energy and warmth
- **Semantic naming**: Colors are referenced by function (primary, accent, destructive) rather than specific hues, enabling easy theme switching

## Usage Guidelines

1. Always use CSS variables defined in [index.css](src/index.css) rather than hard-coded color values
2. Reference colors through Tailwind config in [tailwind.config.ts](tailwind.config.ts)
3. Evidence classifications should use the helper function in [classification-colors.ts](src/lib/classification-colors.ts)
4. Maintain WCAG AA contrast ratios between foreground and background colors
5. Test all UI changes in both light and dark modes

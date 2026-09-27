# STAPLER DESIGN SYSTEM DIRECTIVE (DESIGN.md)

This document is the absolute law for UI Generation. You must strictly adhere to these design tokens and patterns.

## 1. Typography
- **Primary Font**: Use `font-sans` (system-ui, Inter, or Geist).
- **Headings**: Must be `font-extrabold tracking-tight`. Always use `text-balance` for `h1` and `h2`.
- **Readability**: Body text must use `text-slate-600` (light mode) or `text-slate-400` (dark mode) with `leading-relaxed`.

## 2. Colors & Gradients
- Avoid flat colors. Use subtle gradients.
- **Primary Accents**: Use `bg-gradient-to-r from-blue-600 to-violet-600` for primary CTAs.
- **Backgrounds**: Use extremely light slate `bg-slate-50` with white cards, or dark slate `bg-slate-950` with slate-900 cards.
- **Borders**: Always use subtle borders (`border-slate-200` or `border-slate-800`) to define cards.

## 3. Shape & Layout
- **Radii**: Use large border radii. Buttons should be `rounded-full` or `rounded-xl`. Cards must be `rounded-2xl` or `rounded-3xl`.
- **Shadows**: Use `shadow-xl` with colored shadows where appropriate (e.g., `shadow-blue-500/20`).
- **Glassmorphism**: For navbars or floating elements, use `bg-white/80 backdrop-blur-md border border-white/20`.

## 4. Micro-Interactions (Framer Motion / Tailwind)
- Buttons must have `hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 active:scale-95`.
- Cards must have a subtle hover effect: `hover:border-blue-500/30 transition-colors`.

## 5. Composition Rules
- Never use generic placeholder text. Use highly opinionated, aggressive copy.
- Always include an overarching container with `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Use a robust `grid` for features and testimonials.

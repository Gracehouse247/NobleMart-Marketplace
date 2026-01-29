---
name: ui-ux-standard
description: Guidelines for maintaining a premium, high-converting look and feel for NobleMart.
---

# UI/UX Standard Skill

Ensures all NobleMart components feel premium, professional, and "WOW" the users.

## ✨ Design Principles
1. **Modern Typography**: Always use 'Inter' (800 for headers, 500 for body).
2. **Glassmorphism**: Use subtle `backdrop-filter: blur(10px)` and semi-transparent backgrounds for cards and overlays.
3. **Vibrant Accents**: Use Federal Blue (`#1e40af`) for primary actions and Success Green (`#10b981`) for positive feedback.
4. **Micro-animations**: Every button should have a `transition` and a `hover` transform.
5. **No Placeholders**: Never use generic placeholder images; use `generate_image` or high-quality Unsplash URLs.

## 🛠️ Implementation Checklist
- [ ] **Responsiveness**: Check all views on mobile breakpoints.
- [ ] **Consistency**: Ensure all inputs use the `.premium-input` class.
- [ ] **Loading States**: All async actions must show a shimmer or spinner.
- [ ] **Empty States**: Use illustrations for empty carts or search results.

## 📝 Verification Command
To check color consistency in the main CSS:
```powershell
Select-String -Path c:\Projects\NobleMart\Web\assets\css\main.css -Pattern "#[0-9a-fA-F]{6}" | Group-Object Line
```

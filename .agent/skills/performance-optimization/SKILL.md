---
name: performance-optimization
description: Guidelines and scripts for ensuring NobleMart maintains 100% fast loading and efficient resource usage.
---

# Performance Optimization Skill

This skill provides the standard procedures for optimizing the NobleMart marketplace.

## 🚀 Core Principles
1. **Never block the main thread**: All scripts must use the `defer` attribute.
2. **Compress everything**: Use Gzip/Deflate for both API responses and static assets.
3. **Cache aggressively**: Set long-term cache headers for assets that don't change often (logo, css, js).
4. **Lean API**: Ensure responses are minimal and compressed.

## 🛠️ Implementation Checklist
- [ ] **Gzip/Deflate**: Check `.htaccess` for `mod_deflate` rules.
- [ ] **API Compression**: Ensure `app.use(compression())` is present in `api/app.js`.
- [ ] **Static Caching**: Verify `max-age` headers for the `/uploads` directory.
- [ ] **Script Loading**: All `<script src="...">` tags must have the `defer` property.
- [ ] **Image Optimization**: Use WebP or SVG where possible.

## 📝 Verification Command
To check the current script loading status:
```powershell
Get-ChildItem -Path c:\Projects\NobleMart\Web -Filter *.html -Recurse | ForEach-Object { Select-String -Path $_.FullName -Pattern "<script" }
```

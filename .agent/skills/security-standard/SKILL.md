---
name: security-standard
description: Security guidelines for NobleMart, covering authentication, authorization, and data protection.
---

# Security Standard Skill

Ensures all NobleMart components follow the highest security standards for a multi-vendor marketplace.

## 🔒 Security Principles
1. **JWT Authentication**: All sensitive API routes must use the `authenticate` middleware.
2. **Role-Based Access Control (RBAC)**: Use `authorize('admin')` or `authorize('vendor')` to restrict access.
3. **Safe File Uploads**: Use Multer with strict filename generation and directory isolation for KYC and product images.
4. **Environment Isolation**: Never hardcode secrets; use `.env` variables for database and SMTP credentials.
5. **No Password Exposure**: Passwords must be hashed using `bcrypt` (10 rounds) before being saved.

## 🛠️ Implementation Checklist
- [ ] **Auth Middleware**: Verify `api/middleware/auth.js` is imported in sensitive routes.
- [ ] **CORS Policy**: Ensure the frontend domain is correctly whitelisted in `app.js`.
- [ ] **KYC Privacy**: Ensure KYC documents are not publicly indexed.
- [ ] **Input Sanitization**: Use parameterized queries (handled by `mysql2`) to prevent SQL injection.

## 📝 Verification Command
To find any hardcoded credentials (common mistake):
```powershell
Get-ChildItem -Path c:\Projects\NobleMart\Web\api -Recurse -File | Select-String -Pattern "password =" , "secret ="
```

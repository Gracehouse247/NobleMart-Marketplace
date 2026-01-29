---
description: How to deploy the NobleMart application to cPanel.
---

# Deploy Workflow

Follow these steps to deploy or update NobleMart on your cPanel server.

## // turbo-all
1. Verify the production API folder: `c:\Projects\NobleMart\Web\api`
2. Ensure `.env` is configured for the production database.
3. Check `.htaccess` rules for subdomain routing (`seller.noblemart.com.ng`).

## Steps
1. **API Deployment**:
   - Upload the `api/` folder to your Node.js application root in cPanel.
   - Install dependencies using the cPanel Node.js Selector (or run `npm install`).
   - Restart the Node.js application.

2. **Frontend Deployment**:
   - Upload `assets/`, `seller/`, `shop/`, and `index.html` to `public_html`.
   - Ensure the main `.htaccess` is in the `public_html` root.

3. **Database Import**:
   - If schema changed, import `noblemart_ddl.sql` via phpMyAdmin.

4. **Verification**:
   - Visit `https://noblemart.com.ng` to check the homepage.
   - Visit `https://api.noblemart.com.ng/health` to verify API connectivity.

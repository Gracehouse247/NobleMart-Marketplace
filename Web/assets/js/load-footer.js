document.addEventListener('DOMContentLoaded', () => {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    // Determine path depth relative to Web root
    // If pathname contains '/shop/', we are likely 1 level deep
    // If pathname is just '/' or '/index.html', we are at root.

    // Heuristic: check if 'phones-tablets.html' or 'shop' is in path.
    const isShop = window.location.pathname.includes('/shop/');
    const pathPrefix = isShop ? '../' : '';
    const componentPath = pathPrefix + 'components/global-footer.html';

    fetch(componentPath)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load footer component');
            return response.text();
        })
        .then(html => {
            // Fix asset paths by prefixing them with pathPrefix if not already absolute
            // We search for src="assets/ and href="assets/
            const fixedHtml = html.replace(/src="assets\//g, `src="${pathPrefix}assets/`)
                .replace(/href="assets\//g, `href="${pathPrefix}assets/`);

            footerPlaceholder.innerHTML = fixedHtml;
        })
        .catch(err => {
            console.error('Error loading global footer:', err);
            footerPlaceholder.innerHTML = '<p class="text-center p-4 text-red-500">Error loading footer. Please refresh.</p>';
        });
});

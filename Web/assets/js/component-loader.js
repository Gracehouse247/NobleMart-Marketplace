// Component Loader for Header and Footer
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Load Header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = `
            <header class="sticky top-0 z-50 w-full bg-white dark:bg-[#0c1c1d] border-b border-gray-100 dark:border-gray-800 shadow-sm">
                <div class="max-w-[1440px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-6">
                    <div class="flex items-center gap-2 shrink-0 cursor-pointer" onclick="window.location.href='/'">
                        <div class="size-10 brand-gradient rounded-full flex items-center justify-center text-white shadow-md">
                            <span class="material-symbols-outlined text-2xl">shopping_bag</span>
                        </div>
                        <h1 class="text-2xl font-extrabold tracking-tight text-[#0c1c1d] dark:text-white">NobleMart</h1>
                    </div>
                    
                    <div class="flex-1 max-w-3xl hidden md:block">
                        <form action="/shop/category.html" method="GET" class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-gray-400 group-focus-within:text-primary">search</span>
                            </div>
                            <input name="search" class="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-3 pl-12 pr-24 focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-gray-700 transition-all text-sm outline-none placeholder:text-gray-400" placeholder="Search products, brands and categories" type="text"/>
                            <button type="submit" class="absolute inset-y-1 right-1 bg-secondary hover:bg-opacity-90 text-white rounded-full px-6 font-medium text-sm transition-colors">Search</button>
                        </form>
                    </div>

                    <div class="flex items-center gap-6 shrink-0">
                        <div class="hidden lg:flex items-center gap-6">
                            ${token ? `
                                <a class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary transition-colors" href="/customer/orders.html">
                                    <span class="material-symbols-outlined">person</span>
                                    <span>${user.full_name ? user.full_name.split(' ')[0] : 'Account'}</span>
                                </a>
                            ` : `
                                <a class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary transition-colors" href="/login.html">
                                    <span class="material-symbols-outlined">person</span>
                                    <span>Login</span>
                                </a>
                            `}
                            <a class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary transition-colors" href="/blog">
                                <span class="material-symbols-outlined">help</span>
                                <span>Blog</span>
                            </a>
                        </div>
                        <a href="/shop/cart.html" class="relative bg-primary/10 hover:bg-primary/20 text-primary p-3 rounded-full transition-all group">
                            <span class="material-symbols-outlined group-hover:scale-110 transition-transform">shopping_cart</span>
                            <span class="cart-badge absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-[#0c1c1d]" id="cart-badge" style="display:none;">0</span>
                        </a>
                        <a href="/seller/register_vendor.html" class="hidden sm:block bg-federal-blue text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all shadow-md">
                            Sell
                        </a>
                    </div>
                </div>
                <div class="bg-[#f8fafb] dark:bg-[#0c1c1d] border-b border-gray-100 dark:border-gray-800 py-2 hidden md:block">
                    <div class="max-w-[1440px] mx-auto px-6 flex gap-8 items-center overflow-x-auto scrollbar-hide">
                        <a href="/shop/category.html" class="text-xs font-bold text-gray-600 hover:text-primary whitespace-nowrap uppercase tracking-wider">All Categories</a>
                        <a href="/properties" class="text-xs font-bold text-gray-600 hover:text-primary whitespace-nowrap uppercase tracking-wider">Real Estate</a>
                        <a href="/shop/category.html?category=electronics" class="text-xs font-bold text-gray-600 hover:text-primary whitespace-nowrap uppercase tracking-wider">Electronics</a>
                        <a href="/shop/category.html?category=fashion" class="text-xs font-bold text-gray-600 hover:text-primary whitespace-nowrap uppercase tracking-wider">Fashion</a>
                        <a href="/shop/category.html?category=computing" class="text-xs font-bold text-gray-600 hover:text-primary whitespace-nowrap uppercase tracking-wider">Computing</a>
                        <a href="/shop/category.html?category=home-office" class="text-xs font-bold text-gray-600 hover:text-primary whitespace-nowrap uppercase tracking-wider">Home & Office</a>
                    </div>
                </div>
            </header>
        `;
    }

    // Load Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        const isShop = window.location.pathname.includes('/shop/');
        const pathPrefix = isShop ? '../' : '';
        const componentPath = pathPrefix + 'components/global-footer.html';

        fetch(componentPath)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load footer component');
                return response.text();
            })
            .then(html => {
                const fixedHtml = html.replace(/src="assets\//g, `src="${pathPrefix}assets/`)
                    .replace(/href="assets\//g, `href="${pathPrefix}assets/`);
                footerPlaceholder.innerHTML = fixedHtml;
            })
            .catch(err => {
                console.error('Error loading global footer:', err);
            });
    }

    // Initialize Cart Badge
    updateCartBadge();
});

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

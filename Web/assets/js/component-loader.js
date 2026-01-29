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
        footerPlaceholder.innerHTML = `
            <footer class="bg-[#3e444a] text-gray-200 pt-16 pb-8 border-t border-gray-700">
                <div class="max-w-[1440px] mx-auto px-4 md:px-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div class="flex items-center gap-2 mb-6">
                                <div class="size-8 brand-gradient rounded-full flex items-center justify-center text-white">
                                    <span class="material-symbols-outlined text-lg">shopping_bag</span>
                                </div>
                                <h5 class="text-xl font-bold text-white">NobleMart</h5>
                            </div>
                            <p class="text-sm text-gray-400 mb-6 leading-relaxed">NobleMart is the #1 multi-vendor platform in Nigeria, connecting you with verified sellers for everything you need. Quality products, fast delivery.</p>
                            <div class="flex gap-4">
                                <a class="size-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1" href="#"><span class="material-symbols-outlined text-xl">public</span></a>
                                <a class="size-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1" href="#"><span class="material-symbols-outlined text-xl">thumb_up</span></a>
                                <a class="size-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1" href="#"><span class="material-symbols-outlined text-xl">camera_alt</span></a>
                            </div>
                        </div>
                        <div>
                            <h5 class="font-bold text-white text-base uppercase tracking-wider mb-6 border-b border-gray-600 pb-2 w-fit">Support</h5>
                            <ul class="space-y-3 text-sm font-medium text-gray-400">
                                <li><a class="hover:text-primary hover:pl-2 transition-all block" href="#">Help Center</a></li>
                                <li><a class="hover:text-primary hover:pl-2 transition-all block" href="#">How to Shop</a></li>
                                <li><a class="hover:text-primary hover:pl-2 transition-all block" href="#">Delivery Options</a></li>
                                <li><a class="hover:text-primary hover:pl-2 transition-all block" href="#">Return Policy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 class="font-bold text-white text-base uppercase tracking-wider mb-6 border-b border-gray-600 pb-2 w-fit">Business</h5>
                            <ul class="space-y-3 text-sm font-medium text-gray-400">
                                <li><a class="hover:text-primary hover:pl-2 transition-all block" href="/seller/register_vendor.html">Sell on NobleMart</a></li>
                                <li><a class="hover:text-primary hover:pl-2 transition-all block" href="#">Logistics Partner</a></li>
                                <li><a class="hover:text-primary hover:pl-2 transition-all block" href="#">Vendor Hub</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 class="font-bold text-white text-base uppercase tracking-wider mb-6 border-b border-gray-600 pb-2 w-fit">Contact</h5>
                            <ul class="space-y-4 text-sm font-medium text-gray-400">
                                <li class="flex items-start gap-3">
                                    <span class="material-symbols-outlined text-primary shrink-0">location_on</span>
                                    <span>Lagos, Nigeria</span>
                                </li>
                                <li class="flex items-center gap-3">
                                    <span class="material-symbols-outlined text-primary shrink-0">mail</span>
                                    <a class="hover:text-white transition-colors" href="mailto:help@noblemart.com.ng">help@noblemart.com.ng</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p class="text-xs text-gray-500">© ${new Date().getFullYear()} NobleMart Technologies Limited. All Rights Reserved.</p>
                        <div class="flex gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                            <span class="text-xs font-bold border border-gray-600 px-2 py-1 rounded">VISA</span>
                            <span class="text-xs font-bold border border-gray-600 px-2 py-1 rounded">MASTERCARD</span>
                            <span class="text-xs font-bold border border-gray-600 px-2 py-1 rounded">PAYSTACK</span>
                        </div>
                    </div>
                </div>
            </footer>
        `;
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

// NobleMart Responsive UI Enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Create mobile menu overlay
    createMobileMenu();
    createMobileSearch();
    setupMobileInteractions();
    optimizeResponsiveLayouts();
});

function createMobileMenu() {
    const body = document.body;

    // Create mobile menu overlay
    const overlay = document.createElement('div');
    overlay.id = 'mobile-menu-overlay';
    overlay.className = 'fixed inset-0 bg-black/50 z-50 hidden opacity-0 transition-opacity duration-300';

    const panel = document.createElement('div');
    panel.id = 'mobile-menu-panel';
    panel.className = 'absolute inset-y-0 left-0 w-[280px] bg-white dark:bg-[#0c1c1d] shadow-2xl transform transition-transform duration-300 -translate-x-full overflow-y-auto';

    panel.innerHTML = `
        <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#0c1c1d] z-10">
            <a href="/" class="flex items-center">
                <img src="assets/img/noblemart-logo.png" alt="NobleMart" class="h-8 w-auto object-contain" />
            </a>
            <button id="close-mobile-menu" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <div class="p-4">
            <div class="mb-4">
                <a href="/login.html" class="flex items-center gap-3 p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all">
                    <span class="material-symbols-outlined">person</span>
                    <span class="font-bold">Sign In / Register</span>
                </a>
            </div>
            <nav class="space-y-1" id="mobile-categories-nav">
                <!-- Categories will be loaded here -->
            </nav>
        </div>
    `;

    overlay.appendChild(panel);
    body.insertBefore(overlay, body.firstChild);

    // Add hamburger menu button to header if not exists
    const header = document.querySelector('header > div');
    if (header && !document.getElementById('mobile-menu-btn')) {
        const logoDiv = header.querySelector('div.flex.items-center.gap-2');
        const menuBtn = document.createElement('button');
        menuBtn.id = 'mobile-menu-btn';
        menuBtn.className = 'lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors -ml-2 mr-2';
        menuBtn.innerHTML = '<span class="material-symbols-outlined text-2xl">menu</span>';
        logoDiv.parentElement.insertBefore(menuBtn, logoDiv);
    }
}

function createMobileSearch() {
    const body = document.body;

    const searchOverlay = document.createElement('div');
    searchOverlay.id = 'mobile-search-overlay';
    searchOverlay.className = 'fixed inset-0 bg-white dark:bg-[#0c1c1d] z-50 hidden transform translate-y-full transition-transform duration-300';

    searchOverlay.innerHTML = `
        <div class="p-4">
            <div class="flex items-center gap-3 mb-4">
                <button id="close-mobile-search" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
                <h3 class="text-lg font-bold">Search Products</h3>
            </div>
            <form id="mobile-search-form" class="relative mb-6">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-gray-400">search</span>
                </div>
                <input id="mobile-search-input" class="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-secondary outline-none text-base" placeholder="What are you looking for?" type="text"/>
            </form>
            <div id="mobile-search-suggestions" class="space-y-2">
                <p class="text-sm text-gray-500 font-medium mb-3">Popular Searches</p>
                <a href="/shop/category.html?search=iphone" class="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span class="text-sm">iPhone</span>
                </a>
                <a href="/shop/category.html?search=laptop" class="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span class="text-sm">Laptops</span>
                </a>
                <a href="/shop/category.html?search=shoes" class="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span class="text-sm">Shoes</span>
                </a>
            </div>
        </div>
    `;

    body.insertBefore(searchOverlay, body.firstChild);

    // Add mobile search button to header
    const header = document.querySelector('header > div');
    if (header && !document.getElementById('mobile-search-btn')) {
        const actionsDiv = header.querySelector('div.flex.items-center.gap-4.shrink-0');
        const searchBtn = document.createElement('button');
        searchBtn.id = 'mobile-search-btn';
        searchBtn.className = 'md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors';
        searchBtn.innerHTML = '<span class="material-symbols-outlined text-2xl">search</span>';
        actionsDiv.insertBefore(searchBtn, actionsDiv.firstChild);
    }
}

function setupMobileInteractions() {
    // Mobile menu toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-mobile-menu');
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    const menuPanel = document.getElementById('mobile-menu-panel');

    if (menuBtn && menuOverlay && menuPanel) {
        menuBtn.addEventListener('click', () => {
            menuOverlay.classList.remove('hidden');
            setTimeout(() => {
                menuOverlay.classList.remove('opacity-0');
                menuPanel.classList.remove('-translate-x-full');
            }, 10);
            document.body.style.overflow = 'hidden';
        });

        const closeMobileMenu = () => {
            menuOverlay.classList.add('opacity-0');
            menuPanel.classList.add('-translate-x-full');
            setTimeout(() => {
                menuOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        };

        closeMenuBtn?.addEventListener('click', closeMobileMenu);
        menuOverlay.addEventListener('click', (e) => {
            if (e.target === menuOverlay) closeMobileMenu();
        });
    }

    // Mobile search toggle
    const searchBtn = document.getElementById('mobile-search-btn');
    const closeSearchBtn = document.getElementById('close-mobile-search');
    const searchOverlay = document.getElementById('mobile-search-overlay');
    const searchInput = document.getElementById('mobile-search-input');
    const searchForm = document.getElementById('mobile-search-form');

    if (searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.remove('hidden');
            setTimeout(() => {
                searchOverlay.classList.remove('translate-y-full');
                searchInput?.focus();
            }, 10);
            document.body.style.overflow = 'hidden';
        });

        const closeMobileSearch = () => {
            searchOverlay.classList.add('translate-y-full');
            setTimeout(() => {
                searchOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        };

        closeSearchBtn?.addEventListener('click', closeMobileSearch);

        searchForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/shop/category.html?search=${encodeURIComponent(query)}`;
            }
        });
    }

    // Load categories into mobile menu
    loadMobileCategories();
}

async function loadMobileCategories() {
    const nav = document.getElementById('mobile-categories-nav');
    if (!nav) return;

    try {
        const res = await fetch('https://api.noblemart.com.ng/categories');
        const categories = await res.json();

        if (categories && categories.length > 0) {
            nav.innerHTML = categories.map(cat => `
                <a href="/shop/category.html?category=${cat.id}" class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                    <span class="material-symbols-outlined text-gray-500 group-hover:text-secondary text-xl">${cat.icon || 'category'}</span>
                    <span class="font-medium text-gray-700 dark:text-gray-300 group-hover:text-secondary">${cat.name}</span>
                    <span class="material-symbols-outlined text-gray-400 ml-auto">chevron_right</span>
                </a>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load mobile categories:', err);
        nav.innerHTML = `
            <a href="/shop/category.html" class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <span class="material-symbols-outlined text-gray-500">category</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">All Categories</span>
            </a>
        `;
    }
}

function optimizeResponsiveLayouts() {
    // Optimize grid layouts for mobile
    const productGrids = document.querySelectorAll('.grid');
    productGrids.forEach(grid => {
        if (grid.classList.contains('grid-cols-2')) {
            // Already responsive
        }
    });

    // Add touch-friendly interactions
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }

    // Optimize images for mobile
    if (window.innerWidth < 768) {
        const images = document.querySelectorAll('img[src*="googleusercontent"]');
        images.forEach(img => {
            img.loading = 'lazy';
        });
    }
}

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Close mobile menus on desktop
        if (window.innerWidth >= 1024) {
            const menuOverlay = document.getElementById('mobile-menu-overlay');
            const searchOverlay = document.getElementById('mobile-search-overlay');
            if (menuOverlay) menuOverlay.classList.add('hidden');
            if (searchOverlay) searchOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }, 250);
});

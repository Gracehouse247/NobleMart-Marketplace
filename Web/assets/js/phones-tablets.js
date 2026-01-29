/**
 * NobleMart - Category Page Functionality
 * Handles dynamic product loading, filtering, and sorting for Phones & Tablets
 */

const API_BASE = 'https://api.noblemart.com.ng';
const PRODUCT_GRID_ID = 'product-grid-container'; // Need to add this ID to the grid in HTML
const PRODUCT_COUNT_ID = 'product-count';
const LOADER_ID = 'grid-loader';

// Initial state
let currentProducts = [];
let filters = {
    brands: [],
    priceRange: [0, 5000000],
    sort: 'recommended'
};

async function initCategoryPage() {
    const grid = document.querySelector('.grid-cols-1.sm:grid-cols-2.xl:grid-cols-3');
    if (grid) {
        grid.id = PRODUCT_GRID_ID;
        // Adding a loader
        grid.innerHTML = `
            <div id="${LOADER_ID}" class="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                <div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                <p class="text-slate-500 font-medium">Fetching premium devices...</p>
            </div>
        `;
    }

    // Load products from API
    await fetchProducts();

    // Setup Sort listeners
    setupSort();
}

async function fetchProducts() {
    try {
        // Fetching from both phones and tablets categories
        const endpoints = [
            `${API_BASE}/products?category=phones`,
            `${API_BASE}/products?category=tablets`
        ];

        const responses = await Promise.all(endpoints.map(url => fetch(url)));
        const dataSets = await Promise.all(responses.map(res => res.json()));

        // Combine and flatten
        currentProducts = dataSets.flat();

        if (currentProducts.length === 0) {
            showEmptyState();
        } else {
            renderProducts(currentProducts);
            updateCount(currentProducts.length);
        }
    } catch (err) {
        console.error('Failed to fetch products:', err);
        // Fallback to static content or show error
        const loader = document.getElementById(LOADER_ID);
        if (loader) {
            loader.innerHTML = `
                <div class="text-center p-8 bg-red-50 rounded-xl border border-red-100 dark:bg-red-900/10 dark:border-red-900/20">
                    <span class="material-symbols-outlined text-red-500 mb-2">error</span>
                    <p class="text-red-600 dark:text-red-400 font-medium">Unable to connect to NobleMart central catalog.</p>
                    <button onclick="location.reload()" class="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold">Try Again</button>
                </div>
            `;
        }
    }
}

function renderProducts(products) {
    const grid = document.getElementById(PRODUCT_GRID_ID);
    if (!grid) return;

    grid.innerHTML = products.map(product => {
        const discount = product.discount || 0;
        const originalPrice = product.price;
        const salePrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;

        return `
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 dark:hover:shadow-none transition-all duration-300 group relative flex flex-col">
                <div class="relative aspect-[4/5] overflow-hidden bg-slate-50 dark:bg-slate-900">
                    <div class="absolute top-3 left-3 z-10 flex flex-col gap-2">
                        ${product.is_official ? `<span class="backdrop-blur-md bg-white/90 dark:bg-black/60 text-slate-900 dark:text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20 shadow-sm">Official Store</span>` : ''}
                        ${product.is_new ? `<span class="backdrop-blur-md bg-blue-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20 shadow-sm">New</span>` : ''}
                        ${product.condition === 'renewed' ? `<span class="backdrop-blur-md bg-teal-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20 shadow-sm">Renewed</span>` : ''}
                    </div>
                    <button class="absolute top-3 right-3 z-10 size-9 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 hover:scale-110">
                        <span class="material-symbols-outlined text-[20px]">favorite</span>
                    </button>
                    <div class="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                         style="background-image: url('${product.image || 'https://via.placeholder.com/400x500'}');">
                    </div>
                </div>
                <div class="p-5 flex flex-col flex-1">
                    <h3 class="font-semibold text-sm md:text-base leading-snug mb-3 text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        ${product.name}
                    </h3>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${product.specs?.ram ? `<span class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-md text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">memory</span> ${product.specs.ram}</span>` : ''}
                        ${product.specs?.storage ? `<span class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-md text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">hard_drive</span> ${product.specs.storage}</span>` : ''}
                        ${product.specs?.battery ? `<span class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-md text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">battery_charging_full</span> ${product.specs.battery}</span>` : ''}
                    </div>

                    <div class="mt-auto flex items-end justify-between gap-4">
                        <div>
                            ${discount > 0 ? `<p class="text-xs text-slate-400 line-through mb-0.5 font-medium">₦${originalPrice.toLocaleString()}</p>` : ''}
                            <p class="text-lg md:text-xl font-extrabold text-primary">₦${salePrice.toLocaleString()}</p>
                        </div>
                        <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                           class="h-10 px-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-primary/20 hover:-translate-y-0.5">
                            Add <span class="material-symbols-outlined text-[16px]">shopping_cart</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateCount(count) {
    const countEl = document.querySelector('.text-slate-500.font-medium');
    if (countEl && countEl.textContent.includes('devices available')) {
        countEl.textContent = `${count.toLocaleString()} premium devices available`;
    }
}

function showEmptyState() {
    const grid = document.getElementById(PRODUCT_GRID_ID);
    if (!grid) return;
    grid.innerHTML = `
        <div class="col-span-full py-20 text-center">
            <span class="material-symbols-outlined text-6xl text-slate-200 mb-4 font-thin">search_off</span>
            <p class="text-slate-500 font-bold italic">No matching devices found in our current inventory.</p>
        </div>
    `;
}

function setupSort() {
    // Implement sort logic based on the Sort by: Recommended button
}

// Global addToCart function (to be shared)
window.addToCart = function (product) {
    let cart = JSON.parse(localStorage.getItem('nm_cart') || '[]');
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('nm_cart', JSON.stringify(cart));
    // Trigger event for header to update
    window.dispatchEvent(new Event('cartUpdated'));

    // Simple toast or alert
    alert(`${product.name} added to cart!`);
};

document.addEventListener('DOMContentLoaded', initCategoryPage);

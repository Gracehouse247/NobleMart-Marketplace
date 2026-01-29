document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category');
    const searchQuery = urlParams.get('search');

    const productGrid = document.getElementById('product-grid');
    const categoryTitle = document.getElementById('category-title');
    const currentCategoryLabel = document.getElementById('current-category-label');
    const filterCategoryList = document.getElementById('filter-category-list');

    // Initial Load
    loadFilters();
    loadProducts();

    // Event Listeners
    document.getElementById('sort-select')?.addEventListener('change', loadProducts);
    document.getElementById('apply-filters')?.addEventListener('click', loadProducts);

    async function loadFilters() {
        try {
            const res = await fetch('https://api.noblemart.com.ng/categories');
            const categories = await res.json();

            if (filterCategoryList) {
                filterCategoryList.innerHTML = categories.map(cat => `
                    <a href="/shop/category.html?category=${cat.id}" class="flex items-center justify-between hover:text-primary transition-all group ${categoryId == cat.id ? 'text-primary font-bold' : ''}">
                        <span>${cat.name}</span>
                        <span class="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </a>
                `).join('');
            }

            if (categoryId) {
                const activeCat = categories.find(c => c.id == categoryId);
                if (activeCat) {
                    categoryTitle.innerHTML = `${activeCat.name} <span class="text-primary italic">Collection</span>`;
                    currentCategoryLabel.textContent = activeCat.name;
                    document.title = `${activeCat.name} | NobleMart`;
                }
            } else if (searchQuery) {
                categoryTitle.innerHTML = `Search: <span class="text-primary italic">"${searchQuery}"</span>`;
                currentCategoryLabel.textContent = 'Search Results';
            }
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    }

    async function loadProducts() {
        if (productGrid) productGrid.innerHTML = '<div class="col-span-full py-20 text-center text-gray-400 font-bold italic">Loading premium products...</div>';

        const sort = document.getElementById('sort-select')?.value;
        const minPrice = document.getElementById('min-price')?.value;
        const maxPrice = document.getElementById('max-price')?.value;

        let apiUrl = `https://api.noblemart.com.ng/products/all?`;
        if (categoryId) apiUrl += `category=${categoryId}&`;
        if (searchQuery) apiUrl += `search=${encodeURIComponent(searchQuery)}&`;
        if (sort) apiUrl += `sort=${sort}&`;
        if (minPrice) apiUrl += `minPrice=${minPrice}&`;
        if (maxPrice) apiUrl += `maxPrice=${maxPrice}&`;

        try {
            const res = await fetch(apiUrl);
            const products = await res.json();

            if (products.length === 0) {
                productGrid.innerHTML = '<div class="col-span-full py-20 text-center"><span class="material-symbols-outlined text-6xl text-gray-200 mb-4">search_off</span><p class="text-gray-400 font-bold italic">No products found matching your criteria.</p></div>';
            } else {
                productGrid.innerHTML = products.map(prod => {
                    const firstImage = prod.images ? JSON.parse(prod.images)[0] : 'https://placehold.co/400x400?text=No+Image';
                    const discount = prod.old_price ? Math.round((prod.old_price - prod.price) / prod.old_price * 100) : 0;

                    return `
                        <div class="group bg-white rounded-3xl p-4 border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full cursor-pointer" onclick="window.location.href='/shop/product.html?id=${prod.id}'">
                            <div class="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-5">
                                <img src="${firstImage}" alt="${prod.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                                ${discount > 0 ? `<span class="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">-${discount}%</span>` : ''}
                                <button class="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                                    <span class="material-symbols-outlined text-sm">favorite</span>
                                </button>
                            </div>
                            <div class="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest mb-2">
                                <span class="material-symbols-outlined text-[12px]">verified</span>
                                NobleShield Verified
                            </div>
                            <h3 class="text-sm font-bold text-[#0c1c1d] line-clamp-2 mb-3 h-10 group-hover:text-primary transition-colors">${prod.name}</h3>
                            <div class="mt-auto">
                                <div class="flex items-baseline gap-2 mb-4">
                                    <span class="text-xl font-black text-primary italic">₦${parseFloat(prod.price).toLocaleString()}</span>
                                    ${prod.old_price ? `<span class="text-xs text-gray-300 line-through font-bold">₦${parseFloat(prod.old_price).toLocaleString()}</span>` : ''}
                                </div>
                                <button onclick="event.stopPropagation(); Cart.add(${prod.id}, '${prod.name.replace(/'/g, "\\'")}', ${prod.price}, '${firstImage}')" 
                                    class="w-full bg-gray-50 text-[#0c1c1d] font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-gray-100 group-hover:border-primary group-hover:shadow-lg">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (err) {
            console.error('Error loading products:', err);
            productGrid.innerHTML = '<div class="col-span-full py-20 text-center text-red-500 font-bold">Failed to load products. Please check your connection.</div>';
        }
    }
});

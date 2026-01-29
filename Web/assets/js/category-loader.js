document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('category-sidebar');
    const headerSearch = document.getElementById('header-search-form'); // In case it's in component-loader

    // Load Categories for Sidebar
    if (sidebar) {
        sidebar.innerHTML = '<div class="p-4 text-xs font-bold text-gray-300 animate-pulse uppercase tracking-widest">Identifying Collections...</div>';

        fetch('https://api.noblemart.com.ng/categories')
            .then(res => res.json())
            .then(categories => {
                if (categories.length > 0) {
                    sidebar.innerHTML = categories.map(cat => `
                        <a href="/shop/category.html?category=${cat.id}" class="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-primary transition-all group">
                            <div class="flex items-center gap-3">
                                <span class="material-symbols-outlined text-[20px] text-gray-400 group-hover:text-primary transition-colors">${cat.icon || 'category'}</span>
                                <span class="text-sm font-bold uppercase tracking-wider">${cat.name}</span>
                            </div>
                            <span class="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">chevron_right</span>
                        </a>
                    `).join('');
                } else {
                    sidebar.innerHTML = '<div class="p-4 text-xs text-gray-400 italic">No categories available.</div>';
                }
            })
            .catch(err => {
                console.error('Error loading categories:', err);
                sidebar.innerHTML = '<div class="p-4 text-xs text-red-400 italic font-bold">Failed to load categories.</div>';
            });
    }

    // Handle Search in Header/Hero
    const searchForms = document.querySelectorAll('form[action="/shop/category.html"]');
    searchForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const input = form.querySelector('input[name="search"]');
            if (input && !input.value.trim()) {
                e.preventDefault();
            }
        });
    });
});

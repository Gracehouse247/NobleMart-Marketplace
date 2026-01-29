// NobleMart Homepage Dynamic Features
const API_BASE = 'https://api.noblemart.com.ng';

// Update cart badge
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('nm_cart') || '[]');
    const badges = document.querySelectorAll('.cart-badge, [class*="cart"] span[class*="badge"]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    badges.forEach(badge => {
        if (badge) badge.textContent = count || '0';
    });
}

// Load categories into sidebar
async function loadCategories() {
    const sidebar = document.querySelector('aside nav');
    if (!sidebar) return;

    try {
        const res = await fetch(`${API_BASE}/categories`);
        const categories = await res.json();

        if (categories && categories.length > 0) {
            sidebar.innerHTML = categories.slice(0, 11).map(cat => `
                <a class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-secondary transition-all group" 
                   href="/shop/category.html?category=${cat.id}">
                    <span class="material-symbols-outlined text-gray-500 group-hover:text-secondary text-[18px]">${cat.icon || 'category'}</span>
                    <span class="font-normal text-gray-700 dark:text-gray-300">${cat.name}</span>
                </a>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load categories:', err);
    }
}

// Load products for a section
async function loadProductSection(sectionId, endpoint, limit = 6) {
    const section = document.querySelector(`#${sectionId} .grid`);
    if (!section) return;

    try {
        const res = await fetch(`${API_BASE}${endpoint}?limit=${limit}`);
        const products = await res.json();

        if (products && products.length > 0) {
            section.innerHTML = products.map(product => createProductCard(product)).join('');
        }
    } catch (err) {
        console.error(`Failed to load ${sectionId}:`, err);
    }
}

// Create product card HTML
function createProductCard(product) {
    const discount = product.discount || 0;
    const originalPrice = product.price;
    const salePrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;

    return `
        <div class="group relative flex flex-col p-3 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800 cursor-pointer"
             onclick="window.location.href='/shop/product.html?id=${product.id}'">
            <div class="relative aspect-square overflow-hidden mb-2">
                <div class="w-full h-full bg-center bg-contain bg-no-repeat group-hover:scale-105 transition-transform duration-500" 
                     style="background-image: url('${product.image || product.images?.[0] || 'https://via.placeholder.com/300'}');"></div>
                ${discount > 0 ? `<span class="absolute top-0 right-0 bg-[#feefde] text-[#f68b1e] text-[12px] font-bold px-2 py-0.5 rounded-sm">-${discount}%</span>` : ''}
            </div>
            <div class="flex flex-col flex-1 gap-1">
                <p class="text-[13px] leading-snug text-gray-700 dark:text-gray-300 line-clamp-2">${product.name}</p>
                <div class="flex flex-col gap-0.5 mt-1">
                    <p class="text-base font-bold text-[#0c1c1d] dark:text-white font-sans">₦${salePrice.toLocaleString()}</p>
                    ${discount > 0 ? `<p class="text-xs text-gray-400 line-through">₦${originalPrice.toLocaleString()}</p>` : ''}
                </div>
                ${product.stock ? `
                <div class="mt-2">
                    <p class="text-[10px] text-gray-500 mb-1">${product.stock} items left</p>
                    <div class="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                        <div class="bg-secondary h-1.5 rounded-full" style="width: ${Math.min((product.stock / 100) * 100, 100)}%"></div>
                    </div>
                </div>` : ''}
            </div>
        </div>
    `;
}

// Setup search functionality
function setupSearch() {
    const searchForm = document.querySelector('header form, form[action*="search"]');
    const searchInput = document.querySelector('header input[type="text"]');

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/shop/category.html?search=${encodeURIComponent(query)}`;
            }
        });
    }
}

// Setup account dropdown
function setupAccountMenu() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const accountLink = document.querySelector('a[href="#"]:has(.material-symbols-outlined:first-child)');

    if (accountLink && accountLink.textContent.includes('Account')) {
        if (token && user.full_name) {
            accountLink.innerHTML = `
                <span class="material-symbols-outlined text-[24px]">person</span>
                <span class="hidden xl:inline">${user.full_name.split(' ')[0]}</span>
                <span class="material-symbols-outlined text-[20px]">expand_more</span>
            `;
            accountLink.href = user.role === 'vendor' ? '/seller' : '/customer';
        } else {
            accountLink.href = '/login.html';
        }
    }
}

// Setup cart button
function setupCartButton() {
    const cartBtn = document.querySelector('button:has(.material-symbols-outlined)');
    if (cartBtn && cartBtn.textContent.includes('Cart')) {
        cartBtn.onclick = () => window.location.href = '/shop/cart.html';
    }
}

// Flash sale countdown timer
function startFlashSaleTimer() {
    const timerEl = document.querySelector('.flash-sale-header .flex.gap-1');
    if (!timerEl) return;

    // Set end time to 6 hours from now (or fetch from API)
    const endTime = new Date().getTime() + (6 * 60 * 60 * 1000);

    setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
            timerEl.innerHTML = '<span>00h</span> : <span>00m</span> : <span>00s</span>';
            return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timerEl.innerHTML = `
            <span>${String(hours).padStart(2, '0')}h</span> : 
            <span>${String(minutes).padStart(2, '0')}m</span> : 
            <span>${String(seconds).padStart(2, '0')}s</span>
        `;
    }, 1000);
}

// Hero slider functionality
function setupHeroSlider() {
    const sliderContainer = document.getElementById('hero-slider');
    const slidesWrapper = document.getElementById('hero-slides-wrapper');
    const dotsContainer = document.getElementById('hero-dots');
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');

    if (!sliderContainer || !slidesWrapper) return;

    // Banner config - mapped to categories
    // Linking to category pages as requested
    const banners = [
        { img: 'assets/img/banners/1.png', link: '/shop/category.html?category=electronics' },
        { img: 'assets/img/banners/2.png', link: '/shop/category.html?category=fashion' },
        { img: 'assets/img/banners/3.png', link: '/shop/category.html?category=phones' },
        { img: 'assets/img/banners/4.png', link: '/shop/category.html?category=computing' },
        { img: 'assets/img/banners/5.png', link: '/shop/category.html?category=appliances' },
        { img: 'assets/img/banners/6.png', link: '/shop/category.html?category=health-beauty' },
        { img: 'assets/img/banners/7.png', link: '/shop/category.html?category=home-office' },
        { img: 'assets/img/banners/8.png', link: '/shop/category.html?category=gaming' },
        { img: 'assets/img/banners/9.png', link: '/shop/category.html?category=baby-products' },
        { img: 'assets/img/banners/10.png', link: '/shop/category.html?category=supermarket' }
    ];

    // clear loading spinner
    slidesWrapper.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Create Slides
    banners.forEach((banner, index) => {
        const slide = document.createElement('a');
        slide.href = banner.link;
        slide.className = `hero-slide absolute inset-0 w-full h-full block bg-cover bg-center transition-opacity duration-500 ease-in-out ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`;
        slide.style.backgroundImage = `url('${banner.img}')`;
        // ensure images are loaded improperly
        slide.setAttribute('aria-label', `Banner ${index + 1}`);
        slidesWrapper.appendChild(slide);

        // Create Dot
        const dot = document.createElement('button');
        dot.className = `w-2.5 h-2.5 rounded-full transition-all border border-transparent ${index === 0 ? 'bg-secondary border-white' : 'bg-white/50 hover:bg-white'}`;
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });

    let currentSlide = 0;
    let slideInterval;
    const slides = document.querySelectorAll('.hero-slide');
    const dots = dotsContainer.querySelectorAll('button');

    function updateClasses() {
        slides.forEach((slide, i) => {
            if (i === currentSlide) {
                slide.classList.remove('opacity-0', 'z-0');
                slide.classList.add('opacity-100', 'z-10');
            } else {
                slide.classList.remove('opacity-100', 'z-10');
                slide.classList.add('opacity-0', 'z-0');
            }
        });

        dots.forEach((dot, i) => {
            if (i === currentSlide) {
                dot.className = 'w-2.5 h-2.5 rounded-full transition-all bg-secondary border border-white';
            } else {
                dot.className = 'w-2.5 h-2.5 rounded-full transition-all bg-white/50 hover:bg-white';
            }
        });
    }

    function goToSlide(index) {
        currentSlide = index;
        updateClasses();
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % banners.length;
        updateClasses();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + banners.length) % banners.length;
        updateClasses();
    }

    // Attach button listeners
    if (prevBtn) prevBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
    };

    if (nextBtn) nextBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
    };

    // Auto-slide logic
    function startSlideInterval() {
        slideInterval = setInterval(nextSlide, 5000); // 5 seconds
    }

    function stopSlideInterval() {
        clearInterval(slideInterval);
    }

    // Initialize auto-slide
    startSlideInterval();

    // Pause on hover
    sliderContainer.addEventListener('mouseenter', stopSlideInterval);
    sliderContainer.addEventListener('mouseleave', startSlideInterval);
}

// Top Categories functionality
// Top Categories functionality
function setupTopCategories() {
    const track = document.getElementById('top-categories-track');
    const prevBtn = document.getElementById('tc-prev');
    const nextBtn = document.getElementById('tc-next');

    if (!track) return;

    // Config: 16 items
    const categories = [
        { name: "Electrical Lights", img: "Electrical Lights.png" },
        { name: "Fragrances", img: "Fragrances.png" },
        { name: "Mattresses", img: "Mattress.png" },
        { name: "Men's Boots", img: "men boots shoes.png" },
        { name: "Men's Clothing", img: "Men's Clothing.png" },
        { name: "Men's Perfumes", img: "Men's Fragrances.png" },
        { name: "Musical Instruments", img: "Musical Instruments.png" },
        { name: "Sporting Goods", img: "Sporting Goods.png" },
        { name: "Women's Fashion", img: "Women Fashion.png" },
        { name: "Women's Perfumes", img: "Women Fragrances.png" },
        { name: "Wristwatches", img: "Wristwatches.png" },
        { name: "Special Offers", img: "Revised (3).png" },
        { name: "New Arrivals", img: "Revised (4).png" },
        { name: "Best Sellers", img: "Revised (5).png" },
        { name: "Clearance", img: "Revised (6).png" },
        { name: "Trending", img: "Revised (8).png" }
    ];

    // Render Items
    // Mobile: 4 items (w-1/4 = 25%)
    // Desktop: 8 items (w-[12.5%] = 12.5%)
    track.innerHTML = categories.map(cat => `
        <div class="flex-shrink-0 w-1/4 lg:w-[12.5%] px-2">
            <a href="/shop/category.html?search=${encodeURIComponent(cat.name)}" class="group flex flex-col items-center gap-2 cursor-pointer transition-transform hover:-translate-y-1 h-full">
                <div class="w-full aspect-square rounded-full border-2 border-gray-100 dark:border-gray-700 p-1 bg-white dark:bg-gray-800 shadow-sm group-hover:border-secondary transition-colors overflow-hidden">
                    <img src="assets/img/top-categories/${cat.img}" alt="${cat.name}" class="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500">
                </div>
                <span class="text-xs text-center font-medium text-gray-700 dark:text-gray-300 group-hover:text-secondary line-clamp-2 leading-tight">${cat.name}</span>
            </a>
        </div>
    `).join('');

    // Carousel State
    let currentIndex = 0;
    const totalItems = categories.length; // 16
    const step = 2; // Move 2 items at a time

    function getItemsVisible() {
        return window.innerWidth >= 1024 ? 8 : 4;
    }

    function updateCarousel() {
        const visible = getItemsVisible();
        const maxIndex = totalItems - visible;

        // Clamp index
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > maxIndex) currentIndex = maxIndex;

        // Translate
        // Percentage to move = currentIndex * (100 / visible)
        const translatePercent = -(currentIndex * (100 / visible));
        track.style.transform = `translateX(${translatePercent}%)`;

        // Update Buttons
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
            prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '';
        }
        if (nextBtn) {
            nextBtn.disabled = currentIndex >= maxIndex;
            nextBtn.style.opacity = currentIndex >= maxIndex ? '0.3' : '';
        }
    }

    // Event Listeners
    if (nextBtn) nextBtn.onclick = () => {
        const visible = getItemsVisible();
        const maxIndex = totalItems - visible;
        if (currentIndex < maxIndex) {
            currentIndex = Math.min(currentIndex + step, maxIndex);
            updateCarousel();
        }
    };

    if (prevBtn) prevBtn.onclick = () => {
        if (currentIndex > 0) {
            currentIndex = Math.max(currentIndex - step, 0);
            updateCarousel();
        }
    };

    // Handle Resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateCarousel();
        }, 200);
    });

    // Initial state
    updateCarousel();
}

// Weekly Rotating Categories
function setupWeeklyCategories() {
    const grid = document.getElementById('weekly-category-grid');
    if (!grid) return;

    // All available dynamic images
    const allImages = [
        "Computers.png", "Electrical Lights.png", "Fragrances.png", "Fridges.png",
        "Gas Cooker.png", "Glasses.png", "Hair Care.png", "Hairs.png",
        "Health & Beauty Services.png", "Health & Beauty.png", "Health Care.png",
        "Home & Office.png", "Kids Fashion.png", "Ladies Traditional Wears.png",
        "Mattress.png", "Men Shoes.png", "Men's Fashion.png", "Men's Fragrances.png",
        "Mobile Phones.png", "Musical Instruments.png", "Necklace.png", "Shoes.png",
        "Skincare Products.png", "Smart TVs.png", "Smart watches.png", "Sneakers.png",
        "Soundbars.png", "Sporting Goods.png", "Suites.png", "Washing Machine.png",
        "Women Fashion (2).png", "Women Fashion.png", "Women Fragrances.png",
        "Women shoes.png", "Wristwatches.png", "men boots shoes.png"
    ];

    // Week calculation (Rotate every Sunday)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const weekNum = Math.floor(dayOfYear / 7);

    // We have 36 items, showing 12 at a time -> 3 sets
    const totalSets = Math.floor(allImages.length / 12);
    const setIndex = weekNum % totalSets;
    const startIndex = setIndex * 12;

    // Select 12 items
    const selectedImages = allImages.slice(startIndex, startIndex + 12);

    grid.innerHTML = selectedImages.map((img, i) => {
        let name = img.replace(/\.(png|jpg|jpeg)$/i, '');
        // Clean name: "Women Fashion (2)" -> "Women Fashion"
        name = name.replace(/\s*\(\d+\)$/, '');

        // Items 7-12 (index 6-11) hidden on mobile (<768px)
        const visibility = i >= 6 ? 'hidden md:flex' : 'flex';

        return `
        <a href="/shop/category.html?search=${encodeURIComponent(name)}" class="group ${visibility} flex-col items-center gap-2 cursor-pointer transition-transform hover:-translate-y-1">
            <div class="w-full aspect-square rounded-md overflow-hidden bg-gray-50 dark:bg-gray-800 relative shadow-sm group-hover:shadow-md transition-all">
                <img src="assets/img/dynamic product category/${img}" 
                     alt="${name}" 
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     loading="lazy">
            </div>
            <span class="text-[13px] text-center font-normal text-gray-700 dark:text-gray-300 group-hover:text-secondary line-clamp-2 leading-tight px-1">${name}</span>
        </a>
        `;
    }).join('');
}

// Best Selling Categories (Weekly Rotation)
function setupBestSellingCategories() {
    const grid = document.getElementById('best-selling-grid');
    if (!grid) return;

    // All available "best selling" images
    const allImages = [
        "57.png", "69.png", "Accessories.png", "Boy's fashion.png", "Clothing.png",
        "Dresses.png", "Face Protection.png", "Female Jeans.png", "Female Trousers.png",
        "Flat.png", "Fragrances.png", "Girl's Fashion.png", "Hair & wigs.png",
        "Hair Accessories.png", "Hair Cutting Tools.png", "Handbags & Wallets.png",
        "Healthy care.png", "Jewelry.png", "Jewerly.png", "Ladies Traditional Wears.png",
        "Luggage & Travel Gear.png", "Maternity.png", "Mattress.png", "Men's  Fragrance.png",
        "Men's Clothing.png", "Men's Fragrances.png", "Men's Grooming.png",
        "Men's Shoes.png", "Men's accessories.png", "Men’s Watches.png",
        "Musical Instruments.png", "Natural SKINCAREProducts.png", "Natural's product.png",
        "SANDALS.png", "Shampoo & Conditioners.png", "Shoes.png", "Skincare Products.png",
        "Slar Power.png", "Slippers.png", "Smart watch.png", "Sneaker's.png",
        "Sneakers.png", "Thermometers.png", "Traditional & Cultural Wears.png",
        "Traditional women.png", "Umbrella.png", "Under wears & Sleepwear's.png",
        "Wellness and Self-Care.png", "Wigs & Accessories.png", "Women Fashion.png",
        "Women Fragrances.png", "Women shoes.png", "Women's Fragrance.png",
        "Women's Sunglasses.png", "Wristwatches.png", "makeup (2).png", "makeup (3).png",
        "makeup.png", "men boots shoes.png", "shampoos.png", "skin-care.png",
        "suits.png", "vitamins and supplement.png"
    ];

    // Week calculation (to ensure it changes every Sunday)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const weekNum = Math.floor(dayOfYear / 7);

    // Rotate through sets of 12
    const totalSets = Math.floor(allImages.length / 12);
    const setIndex = weekNum % totalSets;
    const startIndex = setIndex * 12;

    // Select 12 items
    const selectedImages = allImages.slice(startIndex, startIndex + 12);

    grid.innerHTML = selectedImages.map((img, i) => {
        let name = img.replace(/\.(png|jpg|jpeg)$/i, '');
        // Clean name variants: "makeup (2)" -> "makeup"
        name = name.replace(/\s*\(\d+\)$/, '');
        // Standardize: "Jewerly" -> "Jewelry", "Slar" -> "Solar"
        if (name === 'Jewerly') name = 'Jewelry';
        if (name === 'Slar Power') name = 'Solar Power';

        // Hide items 7-12 on mobile
        const visibilityClass = i >= 6 ? 'hidden md:flex' : 'flex';

        return `
        <div class="${visibilityClass} bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow group cursor-pointer text-center flex flex-col items-center">
            <a href="/shop/category.html?search=${encodeURIComponent(name)}" class="w-full">
                <div class="aspect-square rounded-md overflow-hidden bg-gray-50 mb-3">
                    <img alt="${name}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                         src="assets/img/best selling categories/${img}"
                         loading="lazy">
                </div>
                <p class="text-xs font-['Poppins'] text-gray-700 dark:text-gray-300 group-hover:text-secondary truncate w-full px-1">${name}</p>
            </a>
        </div>
        `;
    }).join('');
}

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', async () => {
    updateCartBadge();
    setupSearch();
    setupAccountMenu();
    setupCartButton();
    startFlashSaleTimer();
    setupHeroSlider();
    setupTopCategories();
    setupWeeklyCategories();
    setupBestSellingCategories();

    // Load dynamic content
    await loadCategories();

    // Load product sections from live API
    await loadProductSection('flash-sales-section', '/products/flash-sales', 6);
    await loadProductSection('top-sellers-section', '/products/top-sellers', 6);
    await loadProductSection('limited-stock-section', '/products/limited-stock', 18);
    // await loadProductSection('phone-deals', '/products?category=phones', 6);
});

// Listen for cart updates
window.addEventListener('storage', (e) => {
    if (e.key === 'nm_cart') {
        updateCartBadge();
    }
});

document.addEventListener('cartUpdated', updateCartBadge);

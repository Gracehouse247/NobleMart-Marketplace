# Hero Slider Implementation

## Overview
A dynamic, auto-sliding hero banner system has been implemented on the NobleMart homepage. This system uses 10 banner images located in `assets/img/banners/` and links each to a specific product category.

## Features
- **Dynamic Content**: Banners are loaded dynamically via JavaScript.
- **Auto-Sliding**: Slides automatically advance every 5 seconds.
- **Hover Pause**: Auto-sliding stops when the user hovers over the slider, and resumes when they leave.
- **Navigation**:
    - **Arrows**: Previous/Next buttons to manually navigate.
    - **Dots**: Bottom indicators to jump to a specific slide.
- **Responsive**: Adapts to different screen sizes (height adjusts from 280px to 384px).
- **Smooth Transitions**: Crossfade effect between slides.

## Banner Mapping
Each banner is mapped to a specific category link:

| Banner Image | Target Category | Link |
| :--- | :--- | :--- |
| `1.png` | Electronics | `/shop/category.html?category=electronics` |
| `2.png` | Fashion | `/shop/category.html?category=fashion` |
| `3.png` | Phones | `/shop/category.html?category=phones` |
| `4.png` | Computing | `/shop/category.html?category=computing` |
| `5.png` | Appliances | `/shop/category.html?category=appliances` |
| `6.png` | Health & Beauty | `/shop/category.html?category=health-beauty` |
| `7.png` | Home & Office | `/shop/category.html?category=home-office` |
| `8.png` | Gaming | `/shop/category.html?category=gaming` |
| `9.png` | Baby Products | `/shop/category.html?category=baby-products` |
| `10.png` | Supermarket | `/shop/category.html?category=supermarket` |

## Technical Implementation

### HTML Structure (`index.html`)
The slider container is defined with ID `#hero-slider`. Inside, `#hero-slides-wrapper` holds the dynamically injected slides, and `#hero-dots` holds the navigation dots.

### JavaScript Logic (`assets/js/home.js`)
The `setupHeroSlider()` function handles:
1.  **Initialization**: Clears placeholders and creates slide elements from the `banners` array.
2.  **State Management**: Tracks `currentSlide` index.
3.  **Class Updates**: Toggles `opacity-0`/`opacity-100` and `z-index` classes for transitions.
4.  **Auto-Play**: Uses `setInterval` for timing.
5.  **Event Listeners**:
    - `mouseenter` on `#hero-slider` calls `clearInterval`.
    - `mouseleave` on `#hero-slider` calls `setInterval`.
    - Click events on arrows and dots for manual navigation.

## Usage
To update banners, simply replace the images in `assets/img/banners/` ensuring the filenames (`1.png` to `10.png`) remain the same. To change links, update the `banners` array in `assets/js/home.js`.

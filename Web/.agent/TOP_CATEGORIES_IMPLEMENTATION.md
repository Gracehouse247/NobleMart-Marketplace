# Top Categories Implementation

## Overview
A dynamic "Top Categories" carousel has been implemented on the homepage. This section displays 16 category items in a sliding rail, optimized for different screen sizes.

## Features
- **Responsive Carousel**:
    - **Desktop**: Shows 8 items at once.
    - **Mobile**: Shows 4 items at once.
- **Navigation**:
    - **Next/Prev Buttons**: Slide the carousel by 2 items at a time.
    - Buttons are disabled when reaching the start or end.
- **Dynamic Content**: Categories are loaded via JavaScript (`home.js`).
- **Interactive**: Hover effects on images and text.
- **Search Integration**: Clicking a category searches for that term.

## HTML Structure
The container uses `overflow-hidden` to mask the sliding track (`#top-categories-track`). Items are sized using percentage widths (`25%` for mobile, `12.5%` for desktop) to ensure exact fitting.
The items are displayed as circular icons with labels.

| Image File | Display Name | Link Target |
| :--- | :--- | :--- |
| `Electrical Lights.png` | Electrical Lights | `?search=Electrical%20Lights` |
| `Fragrances.png` | Fragrances | `?search=Fragrances` |
| `Mattress.png` | Mattresses | `?search=Mattresses` |
| `men boots shoes.png` | Men's Boots | `?search=Men%27s%20Boots` |
| `Men's Clothing.png` | Men's Clothing | `?search=Men%27s%20Clothing` |
| `Men's Fragrances.png` | Men's Perfumes | `?search=Men%27s%20Perfumes` |
| `Musical Instruments.png` | Musical Instruments | `?search=Musical%20Instruments` |
| `Sporting Goods.png` | Sporting Goods | `?search=Sporting%20Goods` |
| `Women Fashion.png` | Women's Fashion | `?search=Women%27s%20Fashion` |
| `Women Fragrances.png` | Women's Perfumes | `?search=Women%27s%20Perfumes` |
| `Wristwatches.png` | Wristwatches | `?search=Wristwatches` |
| `Revised (3).png` | Special Offers | `?search=Special%20Offers` |
| `Revised (4).png` | New Arrivals | `?search=New%20Arrivals` |
| `Revised (5).png` | Best Sellers | `?search=Best%20Sellers` |
| `Revised (6).png` | Clearance | `?search=Clearance` |
| `Revised (8).png` | Trending | `?search=Trending` |

## How to Customize
To change the label or image for a category, edit the `categories` array in `assets/js/home.js`:

```javascript
const categories = [
    { name: "My New Category", img: "my-image.png" },
    // ...
];
```

Ensure new images are placed in `assets/img/top-categories/`.

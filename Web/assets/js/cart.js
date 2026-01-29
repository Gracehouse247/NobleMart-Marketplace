const Cart = {
    items: JSON.parse(localStorage.getItem('nm_cart')) || [],

    save() {
        localStorage.setItem('nm_cart', JSON.stringify(this.items));
        this.updateBadge();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    },

    addItem(product) {
        const id = product.id;
        const existing = this.items.find(item => item.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                vendor_id: product.vendor_id || 1,
                vendor_name: product.vendor_name || 'NobleMart Seller',
                quantity: 1
            });
        }
        this.save();
        this.showToast(`${product.name} added to cart!`);
    },

    add(id, name, price, image, vendor_id = 1, vendor_name = 'NobleMart Seller') {
        this.addItem({ id, name, price, image, vendor_id, vendor_name });
    },

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    },

    updateQuantity(id, qty) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(1, qty);
            this.save();
        }
    },

    clear() {
        this.items = [];
        this.save();
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    updateBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        badges.forEach(b => {
            if (b) {
                b.textContent = count;
                b.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    },

    showToast(msg) {
        let toast = document.querySelector('.cart-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'cart-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
};

// Initialize badges on load
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());

// CSS for the toast (should be in main.css but putting here for quick access)
const style = document.createElement('style');
style.textContent = `
    .cart-toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--federal-blue);
        color: white;
        padding: 1rem 2rem;
        border-radius: 1rem;
        box-shadow: var(--shadow-xl);
        transform: translateY(100px);
        opacity: 0;
        transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        z-index: 9999;
        font-weight: 600;
    }
    .cart-toast.show {
        transform: translateY(0);
        opacity: 1;
    }
`;
document.head.appendChild(style);

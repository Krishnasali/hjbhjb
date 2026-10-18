// ── Global Cart API ──────────────────────────────────────────
window.getCart = () => JSON.parse(localStorage.getItem('freshveg_cart')) || [];
window.saveCart = (cart) => {
    localStorage.setItem('freshveg_cart', JSON.stringify(cart));
    window.updateCartBadges();
};

window.updateCartBadges = () => {
    const cart = window.getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0);
    const badges = document.querySelectorAll('#cart-badge');
    badges.forEach(badge => {
        badge.innerText = totalItems;
        if (totalItems > 0) {
            badge.classList.remove('opacity-0');
        } else {
            badge.classList.add('opacity-0');
        }
    });
};

window.addToCartGlobal = (product) => {
    let cart = window.getCart();
    // Try to find by id first, then name
    const existing = cart.find(item => (product.id && item.id === product.id) || (item.name === product.name));
    
    if (existing) {
        existing.quantity = (existing.quantity || existing.qty || 0) + 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    window.saveCart(cart);
    window.showCartToast(product.name);
};

window.showCartToast = (name) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#006947] text-[#c8ffe0] px-6 py-3 rounded-full shadow-2xl z-[100] transform transition-all translate-y-20 opacity-0 flex items-center gap-2 font-bold whitespace-nowrap';
    toast.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Added ${name} to cart`;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-20', 'opacity-0');
    });
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
};

// ── Initializer ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    window.updateCartBadges();

    // ── Static Product Scraper ───────────────────────────────────
    const possibleCards = document.querySelectorAll('.card-3d, .group');
    possibleCards.forEach(card => {
        const buttons = card.querySelectorAll('button');
        buttons.forEach(btn => {
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) {
                const iconText = icon.innerText.trim();
                if (iconText === 'add' || iconText === 'add_shopping_cart') {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        const titleEl = card.querySelector('h3, h4');
                        const priceEl = card.querySelector('.text-2xl, p.text-primary.text-2xl');
                        const imgEl = card.querySelector('img');
                        
                        if (titleEl && priceEl) {
                            const name = titleEl.innerText.trim();
                            let priceText = priceEl.innerText.trim();
                            const priceTextNode = Array.from(priceEl.childNodes).find(n => n.nodeType === 3);
                            if (priceTextNode && priceTextNode.textContent.trim()) {
                                priceText = priceTextNode.textContent.trim();
                            }
                            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                            const image = imgEl ? imgEl.src : '';
                            
                            let desc = '';
                            const descEl = card.querySelector('p.text-sm:not(.line-through)');
                            if (descEl) {
                                desc = descEl.innerText.trim();
                            } else {
                                const unitEl = card.querySelector('span.text-sm, span.text-xs');
                                if (unitEl) desc = unitEl.innerText.trim();
                            }

                            window.addToCartGlobal({ name, price, image, desc });
                        }
                    });
                }
            }
        });
    });

    // ── Cart Page Logic ──────────────────────────────────────────
    const cartItemsContainer = document.getElementById('cart-items-container');
    if (!cartItemsContainer) return;

    const renderCart = () => {
        let cart = window.getCart();
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="p-8 text-center text-on-surface-variant"><p>Your cart is empty.</p></div>';
            updateCartSummary(cart);
            return;
        }

        cart.forEach(product => {
            const qty = product.quantity || product.qty || 1;
            const itemHtml = `
            <div class="group bg-surface-container-lowest rounded-xl p-6 flex flex-col md:flex-row items-center gap-8 transition-all hover:bg-surface-bright border-none">
                <div class="w-32 h-32 rounded-full overflow-hidden shrink-0 bg-surface-container shadow-inner flex items-center justify-center">
                    ${product.image ? `<img alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${product.image}"/>` : `<span class="text-4xl font-black text-primary/20">${(product.name || '?').charAt(0)}</span>`}
                </div>
                <div class="flex-grow text-center md:text-left">
                    <span class="text-xs font-semibold uppercase tracking-widest text-primary mb-1 block">Item</span>
                    <h3 class="text-xl font-bold text-on-surface">${product.name}</h3>
                    <p class="text-on-surface-variant text-sm mt-1">${product.desc || ''}</p>
                    <div class="mt-4 text-xl font-bold">₹${product.price}</div>
                </div>
                <div class="flex items-center gap-4 bg-surface-container-low p-2 rounded-full px-4">
                    <button class="cart-btn-minus w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm" data-name="${product.name}">
                        <span class="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span class="font-bold w-4 text-center">${qty}</span>
                    <button class="cart-btn-plus w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm" data-name="${product.name}">
                        <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>
                <div class="text-right shrink-0">
                    <div class="text-lg font-extrabold text-on-surface">₹${(product.price * qty).toFixed(2)}</div>
                    <button class="cart-btn-remove text-error text-xs font-semibold hover:underline mt-2 flex items-center justify-end gap-1" data-name="${product.name}">
                        <span class="material-symbols-outlined text-sm">delete</span> Remove
                    </button>
                </div>
            </div>`;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
        });

        updateCartSummary(cart);
        attachCartPageListeners();
    };

    const updateCartSummary = (cart) => {
        const subtotalEl = document.getElementById('cart-subtotal');
        if (!subtotalEl) return;
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || item.qty || 1)), 0);
        const tax = subtotal * 0.05;
        const total = subtotal + tax;
        
        subtotalEl.innerText = `₹${subtotal.toFixed(2)}`;
        document.getElementById('cart-tax').innerText = `₹${tax.toFixed(2)}`;
        document.getElementById('cart-total').innerText = `₹${total.toFixed(2)}`;
    };

    const attachCartPageListeners = () => {
        document.querySelectorAll('.cart-btn-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-name');
                let cart = window.getCart();
                const item = cart.find(i => i.name === name);
                if (item) {
                    item.quantity = (item.quantity || item.qty || 0) + 1;
                    window.saveCart(cart);
                    renderCart();
                }
            });
        });

        document.querySelectorAll('.cart-btn-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-name');
                let cart = window.getCart();
                const item = cart.find(i => i.name === name);
                if (item) {
                    item.quantity = (item.quantity || item.qty || 1) - 1;
                    if (item.quantity <= 0) {
                        cart = cart.filter(i => i.name !== name);
                    }
                    window.saveCart(cart);
                    renderCart();
                }
            });
        });

        document.querySelectorAll('.cart-btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-name');
                let cart = window.getCart().filter(i => i.name !== name);
                window.saveCart(cart);
                renderCart();
            });
        });
    };

    renderCart();
});

import { db } from './firebase-config.js';
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

(function () {
  // Which category does this page show?
  const scriptTag = document.querySelector('script[src*="vendor-listings.js"]');
  const pageCategory = scriptTag ? scriptTag.getAttribute('data-category') : null;

  function getGrid() {
    return document.querySelector('.grid') ||
           document.querySelector('.product-grid') ||
           document.querySelector('main section .grid') ||
           null;
  }

  // Global helper for the onclick - now using unified cart API
  window.addVendorToCart = function(id, name, price, unit) {
    if (typeof window.addToCartGlobal === 'function') {
        window.addToCartGlobal({ id, name, price: parseFloat(price), desc: unit });
    } else {
        console.error("Cart module not loaded yet.");
    }
  };

  function startRealtimeListings() {
    const listingsRef = collection(db, "listings");
    const q = pageCategory 
      ? query(listingsRef, where("category", "==", pageCategory))
      : listingsRef;

    onSnapshot(q, (snapshot) => {
      const listings = [];
      snapshot.forEach(doc => listings.push({ id: doc.id, ...doc.data() }));
      renderToUI(listings);
    });
  }

  function renderToUI(listings) {
    const grid = getGrid();
    if (!grid) return;

    // Remove old vendor items if any (those with data-vendor-item)
    grid.querySelectorAll('[data-vendor-item]').forEach(el => el.remove());
    const oldHeading = grid.querySelector('[data-vendor-heading]');
    if (oldHeading) oldHeading.remove();

    if (listings.length === 0) return;

    // Add a heading
    const heading = document.createElement('div');
    heading.className = 'col-span-full mt-4 mb-2';
    heading.setAttribute('data-vendor-heading', 'true');
    heading.innerHTML = `<div class="flex items-center gap-3"><span class="h-px flex-1 bg-outline-variant/30"></span><p class="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">From Local Vendors</p><span class="h-px flex-1 bg-outline-variant/30"></span></div>`;
    grid.appendChild(heading);

    listings.forEach(l => {
      const isAvailable = l.available !== false; // default true for legacy listings without the field

      const card = document.createElement('div');
      card.setAttribute('data-vendor-item', 'true');

      if (isAvailable) {
        // ── Available card ────────────────────────────────────────
        card.className = 'bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col';
        card.innerHTML = `
          <div class="h-40 bg-surface-container flex items-center justify-center text-5xl font-black text-primary/20 relative overflow-hidden">
            <span class="text-7xl select-none">${l.name.charAt(0)}</span>
            <span class="absolute top-2 right-2 text-[10px] font-extrabold uppercase tracking-widest bg-primary-container text-on-primary-container px-2 py-1 rounded-full">Local</span>
          </div>
          <div class="p-4 flex flex-col flex-1">
            <h3 class="font-extrabold text-on-surface text-base leading-tight mb-1">${l.name}</h3>
            <p class="text-xs text-on-surface-variant mb-1 line-clamp-1">${l.desc || l.category}</p>
            <p class="text-xs text-on-surface-variant mb-3">by <strong>${l.vendorName || 'Vendor'}</strong> · ${l.stock} ${l.unit} available</p>
            <div class="mt-auto flex items-center justify-between">
              <p class="font-extrabold text-primary text-lg">₹${l.price}<span class="text-xs font-medium text-on-surface-variant">/${l.unit}</span></p>
              <button
                onclick="addVendorToCart('${l.id}','${l.name.replace(/'/g, "\\'")}',${l.price},'${l.unit}')"
                class="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-extrabold hover:scale-105 active:scale-95 transition-transform">
                Add to Cart
              </button>
            </div>
          </div>`;
      } else {
        // ── Not-Available card ────────────────────────────────────
        card.className = 'bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col opacity-60 grayscale pointer-events-none';
        card.innerHTML = `
          <div class="h-40 bg-surface-container flex items-center justify-center relative overflow-hidden">
            <span class="text-7xl select-none text-on-surface-variant/20">${l.name.charAt(0)}</span>
            <span class="absolute top-2 right-2 text-[10px] font-extrabold uppercase tracking-widest bg-error-container text-on-error-container px-2 py-1 rounded-full">Not Available</span>
          </div>
          <div class="p-4 flex flex-col flex-1">
            <h3 class="font-extrabold text-on-surface-variant text-base leading-tight mb-1">${l.name}</h3>
            <p class="text-xs text-on-surface-variant mb-1 line-clamp-1">${l.desc || l.category}</p>
            <p class="text-xs text-on-surface-variant mb-3">by <strong>${l.vendorName || 'Vendor'}</strong></p>
            <div class="mt-auto flex items-center justify-between">
              <p class="font-extrabold text-on-surface-variant text-lg">₹${l.price}<span class="text-xs font-medium text-on-surface-variant">/${l.unit}</span></p>
              <span class="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full text-xs font-extrabold">Unavailable</span>
            </div>
          </div>`;
      }

      grid.appendChild(card);
    });
  }

  // Start the listener
  startRealtimeListings();

})();

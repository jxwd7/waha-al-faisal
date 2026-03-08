// ===== Quote Cart Module =====
import { getCurrentLang, t } from './i18n.js';

let cartItems = JSON.parse(localStorage.getItem('wah-cart') || '[]');

export function initCart() {
    updateCartCount();
    setupCartListeners();
}

function setupCartListeners() {
    const cartBtn = document.getElementById('cart-btn');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');

    cartBtn?.addEventListener('click', openCart);
    cartClose?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);
}

export function openCart() {
    document.getElementById('cart-sidebar')?.classList.add('active');
    document.getElementById('cart-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCartItems();
}

export function closeCart() {
    document.getElementById('cart-sidebar')?.classList.remove('active');
    document.getElementById('cart-overlay')?.classList.remove('active');
    document.body.style.overflow = '';
}

export function addToCart(product, quantity) {
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cartItems.push({
            id: product.id,
            name_en: product.name_en,
            name_ar: product.name_ar,
            image: product.image,
            price: product.price,
            quantity: quantity
        });
    }
    saveCart();
    updateCartCount();
    openCart();
}

export function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function saveCart() {
    localStorage.setItem('wah-cart', JSON.stringify(cartItems));
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (countEl) countEl.textContent = total;
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    const footer = document.getElementById('cart-footer');
    const lang = getCurrentLang();

    if (!container) return;

    if (cartItems.length === 0) {
        container.innerHTML = `<p class="empty-cart">${t('empty_cart')}</p>`;
        if (footer) footer.style.display = 'none';
        return;
    }

    if (footer) footer.style.display = 'block';

    container.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${lang === 'ar' ? item.name_ar : item.name_en}" loading="lazy">
      <div class="cart-item-details">
        <p class="cart-item-name">${lang === 'ar' ? item.name_ar : item.name_en}</p>
        <p class="cart-item-code">${item.id}</p>
        <div class="cart-item-qty">
          <span>${t('quantity')}: ${item.quantity}</span>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">${lang === 'ar' ? 'إزالة' : 'Remove'}</button>
      </div>
    </div>
  `).join('');

    // Remove buttons
    container.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });

    // Update total (Hidden since prices are removed)
    const totalEl = document.getElementById('cart-total-amount');
    if (totalEl) totalEl.textContent = t('price');

    // Update WhatsApp link
    const whatsappBtn = document.getElementById('whatsapp-order-btn');
    if (whatsappBtn) {
        const message = generateOrderMessage();
        whatsappBtn.href = `https://wa.me/966506748968?text=${encodeURIComponent(message)}`;
    }

    // Update Email link
    const emailBtn = document.getElementById('email-order-btn');
    if (emailBtn) {
        const message = generateOrderMessage();
        const subject = lang === 'ar' ? 'طلب عرض سعر - وهاء الفيصل للتجارة' : 'Quote Request - Waha Al Faisal Trading';
        emailBtn.href = `mailto:estabilishmentalfaisal@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }
}

function generateOrderMessage() {
    const lang = getCurrentLang();
    const header = lang === 'ar' ? 'طلب عرض سعر من وهاء الفيصل للتجارة\n\n' : 'Quote Request from Waha Al Faisal Trading\n\n';
    const items = cartItems.map(item => {
        const name = lang === 'ar' ? item.name_ar : item.name_en;
        return `• ${item.id} - ${name}\n  ${t('quantity')}: ${item.quantity}`;
    }).join('\n\n');
    const footer = '';
    return header + items + footer;
}

// Listen for language changes
window.addEventListener('languageChanged', () => {
    if (document.getElementById('cart-sidebar')?.classList.contains('active')) {
        renderCartItems();
    }
});

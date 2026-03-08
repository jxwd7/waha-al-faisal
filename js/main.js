// ===== Main Application =====
import { initI18n, toggleLanguage, getCurrentLang, t } from './i18n.js';
import { initCart, addToCart } from './cart.js';

let productsData = null;

async function init() {
    // Load data
    const [_, productsRes] = await Promise.all([
        initI18n(),
        fetch('/data/products.json')
    ]);
    productsData = await productsRes.json();

    // Initialize modules
    initCart();
    renderCollections();
    renderFeaturedProducts();
    renderTestimonials();
    populateDropdown();
    populateFooterCategories();
    setupEventListeners();
    setupScrollEffects();
    setupMobileMenu();
}

// ===== RENDER COLLECTIONS =====
function renderCollections() {
    const grid = document.getElementById('collection-grid');
    if (!grid || !productsData) return;

    const lang = getCurrentLang();
    grid.innerHTML = productsData.categories.map(cat => `
    <div class="collection-card" data-category="${cat.id}">
      <img class="collection-card-image" src="${cat.image}" alt="${lang === 'ar' ? cat.name_ar : cat.name_en}" loading="lazy">
      <div class="collection-card-name">${lang === 'ar' ? cat.name_ar : cat.name_en}</div>
    </div>
  `).join('');

    // Click handlers
    grid.querySelectorAll('.collection-card').forEach(card => {
        card.addEventListener('click', () => {
            const catId = card.dataset.category;
            scrollToAndFilterProducts(catId);
        });
    });
}

// ===== RENDER FEATURED PRODUCTS =====
function renderFeaturedProducts(filterCategory = null) {
    const grid = document.getElementById('featured-products');
    if (!grid || !productsData) return;

    const lang = getCurrentLang();
    let products = productsData.products;
    if (filterCategory) {
        products = products.filter(p => p.category === filterCategory);
    }

    grid.innerHTML = products.map(product => {
        const name = lang === 'ar' ? product.name_ar : product.name_en;
        const discount = Math.round((1 - product.price / product.original_price) * 100);
        return `
      <div class="product-card" data-product-id="${product.id}">
        <span class="product-card-badge">-${discount}%</span>
        <div class="product-card-image-wrap">
          <img class="product-card-image" src="${product.image}" alt="${name}" loading="lazy">
          <div class="product-card-quick-view">${t('request_quote')}</div>
        </div>
        <div class="product-card-info">
          <p class="product-card-code">${product.id}</p>
          <h3 class="product-card-title">${name}</h3>
          <div class="product-card-pricing">
            <span class="product-card-price" style="font-size: 0.9rem; color: var(--color-accent); font-weight: 500;">${t('price')}</span>
          </div>
        </div>
      </div>
    `;
    }).join('');

    // Click handlers for product cards
    grid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = card.dataset.productId;
            openProductModal(productId);
        });
    });
}

// ===== RENDER TESTIMONIALS =====
function renderTestimonials() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid || !productsData) return;

    const lang = getCurrentLang();
    grid.innerHTML = productsData.testimonials.map(test => `
    <div class="testimonial-card">
      <div class="testimonial-header">
        <img class="testimonial-product-img" src="${test.image}" alt="${lang === 'ar' ? test.product_ar : test.product_en}" loading="lazy">
        <p class="testimonial-product-name">${lang === 'ar' ? test.product_ar : test.product_en}</p>
      </div>
      <div class="testimonial-stars">${'★'.repeat(test.rating)}${'☆'.repeat(5 - test.rating)}</div>
      <p class="testimonial-text">"${lang === 'ar' ? test.text_ar : test.text_en}"</p>
      <p class="testimonial-author">${test.name}</p>
    </div>
  `).join('');
}

// ===== POPULATE DROPDOWN =====
function populateDropdown() {
    const dropdown = document.getElementById('shop-dropdown');
    if (!dropdown || !productsData) return;

    const lang = getCurrentLang();
    dropdown.innerHTML = productsData.categories.map(cat => `
    <a href="#collections" data-category="${cat.id}">
      ${lang === 'ar' ? cat.name_ar : cat.name_en}
    </a>
  `).join('');

    dropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const catId = link.dataset.category;
            scrollToAndFilterProducts(catId);
        });
    });
}

// ===== POPULATE FOOTER CATEGORIES =====
function populateFooterCategories() {
    const container = document.getElementById('footer-categories');
    if (!container || !productsData) return;

    const lang = getCurrentLang();
    container.innerHTML = productsData.categories.map(cat => `
    <li><a href="#collections" data-category="${cat.id}">${lang === 'ar' ? cat.name_ar : cat.name_en}</a></li>
  `).join('');

    container.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToAndFilterProducts(link.dataset.category);
        });
    });
}

// ===== SCROLL TO AND FILTER =====
function scrollToAndFilterProducts(categoryId) {
    const featuredSection = document.getElementById('featured');
    if (featuredSection) {
        featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    renderFeaturedProducts(categoryId);

    // Update section title
    const titleEl = featuredSection?.querySelector('.section-title');
    if (titleEl && productsData) {
        const lang = getCurrentLang();
        const cat = productsData.categories.find(c => c.id === categoryId);
        if (cat) {
            titleEl.textContent = lang === 'ar' ? cat.name_ar : cat.name_en;
        }
    }
}

// ===== PRODUCT MODAL =====
function openProductModal(productId) {
    const product = productsData?.products.find(p => p.id === productId);
    if (!product) return;

    const lang = getCurrentLang();
    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('product-modal-overlay');

    // Populate modal
    document.getElementById('modal-product-image').src = product.image;
    document.getElementById('modal-product-image').alt = lang === 'ar' ? product.name_ar : product.name_en;
    document.getElementById('modal-item-code').textContent = product.id;
    document.getElementById('modal-title').textContent = lang === 'ar' ? product.name_ar : product.name_en;
    document.getElementById('modal-price').textContent = t('price');
    document.getElementById('modal-price').style.fontSize = '1.1rem';
    document.getElementById('modal-original-price').style.display = 'none';
    const saleBadge = document.querySelector('.modal-sale-badge');
    if (saleBadge) saleBadge.style.display = 'none';
    document.getElementById('modal-min-order').textContent = `${t('min_order').replace('10', product.min_order)}`;
    document.getElementById('modal-dimensions').textContent = product.dimensions;
    document.getElementById('modal-material').textContent = lang === 'ar' ? product.material_ar : product.material_en;
    document.getElementById('modal-description').textContent = lang === 'ar' ? product.description_ar : product.description_en;
    document.getElementById('modal-qty').value = product.min_order;

    // Add to quote button
    const addBtn = document.getElementById('add-quote-btn');
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    newBtn.addEventListener('click', () => {
        const qty = parseInt(document.getElementById('modal-qty').value) || product.min_order;
        addToCart(product, qty);
        closeProductModal();
    });

    // Inquire button → WhatsApp
    const inquireBtn = document.getElementById('inquire-btn');
    const name = lang === 'ar' ? product.name_ar : product.name_en;
    const message = lang === 'ar'
        ? `مرحباً، أود الاستفسار عن أسعار الجملة للمنتج:\n${product.id} - ${name}`
        : `Hello, I would like to inquire about bulk pricing for:\n${product.id} - ${name}`;
    inquireBtn.href = `https://wa.me/966506748968?text=${encodeURIComponent(message)}`;

    // Quantity controls
    const qtyInput = document.getElementById('modal-qty');
    document.getElementById('qty-minus')?.addEventListener('click', () => {
        const val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
    });
    document.getElementById('qty-plus')?.addEventListener('click', () => {
        const val = parseInt(qtyInput.value) || 0;
        qtyInput.value = val + 1;
    });

    // Show modal
    modal?.classList.add('active');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('product-modal')?.classList.remove('active');
    document.getElementById('product-modal-overlay')?.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Language toggle
    document.getElementById('lang-toggle')?.addEventListener('click', () => {
        toggleLanguage();
        renderCollections();
        renderFeaturedProducts();
        renderTestimonials();
        populateDropdown();
        populateFooterCategories();
    });

    // Modal close
    document.getElementById('modal-close')?.addEventListener('click', closeProductModal);
    document.getElementById('product-modal-overlay')?.addEventListener('click', closeProductModal);

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });

    // Mailing form
    document.getElementById('mailing-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = e.target.querySelector('input');
        if (input?.value) {
            alert(getCurrentLang() === 'ar' ? 'شكراً لاشتراكك!' : 'Thank you for subscribing!');
            input.value = '';
        }
    });
}

// ===== SCROLL EFFECTS =====
function setupScrollEffects() {
    const header = document.getElementById('site-header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    document.querySelectorAll('.collection-card, .product-card, .testimonial-card, .reason-item').forEach(el => {
        observer.observe(el);
    });
}

// ===== MOBILE MENU =====
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('main-nav');

    menuBtn?.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        nav?.classList.toggle('active');
    });

    // Close menu on nav click
    nav?.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn?.classList.remove('active');
            nav?.classList.remove('active');
        });
    });

    // Dropdown toggle on mobile
    document.querySelectorAll('.has-dropdown').forEach(item => {
        item.querySelector('.dropdown-trigger')?.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                item.classList.toggle('active');
            }
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', init);

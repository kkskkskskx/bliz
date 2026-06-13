let allProducts = [];
let currentCategory = null;
let currentPage = 1;
const productsPerPage = 12;

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
});

async function loadCategories() {
    try {
        const result = await fetch('/api/categories.php').then(r => r.json());
        const container = document.getElementById('categoriesList');

        container.innerHTML = `
            <a href="/catalog.html" class="category-item ${!currentCategory ? 'active' : ''}">
                <span class="category-icon">🛍️</span>
                <span>Всі товари</span>
            </a>
            ${result.categories.map(cat => `
                <a href="/catalog.html?category=${cat.slug}" class="category-item ${currentCategory === cat.slug ? 'active' : ''}" data-slug="${cat.slug}">
                    <span class="category-icon">${cat.icon}</span>
                    <span>${cat.name}</span>
                </a>
            `).join('')}
        `;
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function loadProducts() {
    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get('category');

    try {
        const params = new URLSearchParams({ limit: 100 });
        if (currentCategory) params.append('category', currentCategory);

        const result = await fetch(`/api/products.php?${params}`).then(r => r.json());
        allProducts = result.products || [];

        if (currentCategory) {
            const cat = allProducts[0]?.category_name || 'Категорія';
            document.getElementById('categoryTitle').textContent = cat;
        }

        renderProducts();
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

function renderProducts() {
    const container = document.getElementById('catalogProducts');
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const pageProducts = allProducts.slice(startIndex, endIndex);

    container.innerHTML = pageProducts.map(product => `
        <div class="product-card" onclick="window.location.href='/product.html?id=${product.id}'">
            <div class="product-image">
                <img src="${product.image || '/assets/images/placeholder.jpg'}" alt="${product.name}">
                <div class="product-actions">
                    <button class="action-btn wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                    <span class="reviews">(${product.reviews_count})</span>
                </div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    ${product.old_price ? `<span class="old-price">${product.old_price} ₴</span>` : ''}
                    <span class="current-price">${product.price} ₴</span>
                </div>
                ${product.bonus_points ? `<div class="bonus-points">+${product.bonus_points} ₴ на бонусний рахунок</div>` : ''}
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); handleAddToCart(${product.id})">
                    До кошика
                </button>
            </div>
        </div>
    `).join('');

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(allProducts.length / productsPerPage);
    const container = document.getElementById('pagination');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(`
            <button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                ${i}
            </button>
        `);
    }

    container.innerHTML = pages.join('');
}

function goToPage(page) {
    currentPage = page;
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sortProducts() {
    const sortValue = document.getElementById('sortSelect').value;

    switch(sortValue) {
        case 'price-asc':
            allProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-desc':
            allProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'rating':
            allProducts.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
            break;
        default:
            loadProducts();
            return;
    }

    currentPage = 1;
    renderProducts();
}

function applyFilters() {
    const minPrice = parseFloat(document.getElementById('priceMin').value) || 0;
    const maxPrice = parseFloat(document.getElementById('priceMax').value) || Infinity;

    loadProducts().then(() => {
        allProducts = allProducts.filter(p => {
            const price = parseFloat(p.price);
            return price >= minPrice && price <= maxPrice;
        });
        currentPage = 1;
        renderProducts();
    });
}

async function handleAddToCart(productId) {
    try {
        const response = await fetch('/api/cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Товар додано до кошика!');
        } else {
            showNotification('Увійдіть для додавання товарів', 'error');
        }
    } catch (error) {
        showNotification('Помилка при додаванні товару', 'error');
    }
}

function toggleWishlist(productId) {
    showNotification('Додано до обраного!');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

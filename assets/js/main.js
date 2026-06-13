const API_URL = '/api';

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function register(email, password, name, phone) {
    return apiRequest('/register.php', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, phone })
    });
}

async function login(email, password) {
    return apiRequest('/login.php', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

async function getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products.php?${queryString}`);
}

async function getCategories() {
    return apiRequest('/categories.php');
}

async function getCart() {
    return apiRequest('/cart.php');
}

async function addToCart(productId, quantity = 1) {
    return apiRequest('/cart.php', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity })
    });
}

async function removeFromCart(productId) {
    return apiRequest('/cart.php', {
        method: 'DELETE',
        body: JSON.stringify({ product_id: productId })
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const result = await login(email, password);
                showNotification('Вхід виконано успішно!');
                closeModal('loginModal');
                setTimeout(() => location.reload(), 1000);
            } catch (error) {
                showNotification('Невірний email або пароль', 'error');
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value,
                first_name: document.getElementById('registerFirstName').value,
                last_name: document.getElementById('registerLastName').value,
                patronymic: document.getElementById('registerPatronymic').value,
                phone: document.getElementById('registerPhone').value,
                gender: document.getElementById('registerGender').value,
                birth_date: document.getElementById('registerBirthDate').value,
                delivery_address: document.getElementById('registerAddress').value
            };

            try {
                const response = await fetch('/api/register.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    showNotification('Реєстрація успішна!');
                    closeModal('registerModal');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification(result.error || 'Помилка реєстрації', 'error');
                }
            } catch (error) {
                showNotification('Помилка реєстрації', 'error');
            }
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    loadProducts();
    updateCartCount();
});

async function loadProducts() {
    try {
        const result = await getProducts({ limit: 15 });
        const productsContainer = document.getElementById('productsGrid');

        if (productsContainer && result.products) {
            productsContainer.innerHTML = result.products.map(product => {
                const hasDiscount = product.old_price && product.old_price > product.price;
                const discountPercent = hasDiscount ? Math.round((1 - product.price / product.old_price) * 100) : 0;

                return `
                <div class="product-tile">
                    ${product.labels ? `
                    <div class="product-tile-hot-labels">
                        ${product.labels.includes('new') ? '<span class="label new">Новинка</span>' : ''}
                        ${product.labels.includes('hit') ? '<span class="label hit">Хіт</span>' : ''}
                        ${product.labels.includes('sale') ? '<span class="label">Акція</span>' : ''}
                    </div>
                    ` : ''}

                    <div class="product-tile-actions">
                        <button class="product-tile-actions__item" onclick="toggleWishlist(${product.id})" title="Додати до обраного">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                        <button class="product-tile-actions__item" onclick="compareProduct(${product.id})" title="Додати до порівняння">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 2v6m6-6v6M4 10h16M6 22h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"></path>
                            </svg>
                        </button>
                    </div>

                    <a href="/product.html?id=${product.id}" class="product-tile-media">
                        <img src="${product.image || '/assets/images/placeholder.jpg'}"
                             alt="${product.name}"
                             class="product-tile-media__img">
                    </a>

                    ${product.rating ? `
                    <div class="rating-number-box">
                        <div class="rating-stars">${'★'.repeat(Math.floor(product.rating || 0))}${'☆'.repeat(5 - Math.floor(product.rating || 0))}</div>
                        <span>${product.reviews_count || 0}</span>
                    </div>
                    ` : ''}

                    <div class="product-tile-title">
                        <a href="/product.html?id=${product.id}" class="product-tile-title__name">
                            ${product.name}
                        </a>
                    </div>

                    <div class="product-tile-price">
                        <div class="product-tile-price__row">
                            <span class="product-tile-price__current ${hasDiscount ? 'product-tile-price__current--accent' : ''}">
                                ${Math.floor(product.price)}
                            </span>
                            <span class="product-tile-price__currency">₴</span>
                            ${hasDiscount ? `<span class="product-tile-price__discount">-${discountPercent}%</span>` : ''}
                        </div>
                        ${hasDiscount ? `<span class="product-tile-price__old">${Math.floor(product.old_price)} ₴</span>` : ''}
                    </div>

                    ${product.credit_monthly ? `
                    <div class="credit-monthly-min">
                        <span>від </span>
                        <span class="credit-monthly-min__amount">${Math.floor(product.credit_monthly)} ₴</span>
                        <span> / міс</span>
                    </div>
                    ` : ''}

                    ${product.bonus_points ? `
                    <div class="bonus-label">
                        <span class="bonus-label__icon">B</span>
                        <span>+<span class="bonus-label-value">${product.bonus_points}</span> на бонусний рахунок</span>
                    </div>
                    ` : ''}

                    <button class="buy-btn" onclick="handleAddToCart(${product.id})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        До кошика
                    </button>
                </div>
            `}).join('');
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        // Load demo products if API fails
        loadDemoProducts();
    }
}

function loadDemoProducts() {
    const demoProducts = [
        {
            id: 1,
            name: 'iPhone 15 Pro Max 256GB',
            price: 54999,
            old_price: 59999,
            image: 'https://via.placeholder.com/300x300/f8f8f8/2abd13?text=iPhone+15',
            rating: 4.8,
            reviews_count: 342,
            bonus_points: 550,
            credit_monthly: 2292,
            labels: ['hit', 'new']
        },
        {
            id: 2,
            name: 'Samsung Galaxy S24 Ultra 512GB',
            price: 49999,
            old_price: 54999,
            image: 'https://via.placeholder.com/300x300/f8f8f8/2abd13?text=Samsung+S24',
            rating: 4.7,
            reviews_count: 218,
            bonus_points: 500,
            credit_monthly: 2083,
            labels: ['new']
        },
        {
            id: 3,
            name: 'MacBook Air M3 13" 16GB 512GB',
            price: 59999,
            old_price: null,
            image: 'https://via.placeholder.com/300x300/f8f8f8/2abd13?text=MacBook+Air',
            rating: 4.9,
            reviews_count: 156,
            bonus_points: 600,
            credit_monthly: 2500,
            labels: ['hit']
        },
        {
            id: 4,
            name: 'Sony PlayStation 5 Slim + Доп. джойстик',
            price: 19999,
            old_price: 22999,
            image: 'https://via.placeholder.com/300x300/f8f8f8/2abd13?text=PS5',
            rating: 4.6,
            reviews_count: 423,
            bonus_points: 200,
            credit_monthly: 833,
            labels: ['sale']
        },
        {
            id: 5,
            name: 'iPad Pro 12.9" M2 256GB Wi-Fi',
            price: 44999,
            image: 'https://via.placeholder.com/300x300/f8f8f8/2abd13?text=iPad+Pro',
            rating: 4.8,
            reviews_count: 189,
            bonus_points: 450,
            credit_monthly: 1875,
            labels: ['new']
        },
        {
            id: 6,
            name: 'Apple Watch Series 9 GPS 45mm',
            price: 16999,
            old_price: 18999,
            image: 'https://via.placeholder.com/300x300/f8f8f8/2abd13?text=Apple+Watch',
            rating: 4.7,
            reviews_count: 267,
            bonus_points: 170,
            credit_monthly: 708
        },
        {
            id: 7,
            name: 'AirPods Pro 2 USB-C',
            price: 9999,
            old_price: 10999,
            image: 'https://via.placeholder.com/300x300/f8f8f8/2abd13?text=AirPods+Pro',
            rating: 4.9,
            reviews_count: 512,
            bonus_points: 100,
            credit_monthly: 417,
            labels: ['hit']
        },
        {
            id: 8,
            name: 'Dyson V15 Detect Absolute',
            price: 24999,
            old_price: 27999,
            image: 'https://via.placeholder.com/300x300/f8f8f8/2abd13?text=Dyson',
            rating: 4.8,
            reviews_count: 145,
            bonus_points: 250,
            credit_monthly: 1042,
            labels: ['sale']
        }
    ];

    const productsContainer = document.getElementById('productsGrid');
    if (productsContainer) {
        productsContainer.innerHTML = demoProducts.map(product => {
            const hasDiscount = product.old_price && product.old_price > product.price;
            const discountPercent = hasDiscount ? Math.round((1 - product.price / product.old_price) * 100) : 0;

            return `
            <div class="product-tile">
                ${product.labels ? `
                <div class="product-tile-hot-labels">
                    ${product.labels.includes('new') ? '<span class="label new">Новинка</span>' : ''}
                    ${product.labels.includes('hit') ? '<span class="label hit">Хіт</span>' : ''}
                    ${product.labels.includes('sale') ? '<span class="label">Акція</span>' : ''}
                </div>
                ` : ''}

                <div class="product-tile-actions">
                    <button class="product-tile-actions__item" onclick="toggleWishlist(${product.id})" title="Додати до обраного">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    <button class="product-tile-actions__item" onclick="compareProduct(${product.id})" title="Додати до порівняння">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 2v6m6-6v6M4 10h16M6 22h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"></path>
                        </svg>
                    </button>
                </div>

                <a href="/product.html?id=${product.id}" class="product-tile-media">
                    <img src="${product.image}"
                         alt="${product.name}"
                         class="product-tile-media__img">
                </a>

                ${product.rating ? `
                <div class="rating-number-box">
                    <div class="rating-stars">${'★'.repeat(Math.floor(product.rating || 0))}${'☆'.repeat(5 - Math.floor(product.rating || 0))}</div>
                    <span>${product.reviews_count || 0}</span>
                </div>
                ` : ''}

                <div class="product-tile-title">
                    <a href="/product.html?id=${product.id}" class="product-tile-title__name">
                        ${product.name}
                    </a>
                </div>

                <div class="product-tile-price">
                    <div class="product-tile-price__row">
                        <span class="product-tile-price__current ${hasDiscount ? 'product-tile-price__current--accent' : ''}">
                            ${Math.floor(product.price)}
                        </span>
                        <span class="product-tile-price__currency">₴</span>
                        ${hasDiscount ? `<span class="product-tile-price__discount">-${discountPercent}%</span>` : ''}
                    </div>
                    ${hasDiscount ? `<span class="product-tile-price__old">${Math.floor(product.old_price)} ₴</span>` : ''}
                </div>

                ${product.credit_monthly ? `
                <div class="credit-monthly-min">
                    <span>від </span>
                    <span class="credit-monthly-min__amount">${Math.floor(product.credit_monthly)} ₴</span>
                    <span> / міс</span>
                </div>
                ` : ''}

                ${product.bonus_points ? `
                <div class="bonus-label">
                    <span class="bonus-label__icon">B</span>
                    <span>+<span class="bonus-label-value">${product.bonus_points}</span> на бонусний рахунок</span>
                </div>
                ` : ''}

                <button class="buy-btn" onclick="handleAddToCart(${product.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    До кошика
                </button>
            </div>
        `}).join('');
    }
}

async function handleAddToCart(productId) {
    try {
        await addToCart(productId);
        showNotification('Товар додано до кошика!');
        updateCartCount();
    } catch (error) {
        if (error.message.includes('authenticated')) {
            showNotification('Увійдіть для додавання товарів', 'error');
            openModal('loginModal');
        } else {
            showNotification('Помилка при додаванні товару', 'error');
        }
    }
}

async function updateCartCount() {
    try {
        const result = await getCart();
        const cartCount = document.getElementById('cartCount');
        if (cartCount && result.cart) {
            const totalItems = result.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Failed to update cart count:', error);
    }
}

function toggleWishlist(productId) {
    showNotification('Додано до обраного!');
}

function compareProduct(productId) {
    showNotification('Додано до порівняння!');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function handleSearch(e) {
    const query = e.target.value.trim();

    if (query.length < 2) {
        return;
    }

    try {
        const result = await getProducts({ search: query, limit: 10 });

        if (result.products && result.products.length > 0) {
            window.location.href = `/catalog.html?search=${encodeURIComponent(query)}`;
        }
    } catch (error) {
        console.error('Search failed:', error);
    }
}

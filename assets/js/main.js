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
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const name = document.getElementById('registerName').value;
            const phone = document.getElementById('registerPhone').value;

            try {
                const result = await register(email, password, name, phone);
                showNotification('Реєстрація успішна!');
                closeModal('registerModal');
                setTimeout(() => location.reload(), 1000);
            } catch (error) {
                showNotification(error.message || 'Помилка реєстрації', 'error');
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
            productsContainer.innerHTML = result.products.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.image || '/assets/images/placeholder.jpg'}" alt="${product.name}">
                        <div class="product-actions">
                            <button class="action-btn wishlist-btn" onclick="toggleWishlist(${product.id})">
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
                        <button class="add-to-cart-btn" onclick="handleAddToCart(${product.id})">
                            До кошика
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load products:', error);
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

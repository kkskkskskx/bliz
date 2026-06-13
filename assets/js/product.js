let currentProduct = null;
let currentQuantity = 1;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = '/';
        return;
    }

    loadProduct(productId);
});

async function loadProduct(id) {
    try {
        const result = await fetch(`/api/product.php?id=${id}`).then(r => r.json());

        if (!result.success) {
            alert('Товар не знайдено');
            window.location.href = '/';
            return;
        }

        currentProduct = result.product;

        document.getElementById('pageTitle').textContent = `${currentProduct.name} - Bliz`;
        document.getElementById('productImage').src = currentProduct.image || '/assets/images/placeholder.jpg';
        document.getElementById('productImage').alt = currentProduct.name;
        document.getElementById('productName').textContent = currentProduct.name;
        document.getElementById('productRating').textContent = '★'.repeat(Math.floor(currentProduct.rating)) + '☆'.repeat(5 - Math.floor(currentProduct.rating));
        document.getElementById('productReviews').textContent = `(${currentProduct.reviews_count} відгуків)`;
        document.getElementById('productCode').textContent = `Код: ${currentProduct.id}`;
        document.getElementById('productPrice').textContent = `${currentProduct.price} ₴`;

        if (currentProduct.old_price) {
            document.getElementById('productOldPrice').textContent = `${currentProduct.old_price} ₴`;
            document.getElementById('productOldPrice').style.display = 'inline';
        } else {
            document.getElementById('productOldPrice').style.display = 'none';
        }

        if (currentProduct.bonus_points) {
            document.getElementById('productBonus').textContent = `+${currentProduct.bonus_points} ₴ на бонусний рахунок`;
            document.getElementById('productBonus').style.display = 'inline-block';
        } else {
            document.getElementById('productBonus').style.display = 'none';
        }

        document.getElementById('productDescription').textContent = currentProduct.description || 'Опис відсутній';

        if (result.related && result.related.length > 0) {
            renderRelatedProducts(result.related);
        }

    } catch (error) {
        console.error('Failed to load product:', error);
        alert('Помилка завантаження товару');
    }
}

function renderRelatedProducts(products) {
    const container = document.getElementById('relatedProducts');

    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="window.location.href='/product.html?id=${product.id}'">
            <div class="product-image">
                <img src="${product.image || '/assets/images/placeholder.jpg'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                </div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    ${product.old_price ? `<span class="old-price">${product.old_price} ₴</span>` : ''}
                    <span class="current-price">${product.price} ₴</span>
                </div>
            </div>
        </div>
    `).join('');
}

function changeQuantity(delta) {
    const input = document.getElementById('quantity');
    const newValue = parseInt(input.value) + delta;

    if (newValue >= 1) {
        input.value = newValue;
        currentQuantity = newValue;
    }
}

async function addToCartFromProduct() {
    const quantity = parseInt(document.getElementById('quantity').value);

    try {
        const response = await fetch('/api/cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: currentProduct.id,
                quantity: quantity
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`Додано до кошика: ${currentProduct.name} (${quantity} шт.)`);
        } else {
            window.location.href = '/?login=1';
        }
    } catch (error) {
        showNotification('Помилка при додаванні товару', 'error');
    }
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

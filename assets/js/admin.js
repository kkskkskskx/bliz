document.addEventListener('DOMContentLoaded', () => {
    initAdminNavigation();
    loadDashboardStats();
    loadProducts();
    loadUsers();
    loadOrders();
    loadCategories();
});

function initAdminNavigation() {
    const navItems = document.querySelectorAll('.admin-nav-item[data-section]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.dataset.section;

            document.querySelectorAll('.admin-nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

async function loadDashboardStats() {
    try {
        const [products, users, orders] = await Promise.all([
            fetch('/api/products.php?limit=1000').then(r => r.json()),
            fetch('/api/admin/users.php').then(r => r.json()),
            fetch('/api/admin/orders.php').then(r => r.json())
        ]);

        document.getElementById('totalProducts').textContent = products.products?.length || 0;
        document.getElementById('totalUsers').textContent = users.users?.length || 0;
        document.getElementById('totalOrders').textContent = orders.orders?.length || 0;

        const revenue = orders.orders?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;
        document.getElementById('totalRevenue').textContent = revenue.toLocaleString() + ' ₴';
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch('/api/products.php?limit=1000');
        const data = await response.json();

        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = data.products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category_name}</td>
                <td>${product.price} ₴</td>
                <td>${product.rating} ★</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn-small" onclick="editProduct(${product.id})">Редагувати</button>
                        <button class="btn-danger" onclick="deleteProduct(${product.id})">Видалити</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users.php');
        const data = await response.json();

        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = data.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || '-'}</td>
                <td>${user.is_admin ? '<span class="badge-admin">ADMIN</span>' : '-'}</td>
                <td>${new Date(user.created_at).toLocaleDateString('uk-UA')}</td>
                <td>
                    <div class="table-actions">
                        ${!user.is_admin ? `<button class="btn-secondary" onclick="toggleAdmin(${user.id}, true)">Зробити адміном</button>` : ''}
                        ${!user.is_admin ? `<button class="btn-danger" onclick="banUser(${user.id})">Заблокувати</button>` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

async function loadOrders() {
    try {
        const response = await fetch('/api/admin/orders.php');
        const data = await response.json();

        const tbody = document.querySelector('#ordersTable tbody');
        tbody.innerHTML = data.orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.user_name || order.user_email}</td>
                <td>${parseFloat(order.total).toLocaleString()} ₴</td>
                <td><span class="badge-status ${order.status}">${order.status}</span></td>
                <td>${new Date(order.created_at).toLocaleDateString('uk-UA')}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn-small" onclick="viewOrder(${order.id})">Деталі</button>
                        <button class="btn-secondary" onclick="updateOrderStatus(${order.id})">Змінити статус</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

async function loadCategories() {
    try {
        const response = await fetch('/api/categories.php');
        const data = await response.json();

        const tbody = document.querySelector('#categoriesTable tbody');
        tbody.innerHTML = data.categories.map(category => `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.slug}</td>
                <td>${category.icon}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn-small" onclick="editCategory(${category.id})">Редагувати</button>
                        <button class="btn-danger" onclick="deleteCategory(${category.id})">Видалити</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function openAddProductModal() {
    alert('Функція додавання товару в розробці');
}

function editProduct(id) {
    alert(`Редагування товару ${id} в розробці`);
}

async function deleteProduct(id) {
    if (!confirm('Видалити цей товар?')) return;

    try {
        await fetch(`/api/admin/products.php?id=${id}`, { method: 'DELETE' });
        alert('Товар видалено');
        loadProducts();
        loadDashboardStats();
    } catch (error) {
        alert('Помилка при видаленні товару');
    }
}

async function toggleAdmin(userId, makeAdmin) {
    try {
        await fetch('/api/admin/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, is_admin: makeAdmin })
        });
        alert(makeAdmin ? 'Користувач тепер адміністратор' : 'Адмін права знято');
        loadUsers();
    } catch (error) {
        alert('Помилка');
    }
}

async function banUser(userId) {
    if (!confirm('Заблокувати цього користувача?')) return;

    try {
        await fetch('/api/admin/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, ban: true })
        });
        alert('Користувача заблоковано');
        loadUsers();
    } catch (error) {
        alert('Помилка');
    }
}

function viewOrder(id) {
    alert(`Деталі замовлення ${id} в розробці`);
}

function updateOrderStatus(id) {
    alert(`Зміна статусу замовлення ${id} в розробці`);
}

function openAddCategoryModal() {
    alert('Функція додавання категорії в розробці');
}

function editCategory(id) {
    alert(`Редагування категорії ${id} в розробці`);
}

async function deleteCategory(id) {
    if (!confirm('Видалити цю категорію?')) return;

    try {
        await fetch(`/api/admin/categories.php?id=${id}`, { method: 'DELETE' });
        alert('Категорію видалено');
        loadCategories();
    } catch (error) {
        alert('Помилка при видаленні категорії');
    }
}

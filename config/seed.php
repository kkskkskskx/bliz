<?php
require_once '../config/database.php';

$pdo = getDBConnection();

$pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE");

$categories = [
    ['name' => 'Смартфони', 'slug' => 'smartphones', 'icon' => '📱'],
    ['name' => 'Ноутбуки', 'slug' => 'laptops', 'icon' => '💻'],
    ['name' => 'Телевізори', 'slug' => 'tv', 'icon' => '📺'],
    ['name' => 'Навушники', 'slug' => 'headphones', 'icon' => '🎧'],
    ['name' => 'Планшети', 'slug' => 'tablets', 'icon' => '📲']
];

foreach ($categories as $cat) {
    $stmt = $pdo->prepare("INSERT IGNORE INTO categories (name, slug, icon) VALUES (?, ?, ?)");
    $stmt->execute([$cat['name'], $cat['slug'], $cat['icon']]);
}

$products = [
    [
        'category' => 'smartphones',
        'name' => 'iPhone 15 Pro Max 256GB',
        'description' => 'Флагманський смартфон Apple з титановим корпусом',
        'price' => 54999,
        'old_price' => 59999,
        'image' => '/assets/images/iphone15.jpg',
        'rating' => 4.8,
        'reviews_count' => 243,
        'bonus_points' => 550
    ],
    [
        'category' => 'smartphones',
        'name' => 'Samsung Galaxy S24 Ultra',
        'description' => 'Потужний смартфон з S Pen та AI функціями',
        'price' => 49999,
        'old_price' => 54999,
        'image' => '/assets/images/galaxy-s24.jpg',
        'rating' => 4.7,
        'reviews_count' => 187,
        'bonus_points' => 500
    ],
    [
        'category' => 'laptops',
        'name' => 'MacBook Pro 14" M3',
        'description' => 'Професійний ноутбук для роботи та творчості',
        'price' => 89999,
        'old_price' => 94999,
        'image' => '/assets/images/macbook-pro.jpg',
        'rating' => 4.9,
        'reviews_count' => 156,
        'bonus_points' => 900
    ],
    [
        'category' => 'laptops',
        'name' => 'ASUS ROG Strix G16',
        'description' => 'Ігровий ноутбук з RTX 4060',
        'price' => 54999,
        'old_price' => null,
        'image' => '/assets/images/asus-rog.jpg',
        'rating' => 4.6,
        'reviews_count' => 89,
        'bonus_points' => 550
    ],
    [
        'category' => 'tv',
        'name' => 'Samsung QN90C 65" QLED 4K',
        'description' => 'Преміум телевізор з quantum dot технологією',
        'price' => 69999,
        'old_price' => 79999,
        'image' => '/assets/images/samsung-qled.jpg',
        'rating' => 4.8,
        'reviews_count' => 134,
        'bonus_points' => 700
    ],
    [
        'category' => 'tv',
        'name' => 'LG OLED55C3 55" 4K',
        'description' => 'OLED телевізор з ідеальним чорним кольором',
        'price' => 59999,
        'old_price' => 64999,
        'image' => '/assets/images/lg-oled.jpg',
        'rating' => 4.9,
        'reviews_count' => 201,
        'bonus_points' => 600
    ],
    [
        'category' => 'headphones',
        'name' => 'AirPods Pro 2',
        'description' => 'Бездротові навушники з активним шумозаглушенням',
        'price' => 9999,
        'old_price' => 10999,
        'image' => '/assets/images/airpods-pro.jpg',
        'rating' => 4.7,
        'reviews_count' => 412,
        'bonus_points' => 100
    ],
    [
        'category' => 'headphones',
        'name' => 'Sony WH-1000XM5',
        'description' => 'Найкращі накладні навушники з шумозаглушенням',
        'price' => 12999,
        'old_price' => 14999,
        'image' => '/assets/images/sony-wh1000xm5.jpg',
        'rating' => 4.8,
        'reviews_count' => 298,
        'bonus_points' => 130
    ],
    [
        'category' => 'tablets',
        'name' => 'iPad Air 11" M2',
        'description' => 'Легкий та потужний планшет для роботи',
        'price' => 29999,
        'old_price' => 32999,
        'image' => '/assets/images/ipad-air.jpg',
        'rating' => 4.7,
        'reviews_count' => 176,
        'bonus_points' => 300
    ],
    [
        'category' => 'tablets',
        'name' => 'Samsung Galaxy Tab S9',
        'description' => 'Android планшет з AMOLED дисплеєм',
        'price' => 27999,
        'old_price' => null,
        'image' => '/assets/images/galaxy-tab-s9.jpg',
        'rating' => 4.6,
        'reviews_count' => 143,
        'bonus_points' => 280
    ],
    [
        'category' => 'smartphones',
        'name' => 'Google Pixel 8 Pro',
        'description' => 'Смартфон з найкращою камерою та чистим Android',
        'price' => 39999,
        'old_price' => 44999,
        'image' => '/assets/images/pixel-8-pro.jpg',
        'rating' => 4.6,
        'reviews_count' => 167,
        'bonus_points' => 400
    ],
    [
        'category' => 'laptops',
        'name' => 'Dell XPS 15',
        'description' => 'Ультрабук для професіоналів',
        'price' => 74999,
        'old_price' => null,
        'image' => '/assets/images/dell-xps15.jpg',
        'rating' => 4.7,
        'reviews_count' => 112,
        'bonus_points' => 750
    ],
    [
        'category' => 'headphones',
        'name' => 'Bose QuietComfort Ultra',
        'description' => 'Преміум навушники з spatial audio',
        'price' => 15999,
        'old_price' => 17999,
        'image' => '/assets/images/bose-qc-ultra.jpg',
        'rating' => 4.8,
        'reviews_count' => 223,
        'bonus_points' => 160
    ],
    [
        'category' => 'smartphones',
        'name' => 'Xiaomi 14 Ultra',
        'description' => 'Флагман з Leica камерою',
        'price' => 44999,
        'old_price' => 49999,
        'image' => '/assets/images/xiaomi-14-ultra.jpg',
        'rating' => 4.5,
        'reviews_count' => 98,
        'bonus_points' => 450
    ],
    [
        'category' => 'tv',
        'name' => 'Sony Bravia XR A95L 55"',
        'description' => 'QD-OLED телевізор з неперевершеною якістю зображення',
        'price' => 89999,
        'old_price' => 99999,
        'image' => '/assets/images/sony-bravia.jpg',
        'rating' => 4.9,
        'reviews_count' => 87,
        'bonus_points' => 900
    ]
];

foreach ($products as $prod) {
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ?");
    $stmt->execute([$prod['category']]);
    $category = $stmt->fetch();

    if ($category) {
        $stmt = $pdo->prepare("
            INSERT INTO products (category_id, name, description, price, old_price, image, rating, reviews_count, bonus_points)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $category['id'],
            $prod['name'],
            $prod['description'],
            $prod['price'],
            $prod['old_price'],
            $prod['image'],
            $prod['rating'],
            $prod['reviews_count'],
            $prod['bonus_points']
        ]);
    }
}

$adminEmail = 'admin@bliz.ua';
$adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT IGNORE INTO users (email, password, name, is_admin) VALUES (?, ?, ?, TRUE)");
$stmt->execute([$adminEmail, $adminPassword, 'Admin']);

echo "Database seeded successfully with 15 products and admin account!\n";
echo "Admin credentials: admin@bliz.ua / admin123\n";
?>

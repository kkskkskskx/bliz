<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing product ID']);
    exit;
}

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare("
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    ");
    $stmt->execute([$id]);
    $product = $stmt->fetch();

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT p.* FROM products p
        WHERE p.category_id = ? AND p.id != ?
        ORDER BY RAND()
        LIMIT 4
    ");
    $stmt->execute([$product['category_id'], $id]);
    $related = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'product' => $product,
        'related' => $related
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
?>

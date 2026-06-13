<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

try {
    $pdo = getDBConnection();

    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $search = isset($_GET['search']) ? $_GET['search'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    $query = "SELECT p.*, c.name as category_name FROM products p
              LEFT JOIN categories c ON p.category_id = c.id
              WHERE 1=1";
    $params = [];

    if ($category) {
        $query .= " AND c.slug = ?";
        $params[] = $category;
    }

    if ($search) {
        $query .= " AND p.name LIKE ?";
        $params[] = "%$search%";
    }

    $query .= " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    echo json_encode(['success' => true, 'products' => $products]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
?>

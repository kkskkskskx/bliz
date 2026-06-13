<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT is_admin FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user || !$user['is_admin']) {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $required = ['name', 'category_id', 'price'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            exit;
        }
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO products (category_id, name, description, price, old_price, image, rating, reviews_count, bonus_points, in_stock)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['category_id'],
            $data['name'],
            $data['description'] ?? null,
            $data['price'],
            $data['old_price'] ?? null,
            $data['image'] ?? null,
            $data['rating'] ?? 0,
            $data['reviews_count'] ?? 0,
            $data['bonus_points'] ?? 0,
            isset($data['in_stock']) ? $data['in_stock'] : true
        ]);

        echo json_encode(['success' => true, 'product_id' => $pdo->lastInsertId()]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing product ID']);
        exit;
    }

    try {
        $fields = [];
        $values = [];

        $allowed = ['name', 'description', 'category_id', 'price', 'old_price', 'image', 'rating', 'reviews_count', 'bonus_points', 'in_stock'];

        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $values[] = $data['id'];
        $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);

        echo json_encode(['success' => true]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing product ID']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Product deleted']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
}
?>

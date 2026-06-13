<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$userId = $_SESSION['user_id'];
$pdo = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT c.*, p.name, p.price, p.image, p.in_stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ");
        $stmt->execute([$userId]);
        $cart = $stmt->fetchAll();

        echo json_encode(['success' => true, 'cart' => $cart]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['product_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing product_id']);
        exit;
    }

    $productId = (int)$data['product_id'];
    $quantity = isset($data['quantity']) ? (int)$data['quantity'] : 1;

    try {
        $stmt = $pdo->prepare("
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + ?
        ");
        $stmt->execute([$userId, $productId, $quantity, $quantity]);

        echo json_encode(['success' => true, 'message' => 'Added to cart']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['product_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing product_id']);
        exit;
    }

    $productId = (int)$data['product_id'];

    try {
        $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);

        echo json_encode(['success' => true, 'message' => 'Removed from cart']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
}
?>

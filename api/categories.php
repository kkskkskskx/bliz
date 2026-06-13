<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

try {
    $pdo = getDBConnection();

    $stmt = $pdo->query("SELECT * FROM categories ORDER BY name");
    $categories = $stmt->fetchAll();

    echo json_encode(['success' => true, 'categories' => $categories]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
?>

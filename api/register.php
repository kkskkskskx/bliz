<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password']) || !isset($data['first_name']) || !isset($data['last_name']) || !isset($data['phone'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
$password = $data['password'];
$firstName = trim($data['first_name']);
$lastName = trim($data['last_name']);
$patronymic = isset($data['patronymic']) ? trim($data['patronymic']) : null;
$phone = trim($data['phone']);
$gender = isset($data['gender']) ? $data['gender'] : 'not_specified';
$birthDate = isset($data['birth_date']) ? $data['birth_date'] : null;
$deliveryAddress = isset($data['delivery_address']) ? trim($data['delivery_address']) : null;
$name = "$lastName $firstName";

if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters']);
    exit;
}

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already exists']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (email, password, name, first_name, last_name, patronymic, phone, gender, birth_date, delivery_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$email, $hashedPassword, $name, $firstName, $lastName, $patronymic, $phone, $gender, $birthDate, $deliveryAddress]);

    $userId = $pdo->lastInsertId();

    session_start();
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $name;

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $userId,
            'email' => $email,
            'name' => $name
        ]
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>

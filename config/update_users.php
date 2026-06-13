<?php
require_once 'config/database.php';

$pdo = getDBConnection();

try {
    $pdo->exec("ALTER TABLE users
        ADD COLUMN first_name VARCHAR(100),
        ADD COLUMN last_name VARCHAR(100),
        ADD COLUMN patronymic VARCHAR(100),
        ADD COLUMN gender ENUM('male', 'female', 'not_specified') DEFAULT 'not_specified',
        ADD COLUMN birth_date DATE,
        ADD COLUMN bonus_balance DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN delivery_address TEXT
    ");

    echo "User fields updated successfully!";
} catch(PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false) {
        echo "Columns already exist";
    } else {
        echo "Error: " . $e->getMessage();
    }
}
?>

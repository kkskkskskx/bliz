<?php
define('DB_HOST', 'yamanote.proxy.rlwy.net');
define('DB_PORT', '53043');
define('DB_NAME', 'railway');
define('DB_USER', 'root');
define('DB_PASS', 'FlVjUIfFPYEkfNECrVeQUHvdJQiwGQDo');

function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}
?>

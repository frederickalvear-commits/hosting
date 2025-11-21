/*
 * author Saquib Shaikh
 * created on 19-11-2025-19h-03m
 * github: https://github.com/saquibshaikh14
 * copyright 2025
*/

<?php
// conexion.php
// Ajusta los parámetros si tu host/puerto/usuario/clave son distintos.

$host = 'localhost'; // El servidor está en la misma máquina.
$port = '5432';
$dbname = 'consultorio'; // Nombre de tu base de datos, 
$user = 'postgres'; 
$password = 'Damiancito2025.'; 

$dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

try {
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    // Conexión establecida
} catch (PDOException $e) {
    // En producción no muestres detalles técnicos
    http_response_code(500);
    echo "Error de conexión a la base de datos: " . $e->getMessage();
    exit;
}

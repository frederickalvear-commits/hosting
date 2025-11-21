<?php
header("Content-Type: application/json");

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

$usuario = $data["usuario"] ?? "";
$clave   = $data["clave"] ?? "";

if ($usuario === "admin" && $clave === "1234") {
    echo json_encode([
        "status" => "ok",
        "usuario" => "admin",
        "rol" => "Administrador"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "msg" => "Credenciales incorrectas"
    ]);
}

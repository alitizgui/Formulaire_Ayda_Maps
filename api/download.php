<?php
header('Content-Type: application/json');

// Configuration
$storagePath = __DIR__.'/../storage/';
$maxHours = 24;

// Créer le dossier storage si inexistant
if (!file_exists($storagePath)) {
    mkdir($storagePath, 0755, true);
}

// Nettoyer les anciens fichiers (>24h)
foreach (glob($storagePath."*.png") as $file) {
    if (time() - filemtime($file) > ($maxHours * 3600)) {
        unlink($file);
    }
}

// Gestion des requêtes
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Upload
    $uniqueCode = preg_replace('/[^a-zA-Z0-9]/', '', $_POST['code']);
    $tempFile = $_FILES['image']['tmp_name'];
    $targetFile = $storagePath.$uniqueCode.'.png';
    
    if (move_uploaded_file($tempFile, $targetFile)) {
        echo json_encode([
            'success' => true,
            'download_url' => "api/download.php?code=".$uniqueCode
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Upload failed']);
    }
    exit;
}

// Téléchargement
if (isset($_GET['code'])) {
    $file = $storagePath.preg_replace('/[^a-zA-Z0-9]/', '', $_GET['code']).'.png';
    
    if (file_exists($file)) {
        header('Content-Type: image/png');
        readfile($file);
    } else {
        http_response_code(404);
        echo "Fichier expiré ou introuvable";
    }
    exit;
}
?>
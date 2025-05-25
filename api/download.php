<?php
header('Content-Type: application/json');

// Configurations
$uploadDir = __DIR__ . '/temp/';
$maxFileAge = 86400; // 24h en secondes

// Créer le dossier temp s'il n'existe pas
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Nettoyer les vieux fichiers
foreach (glob($uploadDir . "*") as $file) {
    if (time() - filemtime($file) > $maxFileAge) {
        unlink($file);
    }
}

// Action Upload
if ($_GET['action'] === 'upload') {
    try {
        $code = $_POST['code'];
        $tempFile = $_FILES['image']['tmp_name'];
        $targetFile = $uploadDir . $code . '.png';

        move_uploaded_file($tempFile, $targetFile);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// Action Download
if (isset($_GET['code'])) {
    $file = $uploadDir . $_GET['code'] . '.png';
    
    if (file_exists($file)) {
        header('Content-Type: image/png');
        header('Content-Disposition: inline; filename="AydaMaps_Card.png"');
        readfile($file);
    } else {
        header('HTTP/1.0 404 Not Found');
        echo "Fichier introuvable ou expiré";
    }
    exit;
}

echo json_encode(['error' => 'Action non valide']);
?>
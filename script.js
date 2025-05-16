// Configuration du QR Code
let qrCode = null;

function generateQR() {
    // Validation du formulaire
    const form = document.getElementById('dataForm');
    if (!form.checkValidity()) {
        alert('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }

    // Préparation des données
    const formData = {
        "الدوار": document.getElementById('douar').value.trim(),
        "أَفُوس": document.getElementById('afous').value.trim(),
        "العائلة": document.getElementById('famille').value.trim(),
        "الاسم الكامل": document.getElementById('nom_complet').value.trim(),
        "رقم الهاتف واتساب": document.getElementById('telephone').value.trim()
    };

    // Génération du QR Code
    const qrElement = document.getElementById('qrcode');
    qrElement.innerHTML = ''; // Nettoyage
    
    qrCode = new QRCode(qrElement, {
        text: JSON.stringify(formData, null, 2),
        width: 220,
        height: 220,
        colorDark: "#2563eb", // Bleu
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    // Affichage de la section QR
    document.querySelector('.qr-section').style.display = 'block';
    document.getElementById('downloadBtn').disabled = false;
    
    // Animation
    qrElement.style.opacity = 0;
    setTimeout(() => {
        qrElement.style.transition = 'opacity 0.5s';
        qrElement.style.opacity = 1;
    }, 100);
}

function downloadQR() {
    if (!qrCode) return;
    
    const qrImg = document.querySelector('#qrcode img');
    if (qrImg) {
        const link = document.createElement('a');
        link.download = 'رمز-البيانات-AydaMaps.png';
        link.href = qrImg.src;
        link.click();
    }
}

// Chargement des polices
document.addEventListener('DOMContentLoaded', () => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
});
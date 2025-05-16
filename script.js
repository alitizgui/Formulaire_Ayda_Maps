// Configuration globale
let qrCodeInstance = null;

function generateQR() {
    console.log("Début de la génération du QR Code"); // Debug 1
    
    // 1. Validation du formulaire
    const form = document.getElementById('dataForm');
    if (!form.checkValidity()) {
        alert('الرجاء ملء جميع الحقول المطلوبة');
        return false;
    }

    // 2. Préparation des données
    const formData = {
        "الدوار": document.getElementById('douar').value.trim(),
        "أَفُوس": document.getElementById('afous').value.trim(),
        "العائلة": document.getElementById('famille').value.trim(),
        "الاسم الكامل": document.getElementById('nom_complet').value.trim(),
        "رقم الهاتف واتساب": document.getElementById('telephone').value.trim()
    };
    console.log("Données du formulaire:", formData); // Debug 2

    // 3. Génération du QR Code
    const qrElement = document.getElementById('qrcode');
    if (!qrElement) {
        console.error("Erreur: Élément #qrcode introuvable!");
        return false;
    }

    // Nettoyage complet
    qrElement.innerHTML = '';
    
    try {
        // Solution garantie avec vérification de la librairie
        if (typeof QRCode === 'undefined') {
            throw new Error("La librairie QRCode n'est pas chargée");
        }

        qrCodeInstance = new QRCode(qrElement, {
            text: JSON.stringify(formData, null, 2),
            width: 220,
            height: 220,
            colorDark: "#2563eb",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        console.log("QR Code généré avec succès!"); // Debug 3
        
        // Affichage de la section
        document.querySelector('.qr-section').style.display = 'block';
        document.getElementById('downloadBtn').disabled = false;
        
        // Animation
        qrElement.style.opacity = 0;
        setTimeout(() => {
            qrElement.style.transition = 'opacity 0.5s';
            qrElement.style.opacity = 1;
        }, 100);

        return true;
    } catch (error) {
        console.error("Erreur critique:", error);
        
        // Solution de secours
        loadQRCodeLibrary()
            .then(() => generateQR())
            .catch(err => {
                alert(`خطأ فني: ${err.message}`);
                console.error("Échec du fallback:", err);
            });
        
        return false;
    }
}

// Fonction de secours pour charger la librairie
function loadQRCodeLibrary() {
    return new Promise((resolve, reject) => {
        if (typeof QRCode !== 'undefined') {
            resolve();
            return;
        }

        console.warn("Chargement de la librairie QRCode...");
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error("Échec du chargement de la librairie QRCode"));
        document.head.appendChild(script);
    });
}

// Téléchargement du QR Code
function downloadQR() {
    if (!qrCodeInstance) {
        alert("لا يوجد رمز استجابة للتحميل");
        return;
    }
    
    const qrImg = document.querySelector('#qrcode img');
    if (qrImg && qrImg.src) {
        const link = document.createElement('a');
        link.download = 'رمز-البيانات-AydaMaps.png';
        link.href = qrImg.src;
        link.click();
    } else {
        alert("تعذر إنشاء صورة الرمز");
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Chargement des polices
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Chargement préventif de la librairie QRCode
    loadQRCodeLibrary()
        .then(() => console.log("Librairie QRCode prête"))
        .catch(err => console.error("Erreur de chargement:", err));
});
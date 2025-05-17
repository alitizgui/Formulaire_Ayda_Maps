// Configuration globale
let qrCodeInstance = null;
const arabicRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\u064B-\u065F\u0670]+$/;

// Initialisation après chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Chargement des polices
    loadFonts();
    
    // Configuration des écouteurs d'événements
    setupEventListeners();
    
    // Chargement préventif de la librairie QRCode
    loadQRCodeLibrary().catch(console.error);
});

// Fonctions principales
function generateQR() {
    if (!validateForm()) {
        showAlert('الرجاء ملء جميع الحقول المطلوبة بشكل صحيح');
        return false;
    }

    const formData = prepareFormData();
    const qrElement = document.getElementById('qrcode');
    
    if (!qrElement) {
        console.error("Erreur: Élément #qrcode introuvable!");
        return false;
    }

    clearQRCode(qrElement);
    
    try {
        generateQRCode(qrElement, formData);
        showQRCodeSection();
        return true;
    } catch (error) {
        handleQRGenerationError(error);
        return false;
    }
}

function validateForm() {
    let isValid = true;
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        const errorElement = input.nextElementSibling;
        
        // Validation champ vide
        if (!input.value.trim()) {
            markInputAsInvalid(input, errorElement);
            isValid = false;
            return;
        }
        
        // Validation spécifique par type de champ
        if (input.id === 'telephone') {
            if (!validatePhone(input)) {
                markInputAsInvalid(input, errorElement);
                isValid = false;
            }
        } else if (!arabicRegex.test(input.value.trim())) {
            markInputAsInvalid(input, errorElement);
            isValid = false;
        } else {
            markInputAsValid(input, errorElement);
        }
    });
    
    return isValid;
}

// Fonctions utilitaires
function loadFonts() {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
}

function setupEventListeners() {
    // Validation en temps réel
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('input', function() {
            validateArabicInput(this);
        });
    });

    // Bouton de génération QR
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateQR);
    }

    // Bouton de téléchargement
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadQR);
    }
}

function validatePhone(input) {
    const phone = input.value;
    if (phone.startsWith('+') || phone.startsWith('00')) {
        return true;
    }
    return phone.startsWith('0') ? /^0[0-9]{9}$/.test(phone) : false;
}

function validateArabicInput(input) {
    const errorElement = input.nextElementSibling;
    if (!arabicRegex.test(input.value)) {
        markInputAsInvalid(input, errorElement);
    } else {
        markInputAsValid(input, errorElement);
    }
}

function markInputAsInvalid(input, errorElement) {
    input.style.borderColor = '#f87171';
    if (errorElement) errorElement.style.display = 'block';
}

function markInputAsValid(input, errorElement) {
    input.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    if (errorElement) errorElement.style.display = 'none';
}

function prepareFormData() {
    return {
        "الدوار": document.getElementById('douar').value.trim(),
        "أَفُوس": document.getElementById('afous').value.trim(),
        "العائلة": document.getElementById('famille').value.trim(),
        "الاسم الكامل": document.getElementById('nom_complet').value.trim(),
        "رقم الهاتف واتساب": document.getElementById('telephone').value.trim()
    };
}

function clearQRCode(element) {
    element.innerHTML = '';
}

function generateQRCode(element, data) {
    if (typeof QRCode === 'undefined') {
        throw new Error("La librairie QRCode n'est pas chargée");
    }

    qrCodeInstance = new QRCode(element, {
        text: JSON.stringify(data, null, 2),
        width: 220,
        height: 220,
        colorDark: "#2563eb",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function showQRCodeSection() {
    const qrElement = document.getElementById('qrcode');
    document.querySelector('.qr-section').style.display = 'block';
    document.getElementById('downloadBtn').disabled = false;
    
    // Animation
    qrElement.style.opacity = 0;
    setTimeout(() => {
        qrElement.style.transition = 'opacity 0.5s';
        qrElement.style.opacity = 1;
    }, 100);
}

function handleQRGenerationError(error) {
    console.error("Erreur critique:", error);
    loadQRCodeLibrary()
        .then(() => generateQR())
        .catch(err => {
            showAlert(`خطأ فني: ${err.message}`);
            console.error("Échec du fallback:", err);
        });
}

function downloadQR() {
    if (!qrCodeInstance) {
        showAlert("لا يوجد رمز استجابة للتحميل");
        return;
    }
    
    const qrImg = document.querySelector('#qrcode img');
    if (qrImg?.src) {
        const link = document.createElement('a');
        link.download = 'رمز-البيانات-AydaMaps.png';
        link.href = qrImg.src;
        link.click();
    } else {
        showAlert("تعذر إنشاء صورة الرمز");
    }
}

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

function showAlert(message) {
    alert(message);
}
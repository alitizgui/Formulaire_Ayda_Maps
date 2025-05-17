// Configuration globale
let qrCodeInstance = null;
const arabicRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\u064B-\u065F\u0670]+$/;
const PDF_CONFIG = {
    margin: [5, 5, 5, 5],
    imageQuality: 0.95,
    scale: 1.8
};

// Initialisation après chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Chargement des polices
    loadFonts();
    
    // Configuration des écouteurs d'événements
    setupEventListeners();
    
    // Chargement préventif des librairies
    Promise.all([
        loadQRCodeLibrary(),
        loadHtml2PdfLibrary()
    ]).catch(console.error);
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

async function generatePDF() {
    try {
        // 1. Préparation du contenu
        const element = document.getElementById('main-content');
        const clone = element.cloneNode(true);
        document.body.appendChild(clone);

        // 2. Optimisation pour l'impression
        clone.style.width = '100%';
        clone.style.padding = '0';
        clone.style.margin = '0';
        clone.style.backgroundColor = '#fff';

        // 3. Ajustement des styles
        const formContainer = clone.querySelector('.form-container');
        if (formContainer) {
            formContainer.style.maxWidth = '100%';
            formContainer.style.padding = '15px';
            formContainer.style.margin = '0 auto';
            formContainer.style.background = '#fff';
            formContainer.style.color = '#000';
            formContainer.style.boxShadow = 'none';
        }

        // 4. Ajustement typographique
        clone.querySelectorAll('label').forEach(label => {
            label.style.fontSize = '1.1rem';
            label.style.color = '#000';
        });

        clone.querySelectorAll('input').forEach(input => {
            input.style.fontSize = '1rem';
            input.style.width = '100%';
            input.style.backgroundColor = '#f9f9f9';
            input.style.color = '#000';
            input.style.border = '1px solid #ddd';
        });

        // 5. Optimisation du QR Code
        const qrcode = clone.querySelector('#qrcode');
        if (qrcode) {
            qrcode.style.width = '120px';
            qrcode.style.height = '120px';
            qrcode.style.margin = '10px auto';
            qrcode.style.border = '1px solid #eee';
        }

        // 6. Génération du PDF
        await html2pdf()
            .set({
                ...PDF_CONFIG,
                filename: `AydaMaps_${document.getElementById('uniqueCode')?.textContent || new Date().getTime()}.pdf`,
                html2canvas: {
                    ...PDF_CONFIG,
                    windowWidth: document.documentElement.offsetWidth,
                    windowHeight: document.documentElement.offsetHeight,
                    scrollX: 0,
                    scrollY: 0
                }
            })
            .from(clone)
            .save();

        // 7. Nettoyage
        document.body.removeChild(clone);
        
        // 8. Retour utilisateur
        if (typeof showThankYouPage === 'function') {
            showThankYouPage();
        }

    } catch (error) {
        console.error('Erreur PDF:', error);
        showAlert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى');
        
        // Nettoyage en cas d'erreur
        const clone = document.querySelector('body > #main-content[style*="width: 100%"]');
        if (clone) document.body.removeChild(clone);
    }
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

    // Bouton de téléchargement QR
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadQR);
    }

    // Bouton de génération PDF
    const pdfBtn = document.getElementById('download-pdf');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', generatePDF);
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

function loadHtml2PdfLibrary() {
    return new Promise((resolve, reject) => {
        if (typeof html2pdf !== 'undefined') {
            resolve();
            return;
        }

        console.warn("Chargement de la librairie html2pdf...");
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error("Échec du chargement de la librairie html2pdf"));
        document.head.appendChild(script);
    });
}

function showAlert(message) {
    alert(message);
}

function showThankYouPage() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('thank-you-page').style.display = 'block';
}
// Configuration globale
let qrCodeInstance = null;
let inactivityTimer;
let userInteracted = false;
const arabicRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\u064B-\u065F\u0670]+$/;

// Initialisation après chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Génération du code unique
    document.getElementById('uniqueCode').textContent = generateUniqueCode();
    
    // Configuration des écouteurs d'événements
    setupEventListeners();
});

// Fonction pour générer le code unique
function generateUniqueCode() {
    const now = new Date();
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    return seconds + minutes + hours + day + month + year;
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Validation en temps réel
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('input', function() {
            validateArabicInput(this);
        });
    });

    // Validation téléphone
    document.getElementById('telephone').addEventListener('input', function() {
        this.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        document.getElementById('phoneError').style.display = 'none';
    });

    // Bouton de génération QR
    document.getElementById('generate-btn').addEventListener('click', generateQR);

    // Bouton de téléchargement PDF
    document.getElementById('download-pdf').addEventListener('click', generateAndDownloadPDF);

    // Timer d'inactivité
    document.addEventListener('mousedown', resetInactivityTimer);
    document.addEventListener('touchstart', resetInactivityTimer);
    document.addEventListener('keydown', resetInactivityTimer);
}

// Fonction de génération QR
function generateQR() {
    if (!validateForm()) {
        alert("الرجاء ملء جميع البيانات المطلوبة بشكل صحيح");
        return;
    }
    
    const formData = {
        "رقم التسجيل": document.getElementById('uniqueCode').textContent,
        "الدوار": cleanInput(document.getElementById('douar').value),
        "أَفُوس": cleanInput(document.getElementById('afous').value),
        "العائلة": cleanInput(document.getElementById('famille').value),
        "الاسم واللقب": cleanInput(document.getElementById('nom').value),
        "رقم الهاتف واتساب": cleanPhoneNumber(document.getElementById('telephone').value),
        "فئة الانخراط": document.getElementById('system-type').value // <- Retire encodeURIComponent  
      };
    
    const qrElement = document.getElementById('qrcode');
    qrElement.innerHTML = '';
    
    try {
        qrCodeInstance = new QRCode(qrElement, {
            text: JSON.stringify(formData),
            width: 300,
            height: 300,
            colorDark: "#ffffff",
            colorLight: "#1e1e1e"
        });
        
        // Animation
        setTimeout(() => {
            qrElement.classList.add('blink');
            setTimeout(() => {
                qrElement.classList.remove('blink');
                showThankYouPage();
            }, 3000);
        }, 500);
    } catch (error) {
        console.error("Erreur QR Code:", error);
        qrElement.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(JSON.stringify(formData))}&size=300x300&color=ffffff&bgcolor=1e1e1e" alt="QR Code">`;
        showThankYouPage();
    }
}

// Fonction pour générer et télécharger le PDF
async function generateAndDownloadPDF() {
    try {
        // Créer un clone de l'élément à imprimer
        const element = document.getElementById('main-content');
        const clone = element.cloneNode(true);
        
        // Appliquer les styles nécessaires pour l'impression
        clone.style.width = '100%';
        clone.style.padding = '20px';
        clone.style.margin = '0';
        clone.style.backgroundColor = '#fff';
        clone.style.color = '#000';
        
        // Ajuster les styles des éléments enfants
        const formContainer = clone.querySelector('.form-container');
        if (formContainer) {
            formContainer.style.maxWidth = '100%';
            formContainer.style.padding = '20px';
            formContainer.style.margin = '0 auto';
            formContainer.style.background = '#fff';
            formContainer.style.color = '#000';
            formContainer.style.boxShadow = 'none';
        }
        
        // Ajuster les inputs
        clone.querySelectorAll('input').forEach(input => {
            input.style.backgroundColor = '#fff';
            input.style.color = '#000';
            input.style.border = '1px solid #000';
        });
        
        // Options de génération PDF
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `AydaMaps_${document.getElementById('uniqueCode').textContent}.pdf`,
            image: { 
                type: 'jpeg', 
                quality: 1 
            },
            html2canvas: { 
                scale: 2,
                logging: true,
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: document.getElementById('main-content').scrollWidth,
                width: document.getElementById('main-content').scrollWidth
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };
        
        // Générer et télécharger le PDF
        await html2pdf().set(opt).from(clone).save();
        
    } catch (error) {
        console.error('Erreur PDF:', error);
        alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى');
    }
}

// Fonctions de validation
function validateForm() {
    let isValid = true;
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        const errorElement = document.getElementById(`${input.id}Error`);
        
        if (!input.value.trim()) {
            markInputAsInvalid(input, errorElement);
            isValid = false;
        } else if (input.id === 'telephone') {
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

// Gestion du timer d'inactivité
function startInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    userInteracted = false;
    inactivityTimer = setTimeout(() => {
        if (!userInteracted) showThankYouPage();
    }, 5000);
}

function resetInactivityTimer() {
    userInteracted = true;
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        startInactivityTimer();
    }
}

function showThankYouPage() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('thank-you-page').style.display = 'block';
    }
    
// Charger les témoignages
async function loadTestimonials() {
    const response = await fetch('http://localhost:3000/api/testimonials');
    const data = await response.json();
    // ... Afficher les données ...
}
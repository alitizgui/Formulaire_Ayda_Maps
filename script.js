// Configuration globale
let qrCodeInstance = null;
const arabicRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\u064B-\u065F\u0670]+$/;
const PDF_CONFIG = {
    margin: [5, 5, 5, 5],
    imageQuality: 0.98,
    scale: 2 // Augmenté pour une meilleure qualité
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

// [Les autres fonctions restent identiques jusqu'à generatePDF...]

async function generatePDF() {
    try {
        // 1. Créer un clone optimisé du contenu visible
        const element = document.getElementById('main-content');
        const clone = element.cloneNode(true);
        
        // 2. Appliquer des styles spécifiques pour l'impression
        clone.style.width = '100%';
        clone.style.padding = '0';
        clone.style.margin = '0';
        clone.style.backgroundColor = '#fff';
        clone.style.color = '#000';

        // 3. Ajuster les éléments clés
        const formContainer = clone.querySelector('.form-container');
        if (formContainer) {
            formContainer.style.maxWidth = '100%';
            formContainer.style.padding = '20px';
            formContainer.style.margin = '0 auto';
            formContainer.style.background = '#fff';
            formContainer.style.boxShadow = 'none';
        }

        // 4. Optimiser la taille des textes et éléments
        clone.querySelectorAll('label').forEach(label => {
            label.style.fontSize = '16px';
            label.style.color = '#000';
        });

        clone.querySelectorAll('input').forEach(input => {
            input.style.fontSize = '14px';
            input.style.width = '100%';
            input.style.backgroundColor = '#f9f9f9';
            input.style.color = '#000';
            input.style.border = '1px solid #ddd';
        });

        // 5. Ajuster le QR Code pour l'impression
        const qrcode = clone.querySelector('#qrcode');
        if (qrcode) {
            qrcode.style.width = '150px';
            qrcode.style.height = '150px';
            qrcode.style.margin = '10px auto';
        }

        // 6. Créer un conteneur temporaire
        const printContainer = document.createElement('div');
        printContainer.appendChild(clone);
        document.body.appendChild(printContainer);

        // 7. Configuration PDF optimisée
        const opt = {
            ...PDF_CONFIG,
            filename: `AydaMaps_${document.getElementById('uniqueCode').textContent}.pdf`,
            html2canvas: {
                ...PDF_CONFIG,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight,
                scrollX: 0,
                scrollY: 0,
                scale: 2 // Qualité augmentée
            },
            pagebreak: { mode: 'avoid-all' } // Empêcher les sauts de page
        };

        // 8. Générer le PDF
        await html2pdf()
            .set(opt)
            .from(printContainer)
            .save();

        // 9. Nettoyage
        document.body.removeChild(printContainer);
        
        // 10. Afficher la page de remerciement
        showThankYouPage();

    } catch (error) {
        console.error('Erreur PDF:', error);
        showAlert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى');
        
        // Nettoyage en cas d'erreur
        const printContainer = document.querySelector('body > div:last-child');
        if (printContainer) document.body.removeChild(printContainer);
    }
}

// [Le reste des fonctions reste inchangé...]

// Nouvelle fonction pour charger html2pdf
function loadHtml2PdfLibrary() {
    return new Promise((resolve, reject) => {
        if (typeof html2pdf !== 'undefined') {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error("Échec du chargement de la librairie html2pdf"));
        document.head.appendChild(script);
    });
}
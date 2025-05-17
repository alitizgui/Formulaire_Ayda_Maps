async function generatePDF() {
    try {
        // Créer un conteneur spécial pour l'impression
        const printContainer = document.createElement('div');
        printContainer.id = 'pdf-print-container';
        printContainer.style.position = 'fixed';
        printContainer.style.left = '0';
        printContainer.style.top = '0';
        printContainer.style.width = '600px';
        printContainer.style.zIndex = '99999';
        printContainer.style.opacity = '0';
        printContainer.style.pointerEvents = 'none';
        
        // Cloner le contenu original
        const element = document.getElementById('main-content');
        const clone = element.cloneNode(true);
        printContainer.appendChild(clone);
        document.body.appendChild(printContainer);

        // Appliquer les styles d'impression
        clone.style.width = '100%';
        clone.style.padding = '20px';
        clone.style.margin = '0';
        clone.style.backgroundColor = '#fff';
        clone.style.color = '#000';

        // Ajustements spécifiques
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
                windowWidth: 600,
                width: 600
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };

        // Générer le PDF et obtenir l'URL
        const pdf = await html2pdf()
            .set(opt)
            .from(printContainer)
            .toPdf()
            .get('pdf');
        
        const blob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(blob);

        // Nettoyage
        document.body.removeChild(printContainer);

        return pdfUrl;

    } catch (error) {
        console.error('Erreur PDF:', error);
        throw new Error('حدث خطأ أثناء إنشاء ملف PDF');
    }
}

async function showThankYouPage() {
    try {
        // Générer le PDF d'abord
        const pdfUrl = await generatePDF();
        
        // Configurer le bouton de téléchargement
        const downloadBtn = document.getElementById('download-pdf');
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `AydaMaps_${document.getElementById('uniqueCode').textContent}.pdf`;
            link.click();
        };
        
        // Afficher la page de remerciement seulement après
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('thank-you-page').style.display = 'block';
        
    } catch (error) {
        console.error("Erreur:", error);
        alert(error.message);
        // Revenir à la page principale en cas d'erreur
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('thank-you-page').style.display = 'none';
    }
}

// Modifier generateQR() pour utiliser la nouvelle approche
function generateQR() {
    if (!validateForm()) {
        alert("الرجاء ملء جميع البيانات المطلوبة بشكل صحيح");
        return;
    }
    
    const formData = {
        "رقم التسجيل": document.getElementById('uniqueCode').textContent,
        "الدوار": document.getElementById('douar').value,
        "أَفُوس": document.getElementById('afous').value,
        "العائلة": document.getElementById('famille').value,
        "الاسم واللقب": document.getElementById('nom').value,
        "رقم الهاتف واتساب": document.getElementById('telephone').value
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
        
        // Animation puis passage à la page de remerciement
        setTimeout(() => {
            qrElement.classList.add('blink');
            setTimeout(() => {
                qrElement.classList.remove('blink');
                showThankYouPage(); // Appel direct sans timer
            }, 3000);
        }, 500);
    } catch (error) {
        console.error("Erreur QR Code:", error);
        qrElement.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(JSON.stringify(formData))}&size=300x300&color=ffffff&bgcolor=1e1e1e" alt="QR Code">`;
        showThankYouPage();
    }
}

// Supprimer l'ancien timer d'inactivité si présent
// et adapter les gestionnaires d'événements correspondants
async function generatePDF() {
    try {
        // 1. Créer un conteneur spécial pour l'impression
        const printContainer = document.createElement('div');
        printContainer.style.position = 'absolute';
        printContainer.style.left = '-9999px';
        printContainer.style.width = '600px';
        
        // 2. Cloner le contenu visible
        const element = document.getElementById('main-content');
        const clone = element.cloneNode(true);
        printContainer.appendChild(clone);
        document.body.appendChild(printContainer);

        // 3. Appliquer les styles d'impression
        clone.style.width = '100%';
        clone.style.padding = '0';
        clone.style.margin = '0';
        clone.style.backgroundColor = '#fff';

        // 4. Ajustements spécifiques
        const formContainer = clone.querySelector('.form-container');
        if (formContainer) {
            formContainer.style.maxWidth = '100%';
            formContainer.style.padding = '20px';
            formContainer.style.background = '#fff';
            formContainer.style.color = '#000';
        }

        // 5. Configurer html2pdf
        const opt = {
            margin: 10,
            filename: `AydaMaps_${document.getElementById('uniqueCode').textContent}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                logging: true,
                useCORS: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 600 // Largeur fixe pour une meilleure consistance
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };

        // 6. Générer le PDF
        await new Promise((resolve) => {
            html2pdf()
                .set(opt)
                .from(printContainer)
                .save()
                .then(resolve);
            
            // Temporisation pour permettre le rendu
            setTimeout(resolve, 1000);
        });

        // 7. Nettoyage final
        document.body.removeChild(printContainer);
        showThankYouPage();

    } catch (error) {
        console.error('Erreur PDF:', error);
        showAlert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى');
        
        // Nettoyage en cas d'erreur
        const container = document.querySelector('div[style*="absolute"]');
        if (container) document.body.removeChild(container);
    }
}
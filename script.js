function generateQR() {
    const data = {
        nom: document.getElementById('nom').value,
        // Ajoutez autres champs ici
    };

    new QRCode(document.getElementById("qrcode"), {
        text: JSON.stringify(data),
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff"
    });
}

// Basculer entre français/arabe
function switchLanguage(lang) {
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = el.getAttribute('data-lang') === lang ? 'block' : 'none';
    });
}
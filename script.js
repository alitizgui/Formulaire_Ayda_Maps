function generateQR() {
    const formData = {
      "الدوار": document.getElementById('douar').value,
      "أَفُوس": document.getElementById('afous').value,
      "العائلة": document.getElementById('famille').value,
      "الاسم الكامل": document.getElementById('nom_complet').value,
      "رقم الهاتف واتساب": document.getElementById('telephone').value
    };
  
    // Vider le contenu précédent du QR Code
    document.getElementById('qrcode').innerHTML = "";
    
    // Générer le nouveau QR Code
    new QRCode(document.getElementById("qrcode"), {
      text: JSON.stringify(formData, null, 2),
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff"
    });
  }
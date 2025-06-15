const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir les fichiers frontend

// Base de données temporaire
let testimonialsDB = [];

// API pour les témoignages
app.post('/api/testimonials', (req, res) => {
    const newTestimonial = {
        id: Date.now().toString(),
        ...req.body,
        approved: false,
        date: new Date().toISOString()
    };
    testimonialsDB.push(newTestimonial);
    res.status(201).json(newTestimonial);
});

// API pour récupérer les témoignages approuvés
app.get('/api/testimonials', (req, res) => {
    const approvedTestimonials = testimonialsDB.filter(t => t.approved);
    res.json(approvedTestimonials);
});

// API pour l'admin (validation)
app.patch('/api/testimonials/:id/approve', (req, res) => {
    const testimonial = testimonialsDB.find(t => t.id === req.params.id);
    if (testimonial) {
        testimonial.approved = true;
        res.json(testimonial);
    } else {
        res.status(404).json({ error: 'Témoignage non trouvé' });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
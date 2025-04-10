// routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// Verificar sesión y rol "user"
router.use((req, res, next) => {
  if (req.session.user && req.session.user.role === 'Usuario') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'No autorizado.' });
  }
});

// Procesar búsqueda: se espera que la petición envíe JSON con "searchWord"
router.post('/', (req, res) => {
  pdfController.searchPdf(req, res);
});

module.exports = router;

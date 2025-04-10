// routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const pdfController = require('../controllers/pdfController');

// Middleware para restringir acceso a administradores
router.use((req, res, next) => {
  console.log("Sesión actual:", req.session);
  if (req.session.user && req.session.user.role === 'Administrador') {
    next();
  } else {
    res.redirect('/login');
  }
});


// Configurar multer: guarda los archivos en la carpeta "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Se usa timestamp para evitar duplicados
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Panel de administración: listar PDFs
router.get('/', pdfController.getIndex);

// Ruta para subir un PDF (se extrae y almacena el texto)
router.post('/upload', upload.single('pdf'), pdfController.uploadPdf);

// Ruta para eliminar un PDF
router.get('/delete/:id', pdfController.deletePdf);

module.exports = router;

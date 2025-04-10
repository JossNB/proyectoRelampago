// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

// Mostrar formulario de registro
router.get('/registro', registroController.getRegistro);

// Procesar el formulario de registro (POST)
router.post('/registro', registroController.registrarUsuario);

module.exports = router;

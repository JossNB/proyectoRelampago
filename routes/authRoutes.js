const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Mostrar formulario de login
router.get('/login', authController.getLogin);

// Procesar credenciales de login
router.post('/login', authController.postLogin);

// Cerrar sesión
router.get('/logout', authController.logout);

// Ruta para el dashboard de administrador
router.get('/admin', (req, res) => {
    if (req.session.user && req.session.user.role === 'Administrador') {
      // Pasa el objeto del usuario a la vista
      res.render('admin', { 
        user: req.session.user,
        pdfList: [] // o la lista real si ya la tienes
      });
    } else {
      res.redirect('/login'); // Redirige al login si no está autenticado o no es administrador
    }
  });

// Ruta para el dashboard de usuario normal
router.get('/user', (req, res) => {
  if (req.session.user) {
    res.render('user', { user: req.session.user }); // Vista para el usuario normal
  } else {
    res.redirect('/login'); // Redirige al login si no está autenticado
  }
});

module.exports = router;

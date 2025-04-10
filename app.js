// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');


const app = express();
const port = 3000;

// Arreglo en memoria para guardar los PDFs
let pdfList = [];

// Configurar EJS como motor de vistas y definir carpeta de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos (por ejemplo, CSS) y la carpeta uploads
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/documentos', express.static(path.join(__dirname, 'uploads')));


// Middleware para parsear datos de formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones
app.use(session({
  secret: 'tuSecretoMuySeguro',
  resave: false,
  saveUninitialized: false
}));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const searchRoutes = require('./routes/searchRoutes');
const registroRoutes = require('./routes/registroRoutes')

// Función para cargar los PDFs existentes desde la carpeta 'pdfs'
const loadExistingPdfs = () => {
  const dir = path.join(__dirname, 'uploads'); // Carpeta donde se guardan los PDFs
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error('Error al leer la carpeta de PDFs:', err);
      return;
    }

    files.forEach(file => {
      if (file.endsWith('.pdf')) {
        const filePath = path.join(dir, file);
        fs.readFile(filePath, (err, dataBuffer) => {
          if (err) {
            console.error('Error al leer el archivo:', err);
            return;
          }

          pdfParse(dataBuffer).then(data => {
            const pdfRecord = {
              id: pdfList.length + 1,
              originalName: file,
              filename: file,
              path: filePath,
              text: data.text
            };
            pdfList.push(pdfRecord);
          }).catch(error => {
            console.error('Error al procesar el PDF:', error);
          });
        });
      }
    });
  });
};


// Cargar archivos PDF existentes
loadExistingPdfs();

// Rutas de autenticación y login
app.use('/', authRoutes);

// Rutas para administradores (CRUD de PDFs)
app.use('/admin', pdfRoutes);

// Ruta para la vista de usuario (buscador de PDFs)
app.get('/user', (req, res) => {
  if (req.session.user && req.session.user.role === 'Usuario') {
    res.render('user', { user: req.session.user });
  } else {
    res.redirect('/login');
  }
});
app.get('/', (req, res) => {
    res.redirect('/login'); // Redirige al login o a otra página inicial
  });

// Ruta para procesar la búsqueda (accesible para usuarios)
app.use('/search', searchRoutes);

app.use('/', registroRoutes);  

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

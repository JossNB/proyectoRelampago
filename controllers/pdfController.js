// controllers/pdfController.js
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Arreglo en memoria para guardar los PDFs
let pdfList = [];

const loadExistingPdfs = async () => {
  const dir = path.join(__dirname, '../uploads'); // Carpeta donde se guardan los PDFs
  try {
    // Lee los archivos de la carpeta
    const files = await fs.promises.readdir(dir);
    console.log('Archivos encontrados en la carpeta:', files); // Verificar los archivos encontrados

    const pdfPromises = files
      .filter(file => file.endsWith('.pdf')) // Filtra solo los archivos PDF
      .map(file => {
        const filePath = path.join(dir, file);
        console.log('Leyendo archivo PDF:', file); // Verificar que estamos leyendo el archivo correcto
        return fs.promises.readFile(filePath)
          .then(dataBuffer => pdfParse(dataBuffer)) // Parsear el archivo PDF
          .then(data => {
            const pdfRecord = {
              id: pdfList.length + 1,
              originalName: file,
              filename: file,
              path: filePath,
              text: data.text,
            };
            pdfList.push(pdfRecord);
          });
      });

    // Espera que todas las promesas de los PDFs se resuelvan
    await Promise.all(pdfPromises);

    console.log('PDFs cargados correctamente:', pdfList); // Verificar que los PDFs se cargaron correctamente
  } catch (err) {
    console.error('Error al leer los archivos de la carpeta:', err);
  }
};

// Llamar a la función para cargar los PDFs al iniciar
loadExistingPdfs();

exports.getIndex = async (req, res) => {
  try {
    await loadExistingPdfs();
    console.log('Lista de PDFs cargados:', pdfList);
    console.log('Datos que se pasan a la vista:', pdfList);
    if (pdfList.length === 0) {
      console.log('No hay PDFs en la lista.');
    }
    res.render('admin', { pdfList: pdfList, user: req.session.user });
  } catch (err) {
    console.error('Error al cargar los PDFs:', err);
    res.render('admin', { pdfList: [], user: req.session.user });
  }
};

exports.uploadPdf = (req, res) => {
  console.log('➡️ Entró al controlador uploadPdf');
  if (!req.file) {
    console.log('⚠️ No se recibió ningún archivo');
    return res.status(400).send('No se ha enviado ningún archivo.');
  }
  console.log('✅ Archivo recibido:', req.file.originalname);
  const filePath = req.file.path;
  // Leer el archivo y extraer el texto usando pdf-parse
  fs.readFile(filePath, (err, dataBuffer) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return res.status(500).send('Error al leer el archivo.');
    }
    pdfParse(dataBuffer)
      .then(function(data) {
        const pdfRecord = {
          id: pdfList.length + 1,
          originalName: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          text: data.text  // Texto extraído del PDF
        };
        pdfList.push(pdfRecord);
        res.redirect('/admin');
      })
      .catch(error => {
        console.error('Error al procesar el PDF:', error);
        res.status(500).send('Error al procesar el PDF.');
      });
  });
};

exports.deletePdf = (req, res) => {
  const id = parseInt(req.params.id);
  const index = pdfList.findIndex(pdf => pdf.id === id);
  if (index === -1) {
    return res.status(404).send('Archivo no encontrado.');
  }
  const pdf = pdfList[index];
  fs.unlink(pdf.path, (err) => {
    if (err) {
      console.error('Error eliminando el archivo:', err);
    }
    pdfList.splice(index, 1);
    res.redirect('/admin');
  });
};





// Función para buscar en los PDFs (para usuarios)
exports.searchPdf = (req, res) => {
  const searchWord = req.body.searchWord;
  if (!searchWord) {
    return res.json({ success: false, message: 'Falta palabra de búsqueda.' });
  }

  const results = [];
  pdfList.forEach(pdf => {
    if (pdf.text && pdf.text.toLowerCase().includes(searchWord.toLowerCase())) {
      // Buscar coincidencias y extraer fragmentos (snippets)
      const regex = new RegExp(`(.{0,50})(${searchWord})(.{0,50})`, 'gi');
      const snippets = [];
      let match;
      while ((match = regex.exec(pdf.text)) !== null) {
        snippets.push(match[0]);
      }
      results.push({
        pdfName: pdf.originalName,
        count: snippets.length,
        snippets: snippets
      });
    }
  });

  return res.json({ success: true, data: results });
};

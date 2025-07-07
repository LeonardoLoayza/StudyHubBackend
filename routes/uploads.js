const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('db.js'); // tu conexión MySQL

// Configuración de almacenamiento multer local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // carpeta donde se guardan temporalmente
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // nombre único
  }
});

const upload = multer({ storage });

// POST subir recurso PDF local
router.post('/upload', upload.single('archivo'), async (req, res) => {
  try {
    const { titulo, descripcion, id_curso, id_usuario } = req.body;
    const archivoURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const recurso = {
      titulo,
      descripcion,
      tipo: 'PDF',
      archivo: archivoURL,
      id_curso,
      id_usuario
    };

    await pool.query(
      `INSERT INTO recursos (titulo, descripcion, tipo, archivo, id_curso, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [recurso.titulo, recurso.descripcion, recurso.tipo, recurso.archivo, recurso.id_curso, recurso.id_usuario]
    );

    res.json({ mensaje: 'Recurso subido correctamente', recurso });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al subir recurso' });
  }
});

module.exports = router;
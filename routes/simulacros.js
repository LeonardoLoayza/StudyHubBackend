const express = require('express');
const router = express.Router();
const db = require('./db'); // 👉 nuevo: importamos el pool

// Guardar un puntaje
router.post('/guardar', async (req, res) => {
  const { duracion, preguntas, puntaje, id_curso, id_usuario } = req.body;

  try {
    await db.query(
      'INSERT INTO simulacros_examenes (duracion, preguntas, puntaje, fecha_realizacion, id_curso, id_usuario) VALUES (?, ?, ?, NOW(), ?, ?)',
      [duracion, preguntas, puntaje, id_curso, id_usuario]
    );
    res.json({ success: true, message: 'Puntaje guardado correctamente' });
  } catch (error) {
    console.error('Error guardando puntaje:', error);
    res.status(500).json({ success: false, message: 'Error guardando puntaje' });
  }
});

// Obtener todos los puntajes de un usuario
router.get('/puntajes/usuario/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [resultados] = await db.query(
      `SELECT 
        s.*, 
        c.nombre_curso
      FROM simulacros_examenes s
      JOIN curso c ON s.id_curso = c.id_curso
      WHERE s.id_usuario = ?
      ORDER BY s.fecha_realizacion DESC`,
      [id]
    );
    res.json(resultados);
  } catch (error) {
    console.error('Error al obtener puntajes:', error);
    res.status(500).json({ mensaje: 'Error al obtener puntajes', error });
  }
});


module.exports = router;
const express = require('express');
const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  try {
    const [results] = await req.db.query(
      'SELECT id_usuario, nombre, email, fecha_registro, ultimo_acceso, universidad FROM usuario WHERE email = ? AND password = ?',
      [email, password]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Guardar sesión
    req.session.usuario = results[0];

    res.json({ mensaje: 'Login exitoso', usuario: results[0] });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// REGISTRO
router.post('/signup', async (req, res) => {
  const { nombre, email, password, universidad } = req.body;

  if (!nombre || !email || !password || !universidad) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  try {
    // Verificar si ya existe
    const [existing] = await req.db.query('SELECT * FROM usuario WHERE email = ?', [email]);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Correo ya registrado' });
    }

    // Insertar nuevo usuario
    await req.db.query(
      'INSERT INTO usuario (nombre, email, password, universidad) VALUES (?, ?, ?, ?)',
      [nombre, email, password, universidad]
    );

    res.json({ mensaje: 'Registro exitoso' });

  } catch (err) {
    console.error('Error en signup:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// PERFIL
router.get('/perfil', (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  res.json({ usuario: req.session.usuario });
});

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ mensaje: 'Sesión cerrada' });
  });
});

module.exports = router;

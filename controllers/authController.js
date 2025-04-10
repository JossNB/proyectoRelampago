const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('../dbConfig');

// Mostrar la página de login
exports.getLogin = (req, res) => {
  res.render('login');
};

// Iniciar sesión (verificar usuario y contraseña en la base de datos)
exports.postLogin = async (req, res) => {
  const { Correo, Password } = req.body;

  if (!Correo || !Password) {
    return res.render('login', { error: 'Por favor ingrese usuario y contraseña.' });
  }

  try {
    const pool = await poolPromise;

    // Verificar si el usuario existe en la base de datos
    const result = await pool.request()
      .input('Correo', sql.VarChar, Correo)
      .query('SELECT * FROM Usuario WHERE Correo = @Correo');

    const user = result.recordset[0]; // Tomamos el primer resultado (si existe)

    if (user) {
      // Verificar si la contraseña es correcta usando bcrypt
      const match = await bcrypt.compare(Password, user.Password);
      
      if (match) {
        req.session.user = {
          id: user.Id, // Asumiendo que tienes un campo 'Id' en la base de datos
          username: user.Correo,
          role: user.Rol
        };

        // Redirige según el rol
        if (user.Rol === 'Administrador') {
          res.redirect('/admin');
        } else {
          res.redirect('/user');
        }
      } else {
        res.render('login', { error: 'Credenciales incorrectas.' });
      }
    } else {
      res.render('login', { error: 'Usuario no encontrado.' });
    }
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Error al intentar iniciar sesión. Intente de nuevo más tarde.' });
  }
};

// Cerrar sesión
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('../dbConfig');

const getRegistro = (req, res) => {
    res.render('registro', { mensaje: null });
};

const registrarUsuario = async (req, res) => {
  const { Nombre, Apellidos, Correo, Password, Rol } = req.body;

  if (!Nombre || !Apellidos || !Correo || !Password || !Rol) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
  }

  try {
    const pool = await poolPromise;

    // Verificar si ya existe el correo
    const result = await pool.request()
      .input('Correo', sql.VarChar, Correo) // Correo, no 'correo'
      .query('SELECT * FROM Usuario WHERE Correo = @Correo');

    if (result.recordset.length > 0) {
        return res.render('registro', { mensaje: 'El correo ya está registrado.' });
    }

    // Encriptar la contraseña
    const hash = await bcrypt.hash(Password, 10); // Password, no 'contraseña'

    // Insertar usuario
    await pool.request()
      .input('Nombre', sql.VarChar, Nombre)
      .input('Apellidos', sql.VarChar, Apellidos)
      .input('Correo', sql.VarChar, Correo)
      .input('Password', sql.VarChar, hash)
      .input('Rol', sql.VarChar, Rol)
      .query('INSERT INTO Usuario (Nombre, Apellidos, Correo, Password, Rol) VALUES (@Nombre, @Apellidos, @Correo, @Password, @Rol)');

    res.render('registro', { mensaje: 'Usuario registrado exitosamente.' });

  } catch (error) {
    console.error(error);
    res.render('registro', { mensaje: 'Error al registrar el usuario.' });
  }
};

module.exports = {
  getRegistro,
  registrarUsuario
};

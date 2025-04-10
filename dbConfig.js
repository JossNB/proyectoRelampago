const port = 3050;
const sql = require('mssql');

// Conexión a la base de datos SQL SERVER

const dbConfig = {
    user: 'relampago25', // 
    password: 'relampago123', 
    server: 'tiusr10pl.cuc-carrera-ti.ac.cr', 
    database: 'relampagoamj', 
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  };

  const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
      console.log('Conexión a SQL Server exitosa');
      return pool;
  })
  .catch(err => {
      console.error('Error en la conexión:', err);
  });

  module.exports = {
    sql,
    poolPromise
  };
  
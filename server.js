require('dotenv').config();
const express = require('express');
const path = require('path');
const sql = require('mssql');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------------------------------------
// CONFIGURACIÓN DE CONEXIÓN A LA BASE DE DATOS
// ------------------------------------------------------------
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'Tarea2Camila',
  server: process.env.DB_SERVER || 'mssql-201669-0.cloudclusters.net',
  port: Number(process.env.DB_PORT) || 10029,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool;
async function getPool() {
  if (pool) return pool;
  pool = await sql.connect(dbConfig);
  console.log('Conectado a la base de datos correctamente.');
  return pool;
}

// ------------------------------------------------------------
// ENDPOINT PRINCIPAL: LISTAR EMPLEADOS ACTIVOS
// ------------------------------------------------------------
app.get('/api/empleados', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();

    // Declarar parámetro de salida
    request.output('outResultCode', sql.Int);

    const result = await request.execute('SP_ListarInicioEmpleado');

    // Puedes usar result.output.outResultCode si quieres validar el código de retorno
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener empleados:', err);
    res.status(500).json({ error: 'Error al obtener empleados.' });
  }
});


// ------------------------------------------------------------
// RUTA POR DEFECTO PARA CARGAR LA PANTALLA PRINCIPAL
// ------------------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ------------------------------------------------------------
// INICIO DEL SERVIDOR
// ------------------------------------------------------------
const PORT = process.env.PORT || 10029;
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});

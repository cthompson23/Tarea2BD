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
    request.output('outResultCode', sql.Int);
    const result = await request.execute('SP_ListarInicioEmpleado');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener empleados:', err);
    res.status(500).json({ error: 'Error al obtener empleados.' });
  }
});

// ------------------------------------------------------------
// ENDPOINT: LISTAR PUESTOS
// ------------------------------------------------------------
app.get('/api/puestos', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT Id, Nombre FROM Puesto ORDER BY Nombre ASC');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener puestos:', err);
    res.status(500).json({ error: 'Error al obtener puestos.' });
  }
});

// ------------------------------------------------------------
// ENDPOINT: INSERTAR EMPLEADO
// ------------------------------------------------------------
app.post('/api/empleados', async (req, res) => {
  try {
    const {
      ValorDocumentoIdentidad,
      Nombre,
      IdPuesto,
      FechaContratacion,
      IdPostByUser,
      PostInIP
    } = req.body;

    const pool = await getPool();
    const request = pool.request();

    request.input('inValorDocumentoIdentidad', sql.NVarChar(50), ValorDocumentoIdentidad);
    request.input('inNombre', sql.NVarChar(100), Nombre);
    request.input('inIdPuesto', sql.Int, IdPuesto);
    request.input('inFechaContratacion', sql.Date, FechaContratacion);
    request.input('inSaldoVacaciones', sql.Money, 0);
    request.input('inEsActivo', sql.Bit, 1);
    request.input('inIdPostByUser', sql.Int, IdPostByUser);
    request.input('inPostInIP', sql.VarChar(64), PostInIP);
    request.input('inPostTime', sql.DateTime, new Date());
    request.output('outResultCode', sql.Int);

    const result = await request.execute('SP_InsertarEmpleados');
    const code = result.output.outResultCode;

    if (code === 0) {
      res.json({ success: true });
    } else {
      const errorLookup = await pool.request()
        .input('Codigo', sql.Int, code)
        .query('SELECT Descripcion FROM Error WHERE Codigo = @Codigo');

      const message = errorLookup.recordset[0]?.Descripcion || 'Error desconocido';
      res.json({ success: false, message });
    }
  } catch (err) {
    console.error('Error al insertar empleado:', err);
    res.status(500).json({ success: false, message: 'Error inesperado.' });
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

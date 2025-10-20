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
// EMPLEADOS
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

app.put('/api/empleados/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      ValorDocumentoIdentidad,
      Nombre,
      IdPuesto,
      IdPostByUser,
      PostInIP
    } = req.body;

    const pool = await getPool();
    const request = pool.request();

    request.input('Id', sql.Int, id);
    request.input('IdPuesto', sql.Int, IdPuesto);
    request.input('ValorDocumentoIdentidad', sql.NVarChar(50), ValorDocumentoIdentidad);
    request.input('Nombre', sql.NVarChar(100), Nombre);
    request.input('inIdPostByUser', sql.Int, IdPostByUser);
    request.input('inPostInIP', sql.VarChar(64), PostInIP);
    request.input('inPostTime', sql.DateTime, new Date());
    request.output('outResultCode', sql.Int);

    const result = await request.execute('SP_ActualizarEmpleado');
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
    console.error('Error al actualizar empleado:', err);
    res.status(500).json({ success: false, message: 'Error inesperado.' });
  }
});

app.delete('/api/empleados/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { Confirmado, IdPostByUser, PostInIP } = req.body;

    const pool = await getPool();
    const request = pool.request();

    request.input('Id', sql.Int, id);
    request.input('inIdPostByUser', sql.Int, IdPostByUser);
    request.input('inPostInIP', sql.VarChar(64), PostInIP);
    request.input('inPostTime', sql.DateTime, new Date());
    request.input('Confirmado', sql.Bit, Confirmado ? 1 : 0);
    request.output('outResultCode', sql.Int);

    const result = await request.execute('SP_BorrarEmpleado');
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
    console.error('Error al eliminar empleado:', err);
    res.status(500).json({ success: false, message: 'Error inesperado.' });
  }
});

// ------------------------------------------------------------
// PUESTOS
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
// MOVIMIENTOS
// ------------------------------------------------------------
app.get('/api/tipos-movimiento', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT Id, Nombre, TipoAccion FROM TipoMovimiento ORDER BY Nombre ASC');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener tipos de movimiento:', err);
    res.status(500).json({ error: 'Error al obtener tipos de movimiento.' });
  }
});

app.get('/api/movimientos/:docId', async (req, res) => {
  try {
    const docId = req.params.docId;
    const pool = await getPool();
    const request = pool.request();

    request.input('inIdEmpleado', sql.VarChar(32), docId);
    request.output('outResultCode', sql.Int);

    const result = await request.execute('SPCargarMovimientos');
    const code = result.output.outResultCode;

    if (code === 0) {
      res.json(result.recordset);
    } else {
      const errorLookup = await pool.request()
        .input('Codigo', sql.Int, code)
        .query('SELECT Descripcion FROM Error WHERE Codigo = @Codigo');

      const message = errorLookup.recordset[0]?.Descripcion || 'Error desconocido';
      res.json({ success: false, message });
    }
  } catch (err) {
    console.error('Error al cargar movimientos:', err);
    res.status(500).json({ success: false, message: 'Error inesperado.' });
  }
});

app.post('/api/movimientos', async (req, res) => {
  try {
    const {
      IdEmpleado,
      IdTipoMovimiento,
      Fecha,
      Monto,
      IdPostByUser,
      PostInIP
    } = req.body;

    const pool = await getPool();
    const request = pool.request();

    request.input('inIdEmpleado', sql.Int, IdEmpleado);
    request.input('inIdTipoMovimiento', sql.Int, IdTipoMovimiento);
    request.input('inFecha', sql.DateTime, new Date(Fecha));
    request.input('inMonto', sql.Money, Monto);
    request.input('inIdPostByUser', sql.Int, IdPostByUser);
    request.input('inPostInIP', sql.VarChar(15), PostInIP);
    request.input('inPostTime', sql.DateTime, new Date());
    request.output('outResultCode', sql.Int);

    const result = await request.execute('SP_InsertarMovimiento');
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
    console.error('Error al insertar movimiento:', err);
    res.status(500).json({ success: false, message: 'Error inesperado.' });
  }
});

app.post("/filtrar-empleados", async (req, res) => {
  try {
    const { filtro, username, ip } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input("inFiltro", sql.VarChar(100), filtro)
      .input("inUsername", sql.VarChar(64), username)
      .input("inIpAddress", sql.VarChar(64), ip)
      .output("outResultCode", sql.Int)
      .execute("SP_ListarEmpleadosFiltro");

    const empleados = result.recordset;
    const resultCode = result.output.outResultCode;

    if (resultCode === 0) {
      res.json({ success: true, empleados });
    } else {
      res.json({ success: false, message: "No se pudo filtrar empleados." });
    }
  } catch (err) {
    console.error("❌ Error en filtro:", err);
    res.status(500).json({ success: false, message: "Error en el servidor." });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const pool = await getPool();

    // Validar login con SP_RevisarLogin
    const revisar = await pool.request()
      .input('inUsername', sql.VarChar(50), username)
      .input('inPassword', sql.VarChar(50), password)
      .input('inUserIP', sql.VarChar(50), ip)
      .output('outResultCode', sql.Int)
      .execute('SP_RevisarLogin');

    const resultCode = revisar.output.outResultCode;

    // Obtener Id del usuario
    const userResult = await pool.request()
      .input('username', sql.VarChar(50), username)
      .query('SELECT Id FROM Usuario WHERE Username = @username');

    const userId = userResult.recordset[0]?.Id || 0;

    // Determinar tipo de evento
    let eventoNombre = '';
    let mensaje = '';

    if (resultCode === 0) {
      eventoNombre = 'Login Exitoso';
      mensaje = 'Inicio de sesión exitoso.';
    } else if (resultCode === 1) {
      eventoNombre = 'Login No Exitoso';
      mensaje = 'Credenciales incorrectas.';
    } else if (resultCode === 2) {
      eventoNombre = 'Login Deshabilitado';
      mensaje = 'Usuario bloqueado por múltiples intentos fallidos.';
    } else {
      return res.status(500).json({ success: false, message: 'Error inesperado.' });
    }

    // Obtener IdTipoEvento
    const eventoResult = await pool.request()
      .input('nombre', sql.VarChar(100), eventoNombre)
      .query('SELECT TOP 1 Id FROM TipoEvento WHERE Nombre = @nombre');

    const tipoEventoId = eventoResult.recordset[0]?.Id || 0;

    // Registrar evento en bitácora con SP_Login_Logout
    const bitacora = await pool.request()
      .input('IdTipoEvento', sql.Int, tipoEventoId)
      .input('Descripcion', sql.NVarChar(500), mensaje)
      .input('IdPostByUser', sql.Int, userId)
      .input('PostInIP', sql.VarChar(50), ip)
      .input('PostTime', sql.DateTime, new Date())
      .output('outDebeBloquear', sql.Bit)
      .output('outResultCode', sql.Int)
      .execute('SP_Login_Logout');

    const debeBloquear = bitacora.output.outDebeBloquear;

    // Respuesta al frontend
    if (resultCode === 0) {
      res.json({ success: true, message: mensaje, userId });
    } else {
      res.json({ success: false, message: mensaje });
    }
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
});


// ------------------------------------------------------------
// RUTA PRINCIPAL
// ------------------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ------------------------------------------------------------
// INICIO DEL SERVIDOR
// ------------------------------------------------------------
const PORT = process.env.PORT || 10029;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

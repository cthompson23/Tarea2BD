const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); 


const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ProyectoDB',
  server: process.env.DB_SERVER || 'mssql-201669-0.cloudclusters.net',
  port: Number(process.env.DB_PORT) || 10029,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// Ruta POST para login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await sql.connect(dbConfig); // <-- Usar dbConfig, no config
    const result = await pool
      .request()
      .input("inUsername", sql.VarChar(50), username)
      .input("inPassword", sql.VarChar(50), password)
      .input("inUserIP", sql.VarChar(50), req.ip)
      .output("outResultCode", sql.Int)
      .execute("SP_RevisarLogin");

    const code = result.output.outResultCode;

    if (code === 0) {
      res.json({ success: true, message: "Login exitoso" });
    } else if (code === 1) {
      res.json({ success: false, message: "Credenciales incorrectas" });
    } else if (code === 2) {
      res.json({ success: false, message: "Usuario bloqueado" });
    } else {
      res.json({ success: false, message: "Código desconocido del SP" });
    }

  } catch (err) {
    console.error("Error en el servidor:", err);
    res.status(500).json({ success: false, message: "Error en el servidor", error: err.message });
  }
});

const PORT = process.env.PORT || 10029;
app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});

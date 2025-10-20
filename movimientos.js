const nombreEmpleado = document.getElementById("nombreEmpleado");
const docEmpleado = document.getElementById("docEmpleado");
const puestoEmpleado = document.getElementById("puestoEmpleado");
const saldoEmpleado = document.getElementById("saldoEmpleado");

const tipoMovimientoSelect = document.getElementById("tipoMovimientoSelect");
const fechaMovimiento = document.getElementById("fechaMovimiento");
const montoMovimiento = document.getElementById("montoMovimiento");
const formMovimiento = document.getElementById("formMovimiento");
const mensajeMovimiento = document.getElementById("mensajeMovimiento");

const tbodyMovimientos = document.getElementById("tbodyMovimientos");
const mensajeHistorial = document.getElementById("mensajeHistorial");

let empleado = null;

// Verificar sesión activa
const usuarioLogueado = localStorage.getItem("usuarioLogueado");
if (!usuarioLogueado) {
  window.location.href = "login.html";
}

// Cargar datos del empleado desde localStorage
function cargarEmpleado() {
  const data = localStorage.getItem("empleadoSeleccionado");
  if (!data) {
    alert("No se encontró información del empleado.");
    window.location.href = "index.html";
    return;
  }

  empleado = JSON.parse(data);
  nombreEmpleado.textContent = empleado.Nombre;
  docEmpleado.textContent = empleado.DocumentoIdentidad;
  puestoEmpleado.textContent = empleado.NombrePuesto;
  saldoEmpleado.textContent = empleado.SaldoVacaciones;
}

// Cargar tipos de movimiento
async function cargarTiposMovimiento() {
  try {
    const res = await fetch('/api/tipos-movimiento');
    const tipos = await res.json();
    tipoMovimientoSelect.innerHTML = '';
    tipos.forEach(t => {
      const option = document.createElement('option');
      option.value = t.Id;
      option.textContent = `${t.Nombre} (${t.TipoAccion})`;
      tipoMovimientoSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error al cargar tipos de movimiento:", err);
  }
}

// Cargar historial de movimientos
async function cargarMovimientos() {
  try {
    const res = await fetch(`/api/movimientos/${empleado.DocumentoIdentidad}`);
    const movimientos = await res.json();

    tbodyMovimientos.innerHTML = '';

    if (movimientos.length === 0) {
      mensajeHistorial.textContent = "Este empleado no tiene movimientos registrados.";
      return;
    }

    mensajeHistorial.textContent = "";

    // Ordenar por PostTime descendente
    movimientos.sort((a, b) => new Date(b.PostTime) - new Date(a.PostTime));

    // Renderizar historial
    movimientos.forEach(mov => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${mov.Fecha.split("T")[0]}</td>
        <td>${mov.TipoMovimiento}</td>
        <td>${mov.Monto}</td>
        <td>${mov.NuevoSaldo}</td>
      `;
      tbodyMovimientos.appendChild(fila);
    });

    // Actualizar saldo visual con el movimiento más reciente
    const saldoFinal = movimientos[0]?.NuevoSaldo;
    if (saldoFinal !== undefined) {
      saldoEmpleado.textContent = saldoFinal;
    }
  } catch (err) {
    console.error("Error al cargar movimientos:", err);
    mensajeHistorial.textContent = "Error al cargar movimientos.";
  }
}

// Registrar nuevo movimiento
formMovimiento.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    IdEmpleado: empleado.Id,
    IdTipoMovimiento: parseInt(tipoMovimientoSelect.value),
    Fecha: fechaMovimiento.value,
    Monto: parseFloat(montoMovimiento.value),
    IdPostByUser: 1,
    PostInIP: "127.0.0.1"
  };

  try {
    const res = await fetch('/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
      mensajeMovimiento.textContent = "✅ Movimiento registrado correctamente.";
      await cargarMovimientos();
      formMovimiento.reset();
    } else {
      mensajeMovimiento.textContent = `❌ Error: ${result.message}`;
    }
  } catch (err) {
    console.error("Error al registrar movimiento:", err);
    mensajeMovimiento.textContent = "❌ Error inesperado.";
  }
});

// Inicializar
cargarEmpleado();
cargarTiposMovimiento();
cargarMovimientos();

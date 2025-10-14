const btnInsertar = document.getElementById("btnInsertar");
const tbodyEmpleados = document.getElementById("tbodyEmpleados");
const mensajeLista = document.getElementById("mensajeLista");

const modalInsertar = document.getElementById("modalInsertar");
const formInsertar = document.getElementById("formInsertar");
const puestoSelect = document.getElementById("puestoSelect");
const mensajeInsertar = document.getElementById("mensajeInsertar");

// Mostrar modal de inserción
btnInsertar.addEventListener("click", async () => {
  await cargarPuestos();
  modalInsertar.style.display = "flex";
});

// Cerrar modal
function cerrarModal() {
  modalInsertar.style.display = "none";
  mensajeInsertar.textContent = "";
  formInsertar.reset();
}

// Cargar puestos en el dropdown
async function cargarPuestos() {
  try {
    const res = await fetch('/api/puestos');
    const puestos = await res.json();
    puestoSelect.innerHTML = '';
    puestos.forEach(p => {
      const option = document.createElement('option');
      option.value = p.Id;
      option.textContent = p.Nombre;
      puestoSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error al cargar puestos:", err);
  }
}

// Enviar formulario de inserción
formInsertar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    ValorDocumentoIdentidad: document.getElementById("docId").value.trim(),
    Nombre: document.getElementById("nombre").value.trim(),
    IdPuesto: parseInt(puestoSelect.value),
    FechaContratacion: document.getElementById("fechaContratacion").value,
    IdPostByUser: 1, // Puedes cambiar esto según el usuario logueado
    PostInIP: "127.0.0.1" // Puedes obtener la IP real si lo deseas
  };

  try {
    const res = await fetch('/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.success) {
      mensajeInsertar.textContent = "Empleado insertado correctamente.";
      await cargarEmpleados();
      setTimeout(cerrarModal, 1500);
    } else {
      mensajeInsertar.textContent = `Error: ${result.message}`;
    }
  } catch (err) {
    console.error("Error al insertar empleado:", err);
    mensajeInsertar.textContent = "Error inesperado.";
  }
});

// Cargar empleados en la tabla
async function cargarEmpleados() {
  try {
    const response = await fetch('/api/empleados');
    const empleados = await response.json();

    tbodyEmpleados.innerHTML = '';

    if (empleados.length === 0) {
      mensajeLista.textContent = 'No hay empleados activos registrados.';
      return;
    }

    empleados.forEach(emp => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${emp.DocumentoIdentidad}</td>
        <td>${emp.Nombre}</td>
        <td>${emp.NombrePuesto}</td>
        <td>${emp.SaldoVacaciones}</td>
        <td class="acciones">
          <button class="btnConsultar">🔍 Consultar</button>
          <button class="btnActualizar">✏️ Actualizar</button>
          <button class="btnEliminar">🗑️ Eliminar</button>
          <button class="btnVerMovimientos">📋 Movimientos</button>
        </td>
      `;
      tbodyEmpleados.appendChild(fila);
    });

    inicializarBotones();
  } catch (error) {
    console.error('Error al cargar empleados:', error);
    mensajeLista.textContent = 'Error al cargar empleados.';
  }
}

// Inicializar botones de acción
function inicializarBotones() {
  document.querySelectorAll(".btnConsultar").forEach(btn => {
    btn.addEventListener("click", () => alert("Consultar empleado (sin funcionalidad aún)"));
  });

  document.querySelectorAll(".btnActualizar").forEach(btn => {
    btn.addEventListener("click", () => alert("Actualizar empleado (sin funcionalidad aún)"));
  });

  document.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", () => alert("Eliminar empleado (sin funcionalidad aún)"));
  });

  document.querySelectorAll(".btnVerMovimientos").forEach(btn => {
    btn.addEventListener("click", () => alert("Ver movimientos (sin funcionalidad aún)"));
  });
}

// Inicializar tabla al cargar
cargarEmpleados();

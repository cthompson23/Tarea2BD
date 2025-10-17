// Elementos de la tabla principal
const btnInsertar = document.getElementById("btnInsertar");
const tbodyEmpleados = document.getElementById("tbodyEmpleados");
const mensajeLista = document.getElementById("mensajeLista");

// Elementos del modal de inserción
const modalInsertar = document.getElementById("modalInsertar");
const formInsertar = document.getElementById("formInsertar");
const puestoSelect = document.getElementById("puestoSelect");
const mensajeInsertar = document.getElementById("mensajeInsertar");

// Elementos del modal de actualización
const modalActualizar = document.getElementById("modalActualizar");
const formActualizar = document.getElementById("formActualizar");
const actualizarId = document.getElementById("actualizarId");
const actualizarDocId = document.getElementById("actualizarDocId");
const actualizarNombre = document.getElementById("actualizarNombre");
const actualizarPuestoSelect = document.getElementById("actualizarPuestoSelect");
const mensajeActualizar = document.getElementById("mensajeActualizar");

// Abrir modal de inserción
btnInsertar.addEventListener("click", async () => {
  await cargarPuestos(puestoSelect);
  modalInsertar.style.display = "flex";
});

// Cerrar modal de inserción
function cerrarModal() {
  modalInsertar.style.display = "none";
  mensajeInsertar.textContent = "";
  formInsertar.reset();
}

// Cerrar modal de actualización
function cerrarModalActualizar() {
  modalActualizar.style.display = "none";
  mensajeActualizar.textContent = "";
  formActualizar.reset();
}

// Cargar puestos en un select
async function cargarPuestos(selectElement) {
  try {
    const res = await fetch('/api/puestos');
    const puestos = await res.json();
    selectElement.innerHTML = '';
    puestos.forEach(p => {
      const option = document.createElement('option');
      option.value = p.Id;
      option.textContent = p.Nombre;
      selectElement.appendChild(option);
    });
  } catch (err) {
    console.error("Error al cargar puestos:", err);
  }
}

// Insertar empleado
formInsertar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    ValorDocumentoIdentidad: document.getElementById("docId").value.trim(),
    Nombre: document.getElementById("nombre").value.trim(),
    IdPuesto: parseInt(puestoSelect.value),
    FechaContratacion: document.getElementById("fechaContratacion").value,
    IdPostByUser: 1,
    PostInIP: "127.0.0.1"
  };

  try {
    const res = await fetch('/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.success) {
      mensajeInsertar.textContent = "✅ Empleado insertado correctamente.";
      await cargarEmpleados();
      setTimeout(cerrarModal, 1500);
    } else {
      mensajeInsertar.textContent = `❌ Error: ${result.message}`;
    }
  } catch (err) {
    console.error("Error al insertar empleado:", err);
    mensajeInsertar.textContent = "❌ Error inesperado.";
  }
});

// Actualizar empleado
formActualizar.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = parseInt(actualizarId.value);
  const data = {
    ValorDocumentoIdentidad: actualizarDocId.value.trim(),
    Nombre: actualizarNombre.value.trim(),
    IdPuesto: parseInt(actualizarPuestoSelect.value),
    IdPostByUser: 1,
    PostInIP: "127.0.0.1"
  };

  try {
    const res = await fetch(`/api/empleados/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.success) {
      mensajeActualizar.textContent = "✅ Empleado actualizado correctamente.";
      await cargarEmpleados();
      setTimeout(cerrarModalActualizar, 1500);
    } else {
      mensajeActualizar.textContent = `❌ Error: ${result.message}`;
    }
  } catch (err) {
    console.error("Error al actualizar empleado:", err);
    mensajeActualizar.textContent = "❌ Error inesperado.";
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
    btn.addEventListener("click", async (e) => {
      const fila = e.target.closest("tr");
      const docId = fila.children[0].textContent;
      const nombre = fila.children[1].textContent;

      const empleados = await fetch('/api/empleados').then(r => r.json());
      const emp = empleados.find(e => e.DocumentoIdentidad === docId && e.Nombre === nombre);

      if (!emp) return alert("Empleado no encontrado.");

      actualizarId.value = emp.Id;
      actualizarDocId.value = emp.DocumentoIdentidad;
      actualizarNombre.value = emp.Nombre;
      await cargarPuestos(actualizarPuestoSelect);
      actualizarPuestoSelect.value = emp.IdPuesto;

      modalActualizar.style.display = "flex";
    });
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

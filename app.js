const btnInsertar = document.getElementById("btnInsertar");
const tbodyEmpleados = document.getElementById("tbodyEmpleados");
const mensajeLista = document.getElementById("mensajeLista");

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

btnInsertar.addEventListener("click", () => {
  alert("Insertar nuevo empleado (sin funcionalidad aún)");
});

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

// Inicializar
cargarEmpleados();

// ====== DATOS EN MEMORIA (simulación) ======
let incidencias = [];
let nextId = 1;

// Guardamos el técnico que está usando el panel en este navegador
function setCurrentTecnico(nombre) {
  localStorage.setItem("tec_nombre", nombre);
  renderWhoAmI();
  renderTabla(); // por si cambia permisos/acciones visibles
}

function getCurrentTecnico() {
  return localStorage.getItem("tec_nombre") || "";
}

// ====== CREAR INCIDENCIA (usado en reportar.html) ======
function nuevaIncidencia(data) {
  const now = new Date();
  const incidencia = {
    id: nextId++,
    fecha_creacion: now.toISOString(),
    apartamento_zona: data.apartamento_zona || "",
    tipo: data.tipo || "",
    descripcion: data.descripcion || "",
    prioridad: data.prioridad || "Normal",
    reportado_por: data.reportado_por || "",
    estado: "Pendiente",               // Pendiente | En curso | Resuelto
    asignado_a: "",
    ultima_actualizacion: now.toISOString(),
  };
  incidencias.push(incidencia);
  console.log("Incidencia creada:", incidencia);
  return incidencia.id;
}

// ====== CAMBIOS EN INCIDENCIAS (usado en panel.html) ======
function asignarIncidencia(id) {
  const tec = getCurrentTecnico();
  if (!tec) return alert("Selecciona tu nombre primero.");
  const item = incidencias.find(x => x.id === id);
  if (!item) return;
  item.asignado_a = tec;
  item.estado = "En curso";
  item.ultima_actualizacion = new Date().toISOString();
  renderTabla();
}

function marcarEstado(id, nuevoEstado) {
  const item = incidencias.find(x => x.id === id);
  if (!item) return;
  item.estado = nuevoEstado;
  item.ultima_actualizacion = new Date().toISOString();
  renderTabla();
}

// ====== FILTROS DEL PANEL ======
let filtroEstado = "Todos"; // "Todos" | "Pendiente" | "En curso" | "Resuelto"
let filtroBusqueda = "";
let filtroPrioridad = "Todas"; // "Todas" | "Urgente" | "Alta" | "Normal" | "Baja"

function setFiltroEstado(e) {
  filtroEstado = e;
  renderTabla();
}
function setFiltroPrioridad(p) {
  filtroPrioridad = p;
  renderTabla();
}
function setFiltroBusqueda(txt) {
  filtroBusqueda = txt.toLowerCase();
  renderTabla();
}

// ====== UTILIDADES ======
function formatFecha(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  // DD/MM/YYYY HH:MM
  const dd = String(d.getDate()).padStart(2,"0");
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const yyyy = d.getFullYear();
  const h = String(d.getHours()).padStart(2,"0");
  const min = String(d.getMinutes()).padStart(2,"0");
  return `${dd}/${mm}/${yyyy} ${h}:${min}`;
}

function badgeEstado(estado) {
  if (estado === "Pendiente") {
    return `<span class="badge estado-pendiente">Pendiente</span>`;
  } else if (estado === "En curso") {
    return `<span class="badge estado-curso">En curso</span>`;
  } else if (estado === "Resuelto") {
    return `<span class="badge estado-resuelto">Resuelto</span>`;
  }
  return estado;
}

function badgePrioridad(p) {
  const pLow = p.toLowerCase();
  if (pLow === "urgente") {
    return `<span class="badge prio-urgente">Urgente</span>`;
  } else if (pLow === "alta") {
    return `<span class="badge prio-alta">Alta</span>`;
  } else if (pLow === "normal") {
    return `<span class="badge prio-normal">Normal</span>`;
  } else if (pLow === "baja") {
    return `<span class="badge prio-baja">Baja</span>`;
  }
  return `<span class="badge prio-normal">${p}</span>`;
}

// ====== RENDER NOMBRE TECNICO EN PANEL ======
function renderWhoAmI() {
  const el = document.getElementById("whoami");
  if (!el) return;
  const tec = getCurrentTecnico();
  if (tec) {
    el.innerHTML = `🔧 Técnico activo: <strong>${tec}</strong>`;
  } else {
    el.innerHTML = `🔧 Selecciona tu nombre`;
  }
}

// ====== RENDER TABLA PANEL ======
function renderTabla() {
  const tbody = document.getElementById("tbody-incidencias");
  if (!tbody) return;

  // Filtra por estado
  let lista = incidencias.slice();
  if (filtroEstado !== "Todos") {
    lista = lista.filter(x => x.estado === filtroEstado);
  }
  // Filtra por prioridad
  if (filtroPrioridad !== "Todas") {
    lista = lista.filter(x => x.prioridad.toLowerCase() === filtroPrioridad.toLowerCase());
  }
  // Filtra por búsqueda (apartamento_zona / descripcion)
  if (filtroBusqueda.trim() !== "") {
    lista = lista.filter(x =>
      (x.apartamento_zona + " " + x.descripcion)
        .toLowerCase()
        .includes(filtroBusqueda)
    );
  }

  // Construye las filas
  let html = "";
  lista.forEach(item => {
    html += `
      <tr>
        <td>${badgeEstado(item.estado)}</td>
        <td>${badgePrioridad(item.prioridad)}</td>
        <td>
          <div><strong>${item.apartamento_zona || "-"}</strong></div>
          <div style="color:#94a3b8;font-size:.7rem;">${item.tipo || ""}</div>
        </td>
        <td style="max-width:240px;">
          ${item.descripcion || ""}
          <div style="color:#64748b;font-size:.7rem;margin-top:.4rem;">
            Reportado por: ${item.reportado_por || "-"}<br/>
            Creada: ${formatFecha(item.fecha_creacion)}
          </div>
        </td>
        <td>
          ${item.asignado_a ? `<strong>${item.asignado_a}</strong>` : `<span style="color:#64748b;">—</span>`}
        </td>
        <td>
          ${formatFecha(item.ultima_actualizacion)}
        </td>
        <td>
          <div class="actions-row">
            <button class="btn btn-small btn-neutral" onclick="asignarIncidencia(${item.id})">
              Me la quedo
            </button>
            <button class="btn btn-small btn-neutral" onclick="marcarEstado(${item.id}, 'En curso')">
              En curso
            </button>
            <button class="btn btn-small btn-primary" onclick="marcarEstado(${item.id}, 'Resuelto')">
              Terminado
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ====== INICIALIZADORES POR PÁGINA ======

// Para reportar.html
function initReportar() {
  const form = document.getElementById("form-reportar");
  const msgOK = document.getElementById("msg-ok");
  const msgERR = document.getElementById("msg-err");

  if (!form) return;

  form.addEventListener("submit", function(e){
    e.preventDefault();
    msgOK.style.display = "none";
    msgERR.style.display = "none";

    const apartamento_zona = form.apartamento_zona.value.trim();
    const tipo = form.tipo.value.trim();
    const descripcion = form.descripcion.value.trim();
    const prioridad = form.prioridad.value.trim();
    const reportado_por = form.reportado_por.value.trim();

    if (!apartamento_zona || !descripcion || !reportado_por) {
      msgERR.style.display = "block";
      msgERR.textContent = "Faltan datos obligatorios.";
      return;
    }

    const newId = nuevaIncidencia({
      apartamento_zona,
      tipo,
      descripcion,
      prioridad,
      reportado_por,
    });

    form.reset();
    msgOK.style.display = "block";
    msgOK.textContent = `Incidencia registrada con ID ${newId}`;
  });
}

// Para panel.html
function initPanel() {
  // render nombre tecnico actual
  renderWhoAmI();
  renderTabla();

  // selector de tecnico
  const selectTec = document.getElementById("select-tecnico");
  if (selectTec) {
    selectTec.addEventListener("change", function() {
      const v = selectTec.value;
      if (v !== "") {
        setCurrentTecnico(v);
      }
    });
    // preseleccionar si ya había uno guardado
    const curr = getCurrentTecnico();
    if (curr) {
      selectTec.value = curr;
    }
  }

  // listeners de filtros
  const filtroEstadoBtns = document.querySelectorAll("[data-estado]");
  filtroEstadoBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      setFiltroEstado(btn.getAttribute("data-estado"));
    });
  });

  const filtroPrioridadSel = document.getElementById("filtro-prioridad");
  if (filtroPrioridadSel) {
    filtroPrioridadSel.addEventListener("change", () => {
      setFiltroPrioridad(filtroPrioridadSel.value);
    });
  }

  const filtroBuscarInp = document.getElementById("filtro-buscar");
  if (filtroBuscarInp) {
    filtroBuscarInp.addEventListener("input", () => {
      setFiltroBusqueda(filtroBuscarInp.value);
    });
  }
}

// Detectar qué página es
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("page-reportar")) {
    initReportar();
  }
  if (document.body.classList.contains("page-panel")) {
    initPanel();
  }
});

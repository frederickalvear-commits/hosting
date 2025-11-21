/**
 * author Saquib Shaikh
 * created on 11-11-2025-18h-36m
 * github: https://github.com/saquibshaikh14
 * copyright 2025
*/

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------
     UTILIDADES
  --------------------------- */
  const storageGet = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } 
    catch { return fallback; }
  };
  const storageSet = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  /* ---------------------------
     DATOS
  --------------------------- */
  let pacientes = storageGet("pacientes", []);
  let inventario = storageGet("inventario", []);
  let entregas = storageGet("entregas", []);
  let historias = storageGet("historias", []);

  /* ---------------------------
     LOGIN
  --------------------------- */
  const btnLogin = document.getElementById("btnLogin");
  if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
      const usuario = document.getElementById("usuario").value.trim();
      const clave = document.getElementById("clave").value.trim();
      const mensaje = document.getElementById("mensajeLogin");
      mensaje.textContent = "";
      if (!usuario || !clave) { mensaje.textContent = "Complete todos los campos."; return; }

      try {
        const resp = await fetch("validar_login.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario, clave })
        });
        const data = await resp.json();
        if (data.status === "ok") {
          localStorage.setItem("usuarioActivo", data.usuario);
          localStorage.setItem("rol", data.rol);
          window.location.href = "dashboard.html";
        } else {
          mensaje.textContent = data.msg || "Usuario o contraseña incorrectos.";
        }
      } catch { mensaje.textContent = "Error de conexión con el servidor."; }
    });
    return; // No ejecutar resto en index.html
  }

  /* ---------------------------
     VALIDAR SESIÓN
  --------------------------- */
  if (!localStorage.getItem("usuarioActivo")) {
    window.location.href = "index.html";
    return;
  }

  const $ = (id) => document.getElementById(id);

  /* ---------------------------
     ESCAPE HTML
  --------------------------- */
  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  /* ---------------------------
     RENDERIZADOS
  --------------------------- */
  function renderPacientes() {
    const tabla = $("tablaPacientes");
    if (!tabla) return;
    tabla.innerHTML = "<tr><th>Nombre</th><th>Cédula</th><th>Edad</th><th>Diagnóstico</th></tr>";
    pacientes.forEach(p => {
      const row = tabla.insertRow();
      row.innerHTML = `
        <td>${escapeHtml(p.nombre)}</td>
        <td>${escapeHtml(p.cedula)}</td>
        <td>${escapeHtml(p.edad)}</td>
        <td>${escapeHtml(p.diagnostico)}</td>
      `;
    });
    actualizarPacientesEnHistoria();
    actualizarPacientesEnEntrega();
  }

  function renderInventario() {
    const tbody = document.querySelector("#tablaMedicinas tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    inventario.forEach(item => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${escapeHtml(item.nombre)}</td>
        <td>${escapeHtml(item.cantidad)}</td>
        <td><button class="btn-eliminar" data-nombre="${escapeHtml(item.nombre)}">Eliminar</button></td>
      `;
    });

    const sel = $("medicinaEntrega");
    if (sel) {
      sel.innerHTML = "<option value=''>Selecciona una medicina</option>";
      inventario.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.nombre;
        opt.textContent = m.nombre;
        sel.appendChild(opt);
      });
    }
  }

  function renderEntregas() {
    const tbody = document.querySelector("#tablaEntregas tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    entregas.forEach(ent => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${escapeHtml(ent.fecha)}</td>
        <td>${escapeHtml(ent.medicina)}</td>
        <td>${escapeHtml(ent.paciente)}</td>
        <td>${escapeHtml(ent.cantidad)}</td>
      `;
    });
  }

  function renderHistorias() {
    const tbody = document.querySelector("#tablaHistoria tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    historias.forEach(h => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${escapeHtml(h.fecha)}</td>
        <td>${escapeHtml(h.paciente)}</td>
        <td>${escapeHtml(h.detalle)}</td>
      `;
    });
  }

  /* ---------------------------
     SELECTS DINÁMICOS
  --------------------------- */
  function actualizarPacientesEnHistoria() {
    const sel = $("pacienteHistoria");
    if (!sel) return;
    sel.innerHTML = "<option value=''>Seleccione un paciente</option>";
    pacientes.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.nombre;
      opt.textContent = p.nombre;
      sel.appendChild(opt);
    });
  }

  function actualizarPacientesEnEntrega() {
    const sel = $("pacienteEntrega");
    if (!sel) return;
    sel.innerHTML = "<option value=''>Seleccione un paciente</option>";
    pacientes.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.nombre;
      opt.textContent = p.nombre;
      sel.appendChild(opt);
    });
  }

  /* ---------------------------
     RENDERS INICIALES
  --------------------------- */
  renderPacientes();
  renderInventario();
  renderEntregas();
  renderHistorias();

  /* ---------------------------
     FORMULARIOS
  --------------------------- */
  $("formPacientes")?.addEventListener("submit", e => {
    e.preventDefault();
    const nombre = $("nombrePaciente").value.trim();
    const cedula = $("cedulaPaciente").value.trim();
    const edad = $("edadPaciente").value.trim();
    const diagnostico = $("diagnostico").value.trim();
    if (!nombre || !cedula) { alert("Nombre y cédula obligatorios."); return; }
    pacientes.push({ nombre, cedula, edad, diagnostico });
    storageSet("pacientes", pacientes);
    e.target.reset();
    renderPacientes();
  });

  $("formMedicinas")?.addEventListener("submit", e => {
    e.preventDefault();
    const nombre = $("nombreMedicina").value.trim();
    const cantidad = parseInt($("cantidad").value,10);
    if (!nombre || !cantidad || cantidad <=0) { alert("Nombre y cantidad válida."); return; }
    const item = inventario.find(m => m.nombre.toLowerCase()===nombre.toLowerCase());
    if(item) item.cantidad += cantidad;
    else inventario.push({nombre,cantidad});
    storageSet("inventario", inventario);
    e.target.reset();
    renderInventario();
  });

  document.querySelector("#tablaMedicinas tbody")?.addEventListener("click", e=>{
    if(e.target.matches(".btn-eliminar")){
      const nombre=e.target.getAttribute("data-nombre");
      inventario = inventario.filter(m => m.nombre !== nombre);
      storageSet("inventario", inventario);
      renderInventario();
    }
  });

  $("formEntrega")?.addEventListener("submit", e=>{
    e.preventDefault();
    const medicina=$("medicinaEntrega").value;
    const paciente=$("pacienteEntrega").value;
    const cantidad=parseInt($("cantidadEntrega").value,10);
    if(!medicina || !paciente || cantidad<=0){ alert("Complete datos"); return;}
    const item = inventario.find(m=>m.nombre===medicina);
    if(!item || item.cantidad < cantidad){ alert("Cantidad insuficiente"); return;}
    item.cantidad -= cantidad;
    storageSet("inventario", inventario);
    entregas.push({fecha:new Date().toLocaleString(),medicina,paciente,cantidad});
    storageSet("entregas", entregas);
    e.target.reset();
    renderInventario();
    renderEntregas();
  });

  $("formHistoria")?.addEventListener("submit", e=>{
    e.preventDefault();
    const paciente=$("pacienteHistoria").value;
    const detalle=$("detalleHistoria").value.trim();
    if(!paciente || !detalle){ alert("Complete datos"); return;}
    historias.push({fecha:new Date().toLocaleString(),paciente,detalle});
    storageSet("historias", historias);
    e.target.reset();
    renderHistorias();
  });

  $("btnReporteHistoria")?.addEventListener("click", ()=>{
    if(historias.length===0){ alert("No hay historias"); return;}
    let contenido = "<html><head><title>Historias Médicas</title></head><body>";
    contenido += "<h2>Reporte Historias Médicas</h2><table border='1'><tr><th>Fecha</th><th>Paciente</th><th>Detalle</th></tr>";
    historias.forEach(h=>{
      contenido+=`<tr><td>${escapeHtml(h.fecha)}</td><td>${escapeHtml(h.paciente)}</td><td>${escapeHtml(h.detalle)}</td></tr>`;
    });
    contenido+="</table></body></html>";
    const win=window.open("","_blank");
    win.document.write(contenido);
    win.document.close();
    win.print();
  });

  $("formDescanso")?.addEventListener("submit", e=>{
    e.preventDefault();
    const nombre=$("pacienteDescanso").value.trim();
    const correo=$("correoJefe").value.trim();
    const inicio=$("inicioDescanso").value;
    const fin=$("finDescanso").value;
    const motivo=$("motivoDescanso").value.trim();
    if(!nombre||!correo||!inicio||!fin){ alert("Complete todos los campos"); return;}
    const descansos = storageGet("descansos",[]);
    descansos.push({nombre,correo,inicio,fin,motivo,fecha:new Date().toLocaleString()});
    storageSet("descansos",descansos);
    $("mensajeCorreo").textContent = `Se envió descanso de ${nombre} al correo ${correo} (simulado).`;
    e.target.reset();
  });

  /* ---------------------------
     NAVEGACIÓN ENTRE SECCIONES
  --------------------------- */
  document.querySelectorAll("nav a[data-section]").forEach(link=>{
    link.addEventListener("click", e=>{
      e.preventDefault();
      const target = link.getAttribute("data-section");
      if(!target) return;
      document.querySelectorAll("section").forEach(sec=>sec.classList.remove("active"));
      const secToShow = document.getElementById(target);
      if(secToShow) secToShow.classList.add("active");
    });
  });

  /* ---------------------------
     SALIR
  --------------------------- */
  $("btnSalir")?.addEventListener("click",()=>{
    localStorage.removeItem("usuarioActivo");
    localStorage.removeItem("rol");
    window.location.href="index.html";
  });

});

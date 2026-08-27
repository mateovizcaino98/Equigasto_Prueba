let integrantes = [];
let gastos = [];
let gastoEditado = -1;

const formularioGrupo = document.getElementById("formularioGrupo");
const formularioIntegrante = document.getElementById("formularioIntegrante");
const formularioGasto = document.getElementById("formularioGasto");

function mostrarMensaje(id, texto, error) {
  const elemento = document.getElementById(id);
  elemento.innerHTML = texto;
  if (error == true) { elemento.style.color = "#b04a4a"; }
  else { elemento.style.color = "#3f9b7e"; }
}

function mostrarSeccion(id) {
  document.getElementById("integrantes").classList.add("oculto");
  document.getElementById("gastos").classList.add("oculto");
  document.getElementById("resumen").classList.add("oculto");
  document.getElementById("botonIntegrantes").classList.remove("activa");
  document.getElementById("botonGastos").classList.remove("activa");
  document.getElementById("botonResumen").classList.remove("activa");
  document.getElementById(id).classList.remove("oculto");
  if (id == "integrantes") { document.getElementById("botonIntegrantes").classList.add("activa"); }
  if (id == "gastos") { document.getElementById("botonGastos").classList.add("activa"); }
  if (id == "resumen") { document.getElementById("botonResumen").classList.add("activa"); calcularResumen(); }
}

function dinero(valor) {
  return "$" + valor.toLocaleString("es-CO", { maximumFractionDigits: 2 });
}

function actualizarIntegrantes() {
  let contenido = "";
  let i;
  for (i = 0; i < integrantes.length; i++) {
    contenido += '<div class="persona"><span class="avatar">' + integrantes[i].charAt(0).toUpperCase() + '</span><strong>' + integrantes[i] + '</strong><button type="button" onclick="eliminarIntegrante(' + i + ')">Eliminar</button></div>';
  }
  if (contenido == "") { contenido = '<div class="vacio">Todavía no hay integrantes.</div>'; }
  document.getElementById("listaIntegrantes").innerHTML = contenido;
  document.getElementById("numeroIntegrantes").innerHTML = integrantes.length + " personas";
  actualizarOpciones();
}

function eliminarIntegrante(indice) {
  let i;
  for (i = 0; i < gastos.length; i++) {
    if (gastos[i].pagador == integrantes[indice] || gastos[i].participantes.indexOf(integrantes[indice]) != -1) {
      alert("Esta persona aparece en un gasto y no se puede eliminar.");
      return;
    }
  }
  integrantes.splice(indice, 1);
  actualizarIntegrantes();
}

function actualizarOpciones() {
  let opciones = '<option value="">Selecciona una persona</option>';
  let casillas = "";
  let i;
  for (i = 0; i < integrantes.length; i++) {
    opciones += '<option value="' + integrantes[i] + '">' + integrantes[i] + '</option>';
    casillas += '<label class="opcion"><input type="checkbox" name="participante" value="' + integrantes[i] + '">' + integrantes[i] + '</label>';
  }
  document.getElementById("pagador").innerHTML = opciones;
  document.getElementById("opcionesParticipantes").innerHTML = casillas;
}

function obtenerParticipantes() {
  const casillas = document.getElementsByName("participante");
  const seleccionados = [];
  let i;
  for (i = 0; i < casillas.length; i++) {
    if (casillas[i].checked == true) { seleccionados.push(casillas[i].value); }
  }
  return seleccionados;
}

function limpiarFormularioGasto() {
  formularioGasto.reset();
  gastoEditado = -1;
  document.getElementById("tituloFormularioGasto").innerHTML = "Registra un gasto";
  document.getElementById("guardarGasto").innerHTML = "Agregar gasto";
  document.getElementById("cancelarEdicion").classList.add("oculto");
}

function actualizarGastos() {
  let contenido = "";
  let i;
  for (i = 0; i < gastos.length; i++) {
    contenido += '<div class="gasto"><div><strong>' + gastos[i].concepto + '</strong><p>Pagó ' + gastos[i].pagador + ' · ' + gastos[i].fecha + ' · ' + gastos[i].participantes.length + ' participantes</p></div><strong>' + dinero(gastos[i].valor) + '</strong><div class="acciones"><button type="button" onclick="editarGasto(' + i + ')">Editar</button><button type="button" onclick="eliminarGasto(' + i + ')">Eliminar</button></div></div>';
  }
  if (contenido == "") { contenido = '<div class="vacio">Todavía no hay gastos.</div>'; }
  document.getElementById("listaGastos").innerHTML = contenido;
  document.getElementById("numeroGastos").innerHTML = gastos.length + " gastos";
}

function editarGasto(indice) {
  const gasto = gastos[indice];
  const casillas = document.getElementsByName("participante");
  let i;
  gastoEditado = indice;
  document.getElementById("concepto").value = gasto.concepto;
  document.getElementById("valor").value = gasto.valor;
  document.getElementById("fecha").value = gasto.fecha;
  document.getElementById("pagador").value = gasto.pagador;
  for (i = 0; i < casillas.length; i++) { casillas[i].checked = gasto.participantes.indexOf(casillas[i].value) != -1; }
  document.getElementById("tituloFormularioGasto").innerHTML = "Edita el gasto";
  document.getElementById("guardarGasto").innerHTML = "Guardar cambios";
  document.getElementById("cancelarEdicion").classList.remove("oculto");
}

function eliminarGasto(indice) {
  if (confirm("¿Deseas eliminar este gasto?") == true) {
    gastos.splice(indice, 1);
    actualizarGastos();
    limpiarFormularioGasto();
  }
}

function calcularResumen() {
  const balances = [];
  let total = 0;
  let tarjetas = "";
  let i;
  let j;
  for (i = 0; i < integrantes.length; i++) { balances.push({ nombre: integrantes[i], pagado: 0, corresponde: 0, balance: 0 }); }
  for (i = 0; i < gastos.length; i++) {
    total += gastos[i].valor;
    const parte = gastos[i].valor / gastos[i].participantes.length;
    for (j = 0; j < balances.length; j++) {
      if (balances[j].nombre == gastos[i].pagador) { balances[j].pagado += gastos[i].valor; }
      if (gastos[i].participantes.indexOf(balances[j].nombre) != -1) { balances[j].corresponde += parte; }
    }
  }
  for (i = 0; i < balances.length; i++) {
    balances[i].balance = balances[i].pagado - balances[i].corresponde;
    let estado = "Está a paz y salvo";
    let clase = "neutro";
    if (balances[i].balance > 0.01) { estado = "Debe recibir " + dinero(balances[i].balance); clase = "positivo"; }
    if (balances[i].balance < -0.01) { estado = "Debe pagar " + dinero(-balances[i].balance); clase = "negativo"; }
    tarjetas += '<div class="balance"><span class="avatar">' + balances[i].nombre.charAt(0).toUpperCase() + '</span><h3>' + balances[i].nombre + '</h3><div><span>Pagó</span><strong>' + dinero(balances[i].pagado) + '</strong></div><div><span>Le corresponde</span><strong>' + dinero(balances[i].corresponde) + '</strong></div><p class="estado ' + clase + '">' + estado + '</p></div>';
  }
  document.getElementById("totalGastado").innerHTML = dinero(total);
  document.getElementById("balances").innerHTML = tarjetas;
  calcularPagos(balances);
}

function calcularPagos(balances) {
  const deudores = [];
  const acreedores = [];
  let contenido = "";
  let i;
  for (i = 0; i < balances.length; i++) {
    if (balances[i].balance < -0.01) { deudores.push({ nombre: balances[i].nombre, valor: -balances[i].balance }); }
    if (balances[i].balance > 0.01) { acreedores.push({ nombre: balances[i].nombre, valor: balances[i].balance }); }
  }
  let deudor = 0;
  let acreedor = 0;
  while (deudor < deudores.length && acreedor < acreedores.length) {
    let pago = deudores[deudor].valor;
    if (acreedores[acreedor].valor < pago) { pago = acreedores[acreedor].valor; }
    contenido += '<div class="pago"><span><strong>' + deudores[deudor].nombre + '</strong> le paga a <strong>' + acreedores[acreedor].nombre + '</strong></span><strong>' + dinero(pago) + '</strong></div>';
    deudores[deudor].valor -= pago;
    acreedores[acreedor].valor -= pago;
    if (deudores[deudor].valor < 0.01) { deudor++; }
    if (acreedores[acreedor].valor < 0.01) { acreedor++; }
  }
  if (gastos.length == 0) { contenido = '<div class="vacio">Registra gastos para calcular los pagos.</div>'; }
  else if (contenido == "") { contenido = '<p class="positivo">Las cuentas ya están equilibradas.</p>'; }
  document.getElementById("listaPagos").innerHTML = contenido;
}

formularioGrupo.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const nombre = document.getElementById("nombreGrupo").value;
  if (nombre == "") { mostrarMensaje("mensajeGrupo", "Escribe un nombre para continuar.", true); }
  else { document.getElementById("tituloGrupo").innerHTML = nombre; document.getElementById("inicioAplicacion").classList.add("oculto"); document.getElementById("contenidoAplicacion").classList.remove("oculto"); }
});

formularioIntegrante.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const nombre = document.getElementById("nombreIntegrante").value;
  let repetido = false;
  let i;
  for (i = 0; i < integrantes.length; i++) { if (integrantes[i].toLowerCase() == nombre.toLowerCase()) { repetido = true; } }
  if (nombre == "") { mostrarMensaje("mensajeIntegrante", "Escribe un nombre.", true); }
  else if (repetido == true) { mostrarMensaje("mensajeIntegrante", "Esa persona ya existe.", true); }
  else { integrantes.push(nombre); document.getElementById("nombreIntegrante").value = ""; mostrarMensaje("mensajeIntegrante", "Integrante agregado.", false); actualizarIntegrantes(); }
});

formularioGasto.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const concepto = document.getElementById("concepto").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const fecha = document.getElementById("fecha").value;
  const pagador = document.getElementById("pagador").value;
  const participantes = obtenerParticipantes();
  if (concepto == "" || isNaN(valor) || valor <= 0 || fecha == "" || pagador == "" || participantes.length == 0) { mostrarMensaje("mensajeGasto", "Completa todos los datos.", true); }
  else {
    const gasto = { concepto: concepto, valor: valor, fecha: fecha, pagador: pagador, participantes: participantes };
    if (gastoEditado == -1) { gastos.push(gasto); }
    else { gastos[gastoEditado] = gasto; }
    actualizarGastos();
    limpiarFormularioGasto();
    mostrarMensaje("mensajeGasto", "Gasto guardado.", false);
  }
});

document.getElementById("botonIntegrantes").onclick = function () { mostrarSeccion("integrantes"); };
document.getElementById("botonGastos").onclick = function () { if (integrantes.length < 2) { alert("Agrega al menos dos integrantes."); } else { mostrarSeccion("gastos"); } };
document.getElementById("botonResumen").onclick = function () { mostrarSeccion("resumen"); };
document.getElementById("continuarGastos").onclick = document.getElementById("botonGastos").onclick;
document.getElementById("generarResumen").onclick = function () { mostrarSeccion("resumen"); };
document.getElementById("cancelarEdicion").onclick = function () { limpiarFormularioGasto(); };
document.getElementById("reiniciar").onclick = function () { if (confirm("¿Deseas empezar de nuevo?") == true) { location.reload(); } };

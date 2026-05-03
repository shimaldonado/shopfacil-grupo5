//const API = 'http://localhost:3000/api';
let todosLosProductos = [];

// Cargar navbar según sesión
function cargarNavbar() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (usuario) {
    document.getElementById('nav-usuario').textContent = `Hola, ${usuario.nombre}`;
    document.getElementById('btn-login').style.display = 'none';
    if (usuario.rol === 'vendedor' || usuario.rol === 'admin') {
  document.getElementById('btn-agregar').style.display = 'inline';
  }   
    document.getElementById('btn-logout').style.display = 'inline';
  }
}

// ================================
// HU-05: Cargar catálogo
// ================================
async function cargarProductos() {
  try {
    const res = await fetch(`${API}/productos`);
    const productos = await res.json();
    todosLosProductos = productos;
    mostrarProductos(productos);
  } catch (err) {
    document.getElementById('catalogo').innerHTML =
      '<p>Error al cargar los productos. Intenta de nuevo.</p>';
  }
}

// Mostrar productos en el grid
function mostrarProductos(productos) {
  const catalogo = document.getElementById('catalogo');

  if (productos.length === 0) {
    catalogo.innerHTML = '<p>No se encontraron productos.</p>';
    return;
  }

  catalogo.innerHTML = productos.map(p => `
    <div class="producto-card">
      <img src="${p.imagen || 'https://via.placeholder.com/220x180?text=Sin+imagen'}"
           alt="${p.nombre}">
      <div class="producto-info">
        <h3>${p.nombre}</h3>
        <div class="precio">$${parseFloat(p.precio).toFixed(2)}</div>
        <div class="stock">Stock: ${p.stock} unidades</div>
      </div>
    </div>
  `).join('');
}

// ================================
// HU-09: Búsqueda en tiempo real
// ================================
function filtrar() {
  const termino = document.getElementById('buscador').value.toLowerCase();
  const filtrados = todosLosProductos.filter(p =>
    p.nombre.toLowerCase().includes(termino)
  );
  mostrarProductos(filtrados);
}

// Inicializar al cargar la página
cargarNavbar();
cargarProductos();
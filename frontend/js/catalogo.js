//const API = 'http://localhost:3000/api';
let todosLosProductos = [];

// Cargar navbar según sesión
function cargarNavbar() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (usuario) {
    document.getElementById('nav-usuario').textContent = `Hola, ${usuario.nombre}`;
    document.getElementById('btn-login').style.display = 'none';

    const navLinks = document.querySelector('.nav-links');

    // if (navLinks && !document.getElementById('btn-carrito')) {
    //   navLinks.insertAdjacentHTML('beforeend', `
    //     <a href="carrito.html" id="btn-carrito">Mi carrito</a>
    //     <a href="pedidos.html" id="btn-pedidos">Mis pedidos</a>
    //   `);
    // }
      if (
        usuario.rol === 'comprador' &&
        navLinks &&
        !document.getElementById('btn-carrito')
      ) {
        navLinks.insertAdjacentHTML('beforeend', `
          <a href="carrito.html" id="btn-carrito">Mi carrito</a>
          <a href="pedidos.html" id="btn-pedidos">Mis pedidos</a>
        `);
      }

    if (usuario.rol === 'vendedor' || usuario.rol === 'admin') {
      document.getElementById('btn-agregar').style.display = 'inline';

      if (navLinks && !document.getElementById('btn-panel-vendedor')) {
        navLinks.insertAdjacentHTML('beforeend', `
          <a href="panel-vendedor.html" id="btn-panel-vendedor">Panel vendedor</a>
        `);
      }
    }

    document.getElementById('btn-logout').style.display = 'inline';
  }
}


// function cargarNavbar() {
//   const usuario = JSON.parse(localStorage.getItem('usuario'));
//   if (usuario) {
//     document.getElementById('nav-usuario').textContent = `Hola, ${usuario.nombre}`;
//     document.getElementById('btn-login').style.display = 'none';
//     if (usuario.rol === 'vendedor' || usuario.rol === 'admin') {
//   document.getElementById('btn-agregar').style.display = 'inline';
//   }   
//     document.getElementById('btn-logout').style.display = 'inline';
//   }
// }

// ================================
// HU-05: Cargar catálogo
// ================================
function mostrarProductos(productos) {
  const catalogo = document.getElementById('catalogo');

  if (productos.length === 0) {
    catalogo.innerHTML = '<p>No se encontraron productos.</p>';
    return;
  }

  catalogo.innerHTML = productos.map(p => `
    <div class="producto-card">
      <img 
        src="${p.imagen || 'https://via.placeholder.com/220x180?text=Sin+imagen'}"
        alt="${p.nombre}"
        onclick="verDetalle(${p.id})"
        style="cursor:pointer;"
      >

      <div class="producto-info">
        <h3 onclick="verDetalle(${p.id})" style="cursor:pointer;">
          ${p.nombre}
        </h3>

        <p>${p.descripcion || 'Sin descripción'}</p>

        <div class="precio">$${parseFloat(p.precio).toFixed(2)}</div>

        <div class="stock">Stock: ${p.stock} unidades</div>

        <div style="display:flex; gap:8px; margin-top:12px;">
          <button class="btn" onclick="agregarAlCarrito(${p.id})">
            Agregar al carrito
          </button>

          <button class="btn-secundario" onclick="verDetalle(${p.id})">
            Ver detalle
          </button>
        </div>
      </div>
    </div>
  `).join('');
}


function verDetalle(id) {
  window.location.href = `detalle-producto.html?id=${id}`;
}

async function agregarAlCarrito(productoId) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token = localStorage.getItem('token');

  if (!usuario || !token) {
    alert('Debes iniciar sesión para agregar productos al carrito');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API}/carrito/agregar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        producto_id: productoId,
        cantidad: 1
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Producto agregado al carrito');
    } else {
      alert(data.error || 'Error al agregar al carrito');
    }
  } catch (error) {
    alert('No se pudo conectar con el servidor');
  }
}
// ================================
// HU-09: Búsqueda en tiempo real
// ================================
// function filtrar() {
//   const termino = document.getElementById('buscador').value.toLowerCase();
//   const filtrados = todosLosProductos.filter(p =>
//     p.nombre.toLowerCase().includes(termino)
//   );
//   mostrarProductos(filtrados);
// }

async function filtrar() {
  const nombre = document.getElementById('buscador')?.value.trim() || '';
  const precioMin = document.getElementById('precio-min')?.value || '';
  const precioMax = document.getElementById('precio-max')?.value || '';
  const categoria = document.getElementById('categoria')?.value || 'todos';

  const params = new URLSearchParams();

  if (nombre) params.append('nombre', nombre);
  if (precioMin) params.append('precio_min', precioMin);
  if (precioMax) params.append('precio_max', precioMax);
  if (categoria && categoria !== 'todos') {
    params.append('categoria', categoria);
  }
  try {
    const res = await fetch(`${API}/productos?${params.toString()}`);
    const productos = await res.json();

    todosLosProductos = productos;
    mostrarProductos(productos);
  } catch (error) {
    document.getElementById('catalogo').innerHTML =
      '<p>Error al filtrar productos.</p>';
  }
}

function limpiarFiltros() {
  if (document.getElementById('buscador')) {
    document.getElementById('buscador').value = '';
  }

  if (document.getElementById('precio-min')) {
    document.getElementById('precio-min').value = '';
  }

  if (document.getElementById('precio-max')) {
    document.getElementById('precio-max').value = '';
  }

  if (document.getElementById('categoria')) {
    document.getElementById('categoria').value = 'todos';
  }

  cargarProductos();
}


// Inicializar al cargar la página
cargarNavbar();
//cargarProductos();
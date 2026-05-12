const API = 'http://localhost:3000/api';

window.onload = function () {
  cargarDetalleProducto();
};

async function cargarDetalleProducto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('detalle-producto').innerHTML =
      '<p>Producto no encontrado.</p>';
    return;
  }

  try {
    const res = await fetch(`${API}/productos/${id}`);
    const producto = await res.json();

    if (!res.ok) {
      document.getElementById('detalle-producto').innerHTML =
        `<p>${producto.error || 'Producto no encontrado'}</p>`;
      return;
    }

    document.getElementById('detalle-producto').innerHTML = `
      <div class="detalle-card">
        <div>
          <img 
            src="${producto.imagen || 'https://via.placeholder.com/500x380?text=Sin+imagen'}"
            alt="${producto.nombre}"
          >
        </div>

        <div class="detalle-info">
          <h2>${producto.nombre}</h2>

          <p>${producto.descripcion || 'Sin descripción disponible.'}</p>

          <div class="detalle-precio">
            $${parseFloat(producto.precio).toFixed(2)}
          </div>

          <div class="detalle-stock">
            Stock disponible: ${producto.stock} unidades
          </div>

          <div class="cantidad-box">
            <label>Cantidad:</label>
            <input 
              type="number" 
              id="cantidad"
              min="1"
              max="${producto.stock}"
              value="1"
            >
          </div>

          <button class="btn" onclick="agregarAlCarrito(${producto.id})">
            Agregar al carrito
          </button>
        </div>
      </div>
    `;
  } catch (error) {
    document.getElementById('detalle-producto').innerHTML =
      '<p>Error al cargar el producto.</p>';
  }
}

async function agregarAlCarrito(productoId) {
  const token = localStorage.getItem('token');
  const cantidad = document.getElementById('cantidad').value;

  if (!token) {
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
        cantidad: parseInt(cantidad)
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Producto agregado al carrito');
      window.location.href = 'carrito.html';
    } else {
      alert(data.error || 'Error al agregar al carrito');
    }
  } catch (error) {
    alert('No se pudo conectar con el servidor');
  }
}
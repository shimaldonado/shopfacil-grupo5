// ================================
// HU-06: Registrar producto (vendedor)
// ================================

// Verificar que el usuario es vendedor al cargar la página
window.onload = function() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    alert('Debes iniciar sesión para acceder a esta página');
    window.location.href = 'login.html';
    return;
  }
  if (usuario.rol !== 'vendedor' && usuario.rol !== 'admin') {
    alert('No tienes permisos para acceder a esta página');
    window.location.href = 'index.html';
  }
};

async function agregarProducto() {
  const nombre = document.getElementById('nombre').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const precio = document.getElementById('precio').value;
  const stock = document.getElementById('stock').value;
  const imagen = document.getElementById('imagen').value.trim();
  const categoria = document.getElementById('categoria').value;

  // Validar campos obligatorios
  if (!nombre || !precio || !stock) {
    mostrarMensaje('Nombre, precio y stock son obligatorios', 'error');
    return;
  }

  // Obtener vendedor_id del usuario en sesión
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  try {
    const res = await fetch('http://localhost:3000/api/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        nombre,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen: imagen || null,
        categoria
        //vendedor_id: usuario.id
      })
    });

    const data = await res.json();

    if (res.ok) {
      mostrarMensaje('¡Producto registrado exitosamente!', 'exito');
      // Limpiar formulario
      document.getElementById('nombre').value = '';
      document.getElementById('descripcion').value = '';
      document.getElementById('precio').value = '';
      document.getElementById('stock').value = '';
      document.getElementById('imagen').value = '';
      document.getElementById('categoria').value = '';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      mostrarMensaje(data.error || 'Error al registrar producto', 'error');
    }

  } catch (err) {
    mostrarMensaje('No se pudo conectar con el servidor', 'error');
  }
}
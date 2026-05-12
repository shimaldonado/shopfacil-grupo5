//const API = 'http://localhost:3000/api';
const API_PANEL = 'http://localhost:3000/api';
window.onload = function () {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token = localStorage.getItem('token');

  if (!usuario || !token) {
    alert('Debes iniciar sesión');
    window.location.href = 'login.html';
    return;
  }

  if (usuario.rol !== 'vendedor' && usuario.rol !== 'admin') {
    alert('No tienes permisos para acceder al panel vendedor');
    window.location.href = 'index.html';
    return;
  }

  cargarPedidosVendedor();
};

// ================================
// HU-10: Ver pedidos vendedor
// ================================
async function cargarPedidosVendedor() {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_PANEL}/pedidos/todos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const pedidos = await res.json();
    const div = document.getElementById('lista-pedidos');

    if (!res.ok) {
      div.innerHTML = `<p>${pedidos.error || 'Error al cargar pedidos'}</p>`;
      return;
    }

    if (pedidos.length === 0) {
      div.innerHTML = `
        <div class="vacio">
          <p style="font-size:48px;">📦</p>
          <h3>No existen pedidos registrados</h3>
          <p>Cuando los compradores confirmen pedidos, aparecerán aquí.</p>
        </div>
      `;
      return;
    }

    div.innerHTML = pedidos.map(pedido => `
      <div class="pedido-card">
        <div class="pedido-top">
          <h3>${pedido.codigo || `Pedido #${pedido.id}`}</h3>

          <span class="estado ${pedido.estado}">
            ${estadoTexto(pedido.estado)}
          </span>
        </div>

        <div class="pedido-info">
          <p>👤 Comprador: ${pedido.comprador}</p>
          <p>📦 Productos: ${pedido.productos}</p>
          <p>📅 Fecha: ${new Date(pedido.created_at).toLocaleDateString('es-EC')}</p>
          <p>💰 Total: <b>$${parseFloat(pedido.total).toFixed(2)}</b></p>
        </div>

        <div class="acciones">
          ${botonesEstado(pedido)}
        </div>
      </div>
    `).join('');
  } catch (error) {
    document.getElementById('lista-pedidos').innerHTML =
      '<p>Error al conectar con el servidor.</p>';
  }
}

function estadoTexto(estado) {
  const textos = {
    pendiente: '⏳ Pendiente',
    en_proceso: '🔄 En proceso',
    enviado: '🚚 Enviado',
    entregado: '✅ Entregado'
  };

  return textos[estado] || estado;
}

function botonesEstado(pedido) {
  if (pedido.estado === 'pendiente') {
    return `
      <button class="btn-estado btn-proceso" onclick="actualizarEstado(${pedido.id}, 'en_proceso')">
        Pasar a En proceso
      </button>
    `;
  }

  if (pedido.estado === 'en_proceso') {
    return `
      <button class="btn-estado btn-enviado" onclick="actualizarEstado(${pedido.id}, 'enviado')">
        Marcar como enviado
      </button>
    `;
  }

  if (pedido.estado === 'enviado') {
    return `
      <button class="btn-estado btn-entregado" onclick="actualizarEstado(${pedido.id}, 'entregado')">
        Marcar como entregado
      </button>
    `;
  }

  return `<span style="color:#777;font-size:13px;">Pedido finalizado</span>`;
}

async function actualizarEstado(pedidoId, estado) {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_PANEL}/pedidos/estado/${pedidoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estado })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Estado actualizado correctamente');
      cargarPedidosVendedor();
    } else {
      alert(data.error || 'No se pudo actualizar el estado');
    }
  } catch (error) {
    alert('Error al conectar con el servidor');
  }
}
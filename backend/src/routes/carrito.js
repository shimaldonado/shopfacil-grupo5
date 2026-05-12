const express = require('express');
const router = express.Router();
const db = require('../db');
const { verificarToken } = require('../middlewares/authMiddleware');

// ================================
// HU-07 / HU-08: Ver carrito del usuario autenticado
// ================================
router.get('/', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const [items] = await db.query(
      `SELECT 
        c.id,
        c.cantidad,
        p.id AS producto_id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.imagen,
        (c.cantidad * p.precio) AS subtotal
      FROM carrito c
      INNER JOIN productos p ON c.producto_id = p.id
      WHERE c.usuario_id = ?`,
      [usuarioId]
    );

    const total = items.reduce((sum, item) => {
      return sum + parseFloat(item.subtotal);
    }, 0);

    res.json({
      items,
      total: total.toFixed(2)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
});

// ================================
// HU-07: Agregar producto al carrito
// ================================
router.post('/agregar', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { producto_id, cantidad } = req.body;

  if (!producto_id || !cantidad) {
    return res.status(400).json({
      error: 'Producto y cantidad son obligatorios'
    });
  }

  const cantidadSolicitada = parseInt(cantidad);

  if (cantidadSolicitada <= 0) {
    return res.status(400).json({
      error: 'La cantidad debe ser mayor a 0'
    });
  }

  try {
    const [productos] = await db.query(
      `SELECT id, stock, activo 
       FROM productos 
       WHERE id = ?`,
      [producto_id]
    );

    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (!productos[0].activo) {
      return res.status(400).json({ error: 'Producto no disponible' });
    }

    if (cantidadSolicitada > productos[0].stock) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    const [existe] = await db.query(
      `SELECT id, cantidad 
       FROM carrito 
       WHERE usuario_id = ? AND producto_id = ?`,
      [usuarioId, producto_id]
    );

    if (existe.length > 0) {
      const nuevaCantidad = existe[0].cantidad + cantidadSolicitada;

      if (nuevaCantidad > productos[0].stock) {
        return res.status(400).json({ error: 'Stock insuficiente' });
      }

      await db.query(
        `UPDATE carrito 
         SET cantidad = ? 
         WHERE id = ?`,
        [nuevaCantidad, existe[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO carrito (usuario_id, producto_id, cantidad) 
         VALUES (?, ?, ?)`,
        [usuarioId, producto_id, cantidadSolicitada]
      );
    }

    res.json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

// ================================
// HU-08: Actualizar cantidad
// ================================
router.put('/:id', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { cantidad } = req.body;
  const cantidadNueva = parseInt(cantidad);

  if (!cantidadNueva || cantidadNueva <= 0) {
    return res.status(400).json({
      error: 'La cantidad debe ser mayor a 0'
    });
  }

  try {
    const [items] = await db.query(
      `SELECT c.id, c.producto_id, p.stock
       FROM carrito c
       INNER JOIN productos p ON c.producto_id = p.id
       WHERE c.id = ? AND c.usuario_id = ?`,
      [req.params.id, usuarioId]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en carrito' });
    }

    if (cantidadNueva > items[0].stock) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    await db.query(
      `UPDATE carrito 
       SET cantidad = ? 
       WHERE id = ? AND usuario_id = ?`,
      [cantidadNueva, req.params.id, usuarioId]
    );

    res.json({ message: 'Cantidad actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar cantidad' });
  }
});

// ================================
// HU-07: Eliminar item del carrito
// ================================
router.delete('/:id', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    await db.query(
      `DELETE FROM carrito 
       WHERE id = ? AND usuario_id = ?`,
      [req.params.id, usuarioId]
    );

    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
});

module.exports = router;
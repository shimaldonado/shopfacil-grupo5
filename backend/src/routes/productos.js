const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  verificarToken,
  permitirRoles
} = require('../middlewares/authMiddleware');

// ================================
// HU-05: Ver catálogo de productos activos
// ================================
router.get('/', async (req, res) => {
  try {
    const [productos] = await db.query(
      `SELECT id, nombre, descripcion, precio, stock, imagen
       FROM productos
       WHERE activo = true
       ORDER BY created_at DESC`
    );

    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ================================
// HU-06: Registrar producto solo vendedor/admin
// ================================
router.post(
  '/',
  verificarToken,
  permitirRoles('vendedor', 'admin'),
  async (req, res) => {
    const { nombre, descripcion, precio, stock, imagen } = req.body;

    if (!nombre || precio === undefined || stock === undefined) {
      return res.status(400).json({
        error: 'Nombre, precio y stock son obligatorios'
      });
    }

    if (Number(precio) <= 0) {
      return res.status(400).json({
        error: 'El precio debe ser mayor a 0'
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        error: 'El stock no puede ser negativo'
      });
    }

    try {
      await db.query(
        `INSERT INTO productos 
         (nombre, descripcion, precio, stock, imagen, vendedor_id, activo)
         VALUES (?, ?, ?, ?, ?, ?, true)`,
        [
          nombre,
          descripcion || null,
          Number(precio),
          Number(stock),
          imagen || null,
          req.usuario.id
        ]
      );

      res.status(201).json({
        message: 'Producto registrado exitosamente'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar producto' });
    }
  }
);

module.exports = router;
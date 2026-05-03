const express = require('express');
const router = express.Router();
const db = require('../db');

// ================================
// HU-05: Ver catálogo de productos
// ================================
router.get('/', async (req, res) => {
  try {
    const [productos] = await db.query(
      'SELECT id, nombre, descripcion, precio, stock, imagen FROM productos WHERE activo = true'
    );
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ================================
// HU-06: Registrar producto (vendedor)
// ================================
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, stock, imagen, vendedor_id } = req.body;

  // Validar campos obligatorios
  if (!nombre || !precio || !stock || !vendedor_id) {
    return res.status(400).json({
      error: 'Nombre, precio, stock y vendedor son obligatorios'
    });
  }

  try {
    await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, imagen, vendedor_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, stock, imagen, vendedor_id]
    );
    res.status(201).json({ message: 'Producto registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar producto' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  verificarToken,
  permitirRoles
} = require('../middlewares/authMiddleware');

// // ================================
// // HU-05: Ver catálogo de productos activos
// // ================================
// router.get('/', async (req, res) => {
//   try {
//     const [productos] = await db.query(
//       `SELECT id, nombre, descripcion, precio, stock, imagen
//        FROM productos
//        WHERE activo = true
//        ORDER BY created_at DESC`
//     );

//     res.json(productos);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error al obtener productos' });
//   }
// });


// ================================
// HU-05 + HU-14: Catálogo con filtros
// ================================
router.get('/', async (req, res) => {
  const { nombre, precio_min, precio_max, categoria } = req.query;

  let query = `
    SELECT id, nombre, descripcion, precio, stock, imagen, categoria
    FROM productos
    WHERE activo = true
  `;

  const params = [];

  if (nombre) {
    query += ' AND nombre LIKE ?';
    params.push(`%${nombre}%`);
  }

  if (categoria && categoria !== 'todos') {
    query += ' AND categoria = ?';
    params.push(categoria);
  }

  if (precio_min) {
    query += ' AND precio >= ?';
    params.push(parseFloat(precio_min));
  }

  if (precio_max) {
    query += ' AND precio <= ?';
    params.push(parseFloat(precio_max));
  }

  query += ' ORDER BY created_at DESC';

  try {
    const [productos] = await db.query(query, params);
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ================================
// HU-15: Ver detalle completo del producto
// ================================
router.get('/:id', async (req, res) => {
  try {
    const [productos] = await db.query(
      `SELECT id, nombre, descripcion, precio, stock, imagen, categoria
       FROM productos
       WHERE id = ? AND activo = true`,
      [req.params.id]
    );

    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(productos[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener producto' });
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
    const { nombre, descripcion, precio, stock, imagen, categoria } = req.body;

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
         (nombre, descripcion, precio, stock, imagen, categoria, vendedor_id, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, true)`,
        [
          nombre,
          descripcion || null,
          Number(precio),
          Number(stock),
          imagen || null,
          categoria,
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
const express = require('express');
const pool = require('../DB/db');

const router = express.Router();

// GET todas las naves
router.get('/', async (req, res) => {
    try {
        const naves = await pool.query(`
            SELECT n.*, cn.nombre as clase_nombre, f.nombre as faccion_nombre 
            FROM nave n 
            LEFT JOIN clase_nave cn ON n.clase_nave_id = cn.clase_nave_id 
            LEFT JOIN faccion f ON n.faccion_id = f.faccion_id
        `);
        res.json(naves);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener las naves', detalles: err.message });
    }
});

// GET nave por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const nave = await pool.query(`
            SELECT n.*, cn.nombre as clase_nombre, f.nombre as faccion_nombre 
            FROM nave n 
            LEFT JOIN clase_nave cn ON n.clase_nave_id = cn.clase_nave_id 
            LEFT JOIN faccion f ON n.faccion_id = f.faccion_id
            WHERE n.nave_id = ?
        `, [id]);
        
        if (nave.length === 0) {
            return res.status(404).json({ error: 'Nave no encontrada' });
        }
        res.json(nave[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener la nave', detalles: err.message });
    }
});

// POST nueva nave
router.post('/', async (req, res) => {
    try {
        const { nombre, clase_nave_id, faccion_id, fabricante, armamento, capacidad_tripulacion } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre de la nave es requerido' });
        }

        const result = await pool.query(
            'INSERT INTO nave (nombre, clase_nave_id, faccion_id, fabricante, armamento, capacidad_tripulacion) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, clase_nave_id || null, faccion_id || null, fabricante || null, armamento || null, capacidad_tripulacion || null]
        );

        res.status(201).json({ 
            mensaje: 'Nave creada exitosamente',
            nave_id: result.insertId 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear la nave', detalles: err.message });
    }
});

// PUT actualizar nave
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, clase_nave_id, faccion_id, fabricante, armamento, capacidad_tripulacion } = req.body;

        const result = await pool.query(
            `UPDATE nave SET 
                nombre = COALESCE(?, nombre),
                clase_nave_id = COALESCE(?, clase_nave_id),
                faccion_id = COALESCE(?, faccion_id),
                fabricante = COALESCE(?, fabricante),
                armamento = COALESCE(?, armamento),
                capacidad_tripulacion = COALESCE(?, capacidad_tripulacion)
            WHERE nave_id = ?`,
            [nombre, clase_nave_id, faccion_id, fabricante, armamento, capacidad_tripulacion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nave no encontrada' });
        }

        res.json({ mensaje: 'Nave actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar la nave', detalles: err.message });
    }
});

// DELETE nave
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM nave WHERE nave_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nave no encontrada' });
        }

        res.json({ mensaje: 'Nave eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar la nave', detalles: err.message });
    }
});

module.exports = router;
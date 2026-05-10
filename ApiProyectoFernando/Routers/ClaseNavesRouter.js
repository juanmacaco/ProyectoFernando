const express = require('express');
const pool = require('../DB/db');

const router = express.Router();

// GET todas las clases de naves
router.get('/', async (req, res) => {
    try {
        const clases = await pool.query(`
            SELECT cn.*, u.nombre as universo_nombre 
            FROM clase_nave cn 
            LEFT JOIN universo u ON cn.universo_id = u.universo_id
        `);
        res.json(clases);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener las clases de naves', detalles: err.message });
    }
});

// GET clase de nave por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const clase = await pool.query(`
            SELECT cn.*, u.nombre as universo_nombre 
            FROM clase_nave cn 
            LEFT JOIN universo u ON cn.universo_id = u.universo_id
            WHERE cn.clase_nave_id = ?
        `, [id]);
        
        if (clase.length === 0) {
            return res.status(404).json({ error: 'Clase de nave no encontrada' });
        }
        res.json(clase[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener la clase de nave', detalles: err.message });
    }
});

// POST nueva clase de nave
router.post('/', async (req, res) => {
    try {
        const { universo_id, nombre, rol } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre de la clase es requerido' });
        }

        const result = await pool.query(
            'INSERT INTO clase_nave (universo_id, nombre, rol) VALUES (?, ?, ?)',
            [universo_id || 1, nombre, rol || null]
        );

        res.status(201).json({ 
            mensaje: 'Clase de nave creada exitosamente',
            clase_nave_id: result.insertId 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear la clase de nave', detalles: err.message });
    }
});

// PUT actualizar clase de nave
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, rol } = req.body;

        const result = await pool.query(
            `UPDATE clase_nave SET 
                nombre = COALESCE(?, nombre),
                rol = COALESCE(?, rol)
            WHERE clase_nave_id = ?`,
            [nombre, rol, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Clase de nave no encontrada' });
        }

        res.json({ mensaje: 'Clase de nave actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar la clase de nave', detalles: err.message });
    }
});

// DELETE clase de nave
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM clase_nave WHERE clase_nave_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Clase de nave no encontrada' });
        }

        res.json({ mensaje: 'Clase de nave eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar la clase de nave', detalles: err.message });
    }
});

// GET naves de una clase
router.get('/:id/naves', async (req, res) => {
    try {
        const { id } = req.params;
        const naves = await pool.query(`
            SELECT * FROM nave WHERE clase_nave_id = ?
        `, [id]);
        
        res.json(naves);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener naves', detalles: err.message });
    }
});

module.exports = router;

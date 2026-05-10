const express = require('express');
const pool = require('../DB/db');

const router = express.Router();

// GET todas las facciones
router.get('/', async (req, res) => {
    try {
        const facciones = await pool.query(`
            SELECT f.*, l.nombre as sede_nombre 
            FROM faccion f 
            LEFT JOIN lugar l ON f.sede_lugar_id = l.lugar_id
        `);
        res.json(facciones);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener las facciones', detalles: err.message });
    }
});

// GET facción por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const faccion = await pool.query(`
            SELECT f.*, l.nombre as sede_nombre 
            FROM faccion f 
            LEFT JOIN lugar l ON f.sede_lugar_id = l.lugar_id
            WHERE f.faccion_id = ?
        `, [id]);
        
        if (faccion.length === 0) {
            return res.status(404).json({ error: 'Facción no encontrada' });
        }
        res.json(faccion[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener la facción', detalles: err.message });
    }
});

// POST nueva facción
router.post('/', async (req, res) => {
    try {
        const { nombre, tipo, ideologia, sede_lugar_id, poder_influencia } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre de la facción es requerido' });
        }

        const result = await pool.query(
            'INSERT INTO faccion (nombre, tipo, ideologia, sede_lugar_id, poder_influencia) VALUES (?, ?, ?, ?, ?)',
            [nombre, tipo || null, ideologia || null, sede_lugar_id || null, poder_influencia || 0]
        );

        res.status(201).json({ 
            mensaje: 'Facción creada exitosamente',
            faccion_id: result.insertId 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear la facción', detalles: err.message });
    }
});

// PUT actualizar facción
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo, ideologia, sede_lugar_id, poder_influencia } = req.body;

        const result = await pool.query(
            `UPDATE faccion SET 
                nombre = COALESCE(?, nombre),
                tipo = COALESCE(?, tipo),
                ideologia = COALESCE(?, ideologia),
                sede_lugar_id = COALESCE(?, sede_lugar_id),
                poder_influencia = COALESCE(?, poder_influencia)
            WHERE faccion_id = ?`,
            [nombre, tipo, ideologia, sede_lugar_id, poder_influencia, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Facción no encontrada' });
        }

        res.json({ mensaje: 'Facción actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar la facción', detalles: err.message });
    }
});

// DELETE facción
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM faccion WHERE faccion_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Facción no encontrada' });
        }

        res.json({ mensaje: 'Facción eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar la facción', detalles: err.message });
    }
});

// GET miembros de una facción
router.get('/:id/miembros', async (req, res) => {
    try {
        const { id } = req.params;
        const miembros = await pool.query(`
            SELECT p.*, r.nombre as rango_nombre FROM personaje p
            INNER JOIN personaje_faccion pf ON p.personaje_id = pf.personaje_id
            LEFT JOIN rango r ON pf.rango_id = r.rango_id
            WHERE pf.faccion_id = ?
        `, [id]);
        
        res.json(miembros);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener miembros', detalles: err.message });
    }
});

module.exports = router;

const express = require('express');
const pool = require('../DB/db');

const router = express.Router();

// GET todas las criaturas
router.get('/', async (req, res) => {
    try {
        const criaturas = await pool.query(`
            SELECT c.*, p.nombre as planeta_nombre 
            FROM criatura c 
            LEFT JOIN planeta p ON c.habitat_planeta_id = p.planeta_id
        `);
        res.json(criaturas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener las criaturas', detalles: err.message });
    }
});

// GET criatura por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const criatura = await pool.query(`
            SELECT c.*, p.nombre as planeta_nombre 
            FROM criatura c 
            LEFT JOIN planeta p ON c.habitat_planeta_id = p.planeta_id
            WHERE c.criatura_id = ?
        `, [id]);
        
        if (criatura.length === 0) {
            return res.status(404).json({ error: 'Criatura no encontrada' });
        }
        res.json(criatura[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener la criatura', detalles: err.message });
    }
});

// POST nueva criatura
router.post('/', async (req, res) => {
    try {
        const { habitat_planeta_id, nombre, tamano, agresividad, inteligencia, peligro, categoria } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre de la criatura es requerido' });
        }

        const result = await pool.query(
            'INSERT INTO criatura (habitat_planeta_id, nombre, tamano, agresividad, inteligencia, peligro, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [habitat_planeta_id || null, nombre, tamano || null, agresividad || 0, inteligencia || 0, peligro || 0, categoria || null]
        );

        res.status(201).json({ 
            mensaje: 'Criatura creada exitosamente',
            criatura_id: result.insertId 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear la criatura', detalles: err.message });
    }
});

// PUT actualizar criatura
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tamano, agresividad, inteligencia, peligro, categoria } = req.body;

        const result = await pool.query(
            `UPDATE criatura SET 
                nombre = COALESCE(?, nombre),
                tamano = COALESCE(?, tamano),
                agresividad = COALESCE(?, agresividad),
                inteligencia = COALESCE(?, inteligencia),
                peligro = COALESCE(?, peligro),
                categoria = COALESCE(?, categoria)
            WHERE criatura_id = ?`,
            [nombre, tamano, agresividad, inteligencia, peligro, categoria, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Criatura no encontrada' });
        }

        res.json({ mensaje: 'Criatura actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar la criatura', detalles: err.message });
    }
});

// DELETE criatura
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM criatura WHERE criatura_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Criatura no encontrada' });
        }

        res.json({ mensaje: 'Criatura eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar la criatura', detalles: err.message });
    }
});

// GET criaturas por peligro (nivel de amenaza)
router.get('/peligro/:peligro', async (req, res) => {
    try {
        const { peligro } = req.params;
        const criaturas = await pool.query(`
            SELECT * FROM criatura WHERE peligro >= ? ORDER BY peligro DESC
        `, [peligro]);
        
        res.json(criaturas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener criaturas por peligro', detalles: err.message });
    }
});

// GET criaturas de un planeta
router.get('/planeta/:planeta_id', async (req, res) => {
    try {
        const { planeta_id } = req.params;
        const criaturas = await pool.query(`
            SELECT * FROM criatura WHERE habitat_planeta_id = ?
        `, [planeta_id]);
        
        res.json(criaturas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener criaturas del planeta', detalles: err.message });
    }
});

module.exports = router;

const express = require('express');
const pool = require('../DB/db');

const router = express.Router();

// GET todas las armas
router.get('/', async (req, res) => {
    try {
        const armas = await pool.query(`
            SELECT a.*, u.nombre as universo_nombre 
            FROM arma a 
            LEFT JOIN universo u ON a.universo_id = u.universo_id
        `);
        res.json(armas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener las armas', detalles: err.message });
    }
});

// GET arma por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const arma = await pool.query(`
            SELECT a.*, u.nombre as universo_nombre 
            FROM arma a 
            LEFT JOIN universo u ON a.universo_id = u.universo_id
            WHERE a.arma_id = ?
        `, [id]);
        
        if (arma.length === 0) {
            return res.status(404).json({ error: 'Arma no encontrada' });
        }
        res.json(arma[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el arma', detalles: err.message });
    }
});

// POST nueva arma
router.post('/', async (req, res) => {
    try {
        const { universo_id, nombre, categoria, tecnologia } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del arma es requerido' });
        }

        const result = await pool.query(
            'INSERT INTO arma (universo_id, nombre, categoria, tecnologia) VALUES (?, ?, ?, ?)',
            [universo_id || 1, nombre, categoria || null, tecnologia || null]
        );

        res.status(201).json({ 
            mensaje: 'Arma creada exitosamente',
            arma_id: result.insertId 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear el arma', detalles: err.message });
    }
});

// PUT actualizar arma
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, categoria, tecnologia } = req.body;

        const result = await pool.query(
            `UPDATE arma SET 
                nombre = COALESCE(?, nombre),
                categoria = COALESCE(?, categoria),
                tecnologia = COALESCE(?, tecnologia)
            WHERE arma_id = ?`,
            [nombre, categoria, tecnologia, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Arma no encontrada' });
        }

        res.json({ mensaje: 'Arma actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el arma', detalles: err.message });
    }
});

// DELETE arma
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM arma WHERE arma_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Arma no encontrada' });
        }

        res.json({ mensaje: 'Arma eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el arma', detalles: err.message });
    }
});

// GET armas por categoría
router.get('/categoria/:categoria', async (req, res) => {
    try {
        const { categoria } = req.params;
        const armas = await pool.query(`
            SELECT * FROM arma WHERE categoria = ?
        `, [categoria]);
        
        res.json(armas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener armas por categoría', detalles: err.message });
    }
});

module.exports = router;

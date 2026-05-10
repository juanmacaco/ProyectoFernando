const express = require('express');
const pool = require('../DB/db');

const router = express.Router();

// GET todos los planetas
router.get('/', async (req, res) => {
    console.log('Entra al metodo')
    try {
        const planetas = await pool.query(`
            SELECT p.*, r.nombre as region_nombre 
            FROM planeta p 
            LEFT JOIN region_espacial r ON p.region_id = r.region_id
        `);
        console.log(planetas);
        res.json(planetas);
        
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los planetas', detalles: err.message });
    }
});

// GET planeta por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const planeta = await pool.query(`
            SELECT p.*, r.nombre as region_nombre 
            FROM planeta p 
            LEFT JOIN region_espacial r ON p.region_id = r.region_id
            WHERE p.planeta_id = ?
        `, [id]);
        
        if (planeta.length === 0) {
            return res.status(404).json({ error: 'Planeta no encontrado' });
        }
        res.json(planeta[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el planeta', detalles: err.message });
    }
});

// POST nuevo planeta
router.post('/', async (req, res) => {
    try {
        const { region_id, nombre, tipo, clima_principal, atmosfera, bioma_principal, poblacion_estimada } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del planeta es requerido' });
        }

        const result = await pool.query(
            'INSERT INTO planeta (region_id, nombre, tipo, clima_principal, atmosfera, bioma_principal, poblacion_estimada) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [region_id || null, nombre, tipo || null, clima_principal || null, atmosfera || null, bioma_principal || null, poblacion_estimada || 0]
        );

        res.status(201).json({ 
            mensaje: 'Planeta creado exitosamente',
            planeta_id: result.insertId 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear el planeta', detalles: err.message });
    }
});

// PUT actualizar planeta
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo, clima_principal, atmosfera, bioma_principal, poblacion_estimada } = req.body;

        const result = await pool.query(
            `UPDATE planeta SET 
                nombre = COALESCE(?, nombre),
                tipo = COALESCE(?, tipo),
                clima_principal = COALESCE(?, clima_principal),
                atmosfera = COALESCE(?, atmosfera),
                bioma_principal = COALESCE(?, bioma_principal),
                poblacion_estimada = COALESCE(?, poblacion_estimada)
            WHERE planeta_id = ?`,
            [nombre, tipo, clima_principal, atmosfera, bioma_principal, poblacion_estimada, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Planeta no encontrado' });
        }

        res.json({ mensaje: 'Planeta actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el planeta', detalles: err.message });
    }
});

// DELETE planeta
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM planeta WHERE planeta_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Planeta no encontrado' });
        }

        res.json({ mensaje: 'Planeta eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el planeta', detalles: err.message });
    }
});

// GET especies de un planeta
router.get('/:id/especies', async (req, res) => {
    try {
        const { id } = req.params;
        const especies = await pool.query(`
            SELECT * FROM especie WHERE planeta_origen_id = ?
        `, [id]);
        
        res.json(especies);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener especies', detalles: err.message });
    }
});

// GET lugares de un planeta
router.get('/:id/lugares', async (req, res) => {
    try {
        const { id } = req.params;
        const lugares = await pool.query(`
            SELECT * FROM lugar WHERE planeta_id = ?
        `, [id]);
        
        res.json(lugares);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener lugares', detalles: err.message });
    }
});

module.exports = router;

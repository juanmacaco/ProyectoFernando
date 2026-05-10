const express = require('express');
const pool = require('../DB/db');

const router = express.Router();

// GET todos los personajes
router.get('/', async (req, res) => {
    try {
        const personajes = await pool.query(`
            SELECT p.*, e.nombre as especie_nombre, pl.nombre as planeta_nombre, l.nombre as lugar_nombre 
            FROM personaje p 
            LEFT JOIN especie e ON p.especie_id = e.especie_id 
            LEFT JOIN planeta pl ON p.planeta_origen_id = pl.planeta_id 
            LEFT JOIN lugar l ON p.lugar_origen_id = l.lugar_id
        `);
        res.json(personajes);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los personajes', detalles: err.message });
    }
});

// GET personaje por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const personaje = await pool.query(`
            SELECT p.*, e.nombre as especie_nombre, pl.nombre as planeta_nombre, l.nombre as lugar_nombre 
            FROM personaje p 
            LEFT JOIN especie e ON p.especie_id = e.especie_id 
            LEFT JOIN planeta pl ON p.planeta_origen_id = pl.planeta_id 
            LEFT JOIN lugar l ON p.lugar_origen_id = l.lugar_id
            WHERE p.personaje_id = ?
        `, [id]);
        
        if (personaje.length === 0) {
            return res.status(404).json({ error: 'Personaje no encontrado' });
        }
        res.json(personaje[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el personaje', detalles: err.message });
    }
});

// POST nuevo personaje
router.post('/', async (req, res) => {
    try {
        const { universo_id, nombre, especie_id, planeta_origen_id, lugar_origen_id, fecha_nacimiento, estado } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del personaje es requerido' });
        }

        const result = await pool.query(
            'INSERT INTO personaje (universo_id, nombre, especie_id, planeta_origen_id, lugar_origen_id, fecha_nacimiento, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [universo_id || 1, nombre, especie_id || null, planeta_origen_id || null, lugar_origen_id || null, fecha_nacimiento || null, estado || null]
        );

        res.status(201).json({ 
            mensaje: 'Personaje creado exitosamente',
            personaje_id: result.insertId 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear el personaje', detalles: err.message });
    }
});

// PUT actualizar personaje
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, especie_id, planeta_origen_id, lugar_origen_id, fecha_nacimiento, estado } = req.body;

        const result = await pool.query(
            `UPDATE personaje SET 
                nombre = COALESCE(?, nombre),
                especie_id = COALESCE(?, especie_id),
                planeta_origen_id = COALESCE(?, planeta_origen_id),
                lugar_origen_id = COALESCE(?, lugar_origen_id),
                fecha_nacimiento = COALESCE(?, fecha_nacimiento),
                estado = COALESCE(?, estado)
            WHERE personaje_id = ?`,
            [nombre, especie_id, planeta_origen_id, lugar_origen_id, fecha_nacimiento, estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Personaje no encontrado' });
        }

        res.json({ mensaje: 'Personaje actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el personaje', detalles: err.message });
    }
});

// DELETE personaje
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM personaje WHERE personaje_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Personaje no encontrado' });
        }

        res.json({ mensaje: 'Personaje eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el personaje', detalles: err.message });
    }
});

// GET personajes por facción
router.get('/faccion/:faccion_id', async (req, res) => {
    try {
        const { faccion_id } = req.params;
        const personajes = await pool.query(`
            SELECT p.* FROM personaje p
            INNER JOIN personaje_faccion pf ON p.personaje_id = pf.personaje_id
            WHERE pf.faccion_id = ?
        `, [faccion_id]);
        
        res.json(personajes);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener personajes por facción', detalles: err.message });
    }
});

module.exports = router;

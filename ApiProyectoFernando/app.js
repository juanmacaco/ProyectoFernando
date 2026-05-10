const express = require('express');
const cors = require('cors');
const pool = require('./DB/db');

const app = express();

// Middleware
app.use(express.json());

// CORS: permitir peticiones desde uno o varios frontends.
// Se puede pasar en la variable de entorno `FRONTEND_URLS` separada por comas.
const FRONTEND_URLS = (process.env.FRONTEND_URLS || 'http://localhost:4200,http://localhost:8100')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // permitir peticiones sin origen (postman, server-side requests)
        if (!origin) return callback(null, true);
        if (FRONTEND_URLS.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('CORS origin denied'));
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware para convertir BigInt a string antes de serializar a JSON
function convertBigInt(value) {
    if (typeof value === 'bigint') return value.toString();
    if (Array.isArray(value)) return value.map(convertBigInt);
    if (value && typeof value === 'object') {
        const out = {};
        for (const k of Object.keys(value)) {
            out[k] = convertBigInt(value[k]);
        }
        return out;
    }
    return value;
}

app.use((req, res, next) => {
    const oldJson = res.json;
    res.json = function (data) {
        try {
            const safe = convertBigInt(data);
            return oldJson.call(this, safe);
        } catch (e) {
            return oldJson.call(this, data);
        }
    };
    next();
});

// Ruta de Inicio
app.get('/', (req, res) => {
    res.json({ 
        mensaje: 'Bienvenido a la API de Universos Dead Space',
        version: '1.0.0',
        endpoints: [
            '/api/naves',
            '/api/personajes',
            '/api/planetas',
            '/api/facciones',
            '/api/clase-naves',
            '/api/armas',
            '/api/criaturas'
        ]
    });
});

// Routers
const navesRouter = require('./Routers/NavesRouter');
const personajesRouter = require('./Routers/PersonajesRouter');
const planetasRouter = require('./Routers/PlanetasRouter');
const faccionesRouter = require('./Routers/FaccionesRouter');
const claseNavesRouter = require('./Routers/ClaseNavesRouter');
const armasRouter = require('./Routers/ArmasRouter');
const criaturasRouter = require('./Routers/CriaturasRouter');

app.use('/api/naves', navesRouter);
app.use('/api/personajes', personajesRouter);
app.use('/api/planetas', planetasRouter);
app.use('/api/facciones', faccionesRouter);
app.use('/api/clase-naves', claseNavesRouter);
app.use('/api/armas', armasRouter);
app.use('/api/criaturas', criaturasRouter);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Definimos el puerto
const PORT = process.env.PORT || 3000;

// Escucha del servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
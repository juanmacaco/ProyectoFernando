// Archivo de configuración
module.exports = {
    server: {
        port: process.env.PORT || 3000,
        host: 'localhost'
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'universo',
        connectionLimit: 5
    },
    api: {
        version: '1.0.0',
        name: 'API Universos'
    }
};

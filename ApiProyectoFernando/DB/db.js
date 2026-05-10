const  mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'universo',
    connectionLimit: 5
});

module.exports = pool;
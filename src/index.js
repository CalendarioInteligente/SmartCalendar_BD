const db = require('./db')
const express = require("express");
const router = require('./routes');
const allowedOrigins = require('../config/allowedOrigins')
const cookieParser = require('cookie-parser')

const PORT = 3000


async function startServer() {
    // Estrutura e conecta ao banco de dados
    const connection = await db.createDatabase()

    if (!connection) {
        process.exit(1);
    }

    const app = express()

    // Allow origins
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (allowedOrigins.includes(origin)) {
             res.setHeader('Access-Control-Allow-Origin', origin);
        }
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', true);
        return next();
      });

    app.use(express.json())
    app.use(cookieParser());
    app.use(router)

    console.log(`Servidor escutando na porta: ${PORT}`)
    app.listen(PORT);
}

startServer();
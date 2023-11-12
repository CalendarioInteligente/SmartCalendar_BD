const db = require('./db')
const express = require("express");
const router = require('./routes');

const PORT = 3000


async function startServer() {
    // Estrutura e conecta ao banco de dados
    const connection = await db.createDatabase()

    if (!connection) {
        process.exit(1);
    }

    const app = express()
    app.use(express.json())
    app.use(router)

    console.log(`Servidor escutando na porta: ${PORT}`)
    app.listen(PORT);
}

startServer();
const express = require("express");
const bcrypt = require('bcryptjs');

const uuidParse = require('uuid').parse;
const uuidv4 = require('uuid').v4;

const db = require("./db")
const models = require('./models/usuario.js')
const newMessage = require('./message.js')

let router = express.Router()

// Criptografa a senha
const encryptPWD = (password) => {
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

    return hash;
}

// Compara senhas
const comparePWD = (password, hash) => {
    try {
        return bcrypt.compareSync(password, hash);
    } catch {}

    return false;
}

// Gera um token de sessão para o usuario
const newSession = async (userId) => {
    const sessionId = uuidv4();

    // Cria sessão no banco de dados
    const result = await db.insertSession({sessionId: Buffer.from(uuidParse(sessionId)), userId: userId})

    if (!result) {
        return undefined;
    }

    return sessionId;
}

const validateTokenGetId = async (sessionId) => {

    // Procura pelo token no banco de dados
    const recordset = await db.querySession({sessionId: Buffer.from(uuidParse(sessionId))})

    if (!recordset) {
        return undefined
    }

    return recordset.userId;
}

// DASHBOARD PAGINA PRINCIPAL
router.route('/').get(async (req, res) => {
    // Verifica os tokens
    const sessionId = req.headers.cookie.split('=')[1];
    const userId = await validateTokenGetId(sessionId);

    if (userId === undefined || userId === null) {
        return res.status(400).json(newMessage('TIV', 'Token Inválido', 'Não foi possivel validar seu token.'))
    }
    
    return res.status(200).json(newMessage('OK', 'Requisição completa', 'Sua autenticação é válida'))
})

// USUARIO
// '/usuarios'
router.route('/api/login').post(async (req, res) => {
    // 'UNDEFINED' significa que o valor não foi enviado, não que ele é nulo
    const { email, senha, telefone, nome, sobrenome } = req.body;
    const id = -1;

    if (!await db.getConnection()) {
        return res.status(500).json(newMessage('CBD', 'Sem conexão com o banco de dados', 'Não foi possivel acessar o banco de dados.'))
    }

    // Checa por dados desnecessários
    if (Object.keys(req.body).length > 5) {
        return res.status(400).json(newMessage('DTE', 'Dados desnecessários', 'Mais dados que o necessário foram enviados.'))
    }

    // Email e senha são dados obrigatórios
    if (!(email && senha)) {
        return res.status(400).json(newMessage('DTE', 'Tipos de dados invalidos', 'Uma senha e email é necessário para que o usuario seja criado.'))
    }

    // Checa se tem valores indefinidos
    if (telefone === undefined || nome === undefined || sobrenome === undefined) {
        return res.status(400).json(newMessage('DTE', 'Dados faltando', 'Não omita nenhum dos dados, envie como nulo se for necessário.'))
    };

    // Cria o modelo usuario
    let usuario;
    try {
        // Criptografa a senha usando um hash
        // Caso um nome não tenha sido especificado usa o nome "User" com o sobrenome ""
        usuario = new models.Usuario(id, nome ? nome : "User", sobrenome ? sobrenome : "", email, telefone, encryptPWD(senha));
    } catch {
        return res.status(400).json(newMessage('DTE', 'Tipos de dados invalidos', 'Não foi possivel construir um modelo de usuario a partir dos dados enviados.'))
    }

    // Cria o usuario no banco de dados
    let result = await db.insertUsuario(usuario);

    if (result === undefined) {
        return res.status(500).json(newMessage('CBD', 'Sem conexão com o banco de dados', 'Não foi possivel acessar o banco de dados.'))
    } else if (result === false) {
        return res.status(400).json(newMessage('ERR', 'Email ou telefone já usado', 'Não é possivel dois ou mais usuarios compartilharem do mesmo email/telefone.'))
    }

    // Cria uma sessão para o usuario
    let recordset = await db.queryUsuarioByEmail({email: email})
    const sessionId = await newSession(recordset.id);

    if (!sessionId) {
        return res.status(203).json(newMessage('CRE', 'Falha ao criar sessão.', 'Usuario registrado mas houve uma falha na hora de criar a sessão, tente logar novamente.'))
    }

    res.set('Set-Cookie', `session=${sessionId}`)
    
    return res.status(201).json(newMessage('OK', 'Usuario criado com sucesso', 'Seu usuario foi criado no servidor'))
})
.get(async (req, res) => {
    const { email, senha } = req.body;

    if (!await db.getConnection()) {
        return res.status(500).json(newMessage('CBD', 'Sem conexão com o banco de dados', 'Não foi possivel acessar o banco de dados.'))
    }

    // Checa por dados desnecessários
    if ((Object.keys(req.body).length != 2) || !(email && senha)) {
        return res.status(400).json(newMessage('DTE', 'Dados incorretos', 'Envie um email e uma senha.'))
    }

    // Busca pelo usuario
    let recordset = await db.queryUsuarioByEmail({email: email})

    if (!recordset) {
        return res.status(400).json(newMessage('DTE', 'Email incorreto', 'Não existe ninguem com este email.'))
    }

    // Verifica se a senha está correta
    if (!comparePWD(senha, recordset.senha)) {
        return res.status(400).json(newMessage('DTE', 'Senha incorreta', 'Tente novamente.'))
    }

    // Cria uma sessão para o usuario
    const sessionId = await newSession(recordset.id);

    if (!sessionId) {
        return res.status(500).json(newMessage('CRE', 'Falha ao criar sessão.', 'Usuario logado mas houve uma falha na hora de criar a sessão.'))
    }

    res.set('Set-Cookie', `session=${sessionId}`)

    // Redirect user to the main page
    return res.status(200).json(newMessage('OK', 'Logado com sucesso', 'As informações corretas foram providas!'))
})


module.exports = router

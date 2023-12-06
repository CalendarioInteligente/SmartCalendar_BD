const express = require("express");
const bcrypt = require('bcryptjs');

const uuidParse = require('uuid').parse;
const uuidv4 = require('uuid').v4;

const db = require("./db")
const models = require('./models/models.js')
const {newResponse, newMessage} = require('./message.js')

const cookieParser = require('cookie-parser')

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

const validateTokenGetId = async (req) => {
    const sessionId = req?.cookies["session"]

    if (!sessionId) {
        return false;
    }

    // Procura pelo token no banco de dados
    const recordset = await db.querySession({sessionId: Buffer.from(uuidParse(sessionId))})

    if (!recordset) {
        return undefined
    }

    return recordset.userId;
}

// Valida o usuario pela API
router.route('/api/oauth').get(async (req, res) => {
    // Verifica os tokens
    const userId = await validateTokenGetId(req);

    if (userId === undefined || userId === false) {
        return res.status(400).json(newResponse('TIV', 'Não foi possivel validar seu token.'))
    }
    
    const toSend = {
        session: req.cookies["session"],
        userId: userId
    }

    return res.status(200).json(newResponse('OK', 'Sua autenticação é válida.', toSend))
})

// DASHBOARD PAGINA PRINCIPAL
router.route('/').get(async (req, res) => {
    // Verifica os tokens
    const userId = await validateTokenGetId(req);

    if (userId === undefined || userId === false) {
        return res.status(400).json(newResponse('TIV', 'Não foi possivel validar seu token.'))//newMessage('TIV', 'Token Inválido', 'Não foi possivel validar seu token.'))
    }
    
    return res.status(200).json(newResponse('OK', 'Sua autenticação é válida.'))//newMessage('OK', 'Requisição completa', 'Sua autenticação é válida'))
})

// USUARIO
// '/usuarios'
router.route('/api/signup').post(async (req, res) => {
    // 'UNDEFINED' significa que o valor não foi enviado, não que ele é nulo
    const { email, senha, telefone, nome, sobrenome } = req.body;
    const id = -1;

    if (!await db.getConnection()) {
        return res.status(500).json(newResponse('CBD', 'Sem conexão com o banco de dados'))
    }

    // Checa por dados desnecessários
    if (Object.keys(req.body).length > 5) {
        return res.status(400).json(newResponse('DTE', 'Dados desnecessários'))
    }

    // Email e senha são dados obrigatórios
    if (!(email && senha)) {
        return res.status(400).json(newResponse('DTE', 'Tipos de dados invalidos, uma senha e email é necessário para que o usuario seja criado.'))
    }

    // Checa se tem valores indefinidos
    if (telefone === undefined || nome === undefined || sobrenome === undefined) {
        return res.status(400).json(newResponse('DTE', 'Dados faltando, não omita dados, envie nulo se necessário'))
    };

    // Cria o modelo usuario
    let usuario;
    try {
        // Criptografa a senha usando um hash
        // Caso um nome não tenha sido especificado usa o nome "User" com o sobrenome ""
        usuario = new models.Usuario(id, nome ? nome : "User", sobrenome ? sobrenome : "", email, telefone, encryptPWD(senha));
    } catch {
        return res.status(400).json(newResponse('DTE', 'Tipos de dados invalidos'))
    }

    // Cria o usuario no banco de dados
    let result = await db.insertUsuario(usuario);

    if (result === undefined) {
        return res.status(500).json(newResponse('CBD', 'Sem conexão com o banco de dados'))
    } else if (result === false) {
        return res.status(400).json(newResponse('ERR', 'Email ou telefone já usado'))
    }

    // Cria uma sessão para o usuario
    let recordset = await db.queryUsuarioByEmail({email: email})
    const sessionId = await newSession(recordset.id);

    if (!sessionId) {
        return res.status(203).json(newResponse('CRE', 'Usuario registrado mas falha ao criar sessão. Tente logar novamente.'))
    }

    //res.set('Set-Cookie', `session=${sessionId}`)
    res.cookie('session', sessionId)

    const toSend = {
        session: sessionId,
        userId: recordset.id
    }
    
    return res.status(201).json(newResponse('OK', 'Usuario criado com sucesso', toSend))
})
router.route('/api/login').post(async (req, res) => {
    const { email, senha } = req.body;

    if (!await db.getConnection()) {
        return res.status(500).json(newResponse('CBD', 'Sem conexão com o banco de dados'))
    }

    // Checa por dados desnecessários
    if ((Object.keys(req.body).length != 2) || !(email && senha)) {
        return res.status(400).json(newResponse('DTE', 'Envie um email e uma senha'))
    }

    // Busca pelo usuario
    let recordset = await db.queryUsuarioByEmail({email: email})

    if (!recordset) {
        return res.status(400).json(newResponse('DTE', 'Email incorreto'))
    }

    // Verifica se a senha está correta
    if (!comparePWD(senha, recordset.senha)) {
        return res.status(400).json(newResponse('DTE', 'Senha incorreta'))
    }

    // Cria uma sessão para o usuario
    const sessionId = await newSession(recordset.id);

    if (!sessionId) {
        return res.status(500).json(newResponse('CRE', 'Usuario logado mas falha ao criar sessão.'))
    }

    //res.set('Set-Cookie', `session=${sessionId}`)
    res.cookie('session', sessionId)

    const toSend = {
        session: sessionId,
        userId: recordset.id
    }

    // Redirect user to the main page
    return res.status(200).json(newResponse('OK', 'Logado com sucesso', toSend))
})
router.route('/api/logout').post(async (req, res) => {
    // Verifica os tokens
    const userId = await validateTokenGetId(req);

    if (userId === undefined || userId === false) {
        return res.status(400).json(newResponse('TIV', 'Não foi possivel validar seu token.'))
    }

    let result = await db.removeSession({userId: userId});

    if (!result) {
        return res.status(500).json(newResponse('NDT', 'Não foi possivel deletar a sessão.'))
    }

    res.clearCookie("session")

    return res.status(200).json(newResponse('OK', 'Você foi desconectado.'))
})

// Eventos
router.route('/api/agendamentos').post(async (req, res) => {
    const { titulo, descricao, data } = req.body
    // data: "YYYY-MM-DD HH:MM:SS"

    if (!await db.getConnection()) {
        return res.status(500).json(newResponse('CBD', 'Sem conexão com o banco de dados'))
    }

    // Verifica os tokens
    const userId = await validateTokenGetId(req);

    if (userId === undefined || userId === false) {
        return res.status(400).json(newResponse('TIV', 'Não foi possivel validar seu token.'))
    }

    if (Object.keys(req.body).length != 3) {
        return res.status(400).json(newResponse('DTE', 'Dados incorretos'))
    }

    if (titulo === undefined || descricao === undefined || data === undefined) {
        return res.status(400).json(newResponse('DTE', 'Não omita nenhum dos dados, envie como nulo se for necessário.'))
    }

    // Cria modelo e envia para o BD
    console.log(data.slice(0, 19).replace('T', ' '))
    let evento;
    try {
        evento = new models.Evento(descricao, titulo, userId, data.slice(0, 19).replace('T', ' '));
    } catch {
        return res.status(400).json(newResponse('DTE', 'Não foi possivel construir um modelo de evento a partir dos dados enviados.'))
    }

    let result = await db.insertEvento(evento);

    if (result === undefined) {
        return res.status(500).json(newResponse('CBD', 'Não foi possivel acessar o banco de dados.'))
    } else if (result === false) {
        return res.status(400).json(newResponse('ERR', 'Conflito com outros eventos ou você está tentando agendar para uma data que já passou.'))
    }

    return res.status(200).json(newResponse('OK', 'Seu agendamento foi armazenado com sucesso!'))
})

router.route('/api/user/:id/agendamentos').get(async (req, res) => {
    const id = parseInt(req.params?.id);

    if (isNaN(id)) {
        return res.status(400).json(newResponse('COD', 'ID inválido.'))
    }

    if (!await db.getConnection()) {
        return res.status(500).json(newResponse('CBD', 'Sem conexão com o banco de dados'))
    }

    // Verifica os tokens
    const userId = await validateTokenGetId(req);

    if (userId === undefined || userId === false) {
        return res.status(400).json(newResponse('TIV', 'Não foi possivel validar seu token.'))
    }

    if (userId !== id) {
        return res.status(400).json(newResponse('TIV', 'Você não está autorizado a acessar este usuário.'))
    }

    // Pega todos agendamentos deste usuario
    const result = await db.queryAllEventos({id: userId})

    if (!result) {
        return res.status(500).json(newResponse('NDT', 'Não foi possivel obter os agendamentos.'))
    }

    const toSend = result.map((v) => {
        return {
            titulo: v.titulo,
            descricao: v.descricao,
            data: v.data,
            id: v.id
            //seen: v.seen,
            //notified: v.notified
        }
    })

    return res.status(200).json(newResponse('OK', 'Os agendamentos foram encontrados!', JSON.stringify(toSend)))
})

router.route('/api/agendamentos/:id').delete(async (req, res) => {
    const id = parseInt(req.params?.id);

    if (isNaN(id)) {
        return res.status(400).json(newResponse('COD', 'ID inválido.'))
    }

    // Verifica se este usuario tem permissão para deletar este evento
    const userId = await validateTokenGetId(req);
    const evento = await db.queryEvento({id: id});

    if (userId === undefined || userId === false) {
        return res.status(400).json(newResponse('TIV', 'Não foi possivel validar seu token.'))
    }
    
    if (!evento) {
        return res.status(400).json(newResponse('EIN', 'Não foi possivel encontrar este evento.'))
    }

    if (evento.idUsuario !== userId) {
        return res.status(400).json(newResponse('TIV', 'Você não está autorizado a fazer esta ação.'))
    } 

    const result = db.deleteEvento({id: id})

    if (!result) {
        return res.status(500).json(newResponse('NDT', 'Não foi possivel deletar este evento.'))
    }

    return res.status(201).json(newResponse('OK', 'O evento foi deletado com sucesso!'))
})
.get(async (req, res) => {
    const id = parseInt(req.params?.id);
    //return res.status(500).json(newResponse('TODO', 'NOT IMPLEMENTED.'))

    if (isNaN(id)) {
        return res.status(400).json(newResponse('COD', 'ID inválido.'))
    }

    // Verifica se este usuario tem permissão para deletar este evento
    const userId = await validateTokenGetId(req);
    const evento = await db.queryEvento({id: id});

    if (userId === undefined || userId === false) {
        return res.status(400).json(newResponse('TIV', 'Não foi possivel validar seu token.'))
    }
    
    if (eventoId === undefined || eventoId === false) {
        return res.status(400).json(newResponse('EIN', 'Não foi possivel encontrar este evento.'))
    }

    if (evento.idUsuario !== userId) {
        return res.status(400).json(newResponse('TIV', 'Você não está autorizado a fazer esta ação.'))
    } 

    const result = db.queryEvento({id: id})

    if (!result) {
        return res.status(500).json(newResponse('NDT', 'Não foi possivel deletar este evento.'))
    }

    const toSend = {
        "evento": {
            titulo: result.titulo,
            descricao: result.descricao,
            data: result.data,
            id: id
        }
    }

    return res.status(200).json(newResponse('OK', 'O evento foi encontrado!', JSON.stringify(toSend)))
})
.put(async (req, res) => {
    const { titulo, descricao, data } = req.body
    // data: "YYYY-MM-DD HH:MM:SS"

    const id = parseInt(req.params?.id);

    if (isNaN(id)) {
        return res.status(400).json(newResponse('COD', 'ID inválido.'))
    }

    // Verifica se este usuario tem permissão para deletar este evento
    const userId = await validateTokenGetId(req);
    const evento = await db.queryEvento({id: id});

    if (userId === undefined || userId === false) {
        return res.status(400).json(newResponse('TIV', 'Não foi possivel validar seu token.'))
    }
    
    if (!evento) {
        return res.status(400).json(newResponse('EIN', 'Não foi possivel encontrar este evento.'))
    }

    if (evento.idUsuario !== userId) {
        return res.status(400).json(newResponse('TIV', 'Você não está autorizado a fazer esta ação.'))
    } 

    if (!await db.getConnection()) {
        return res.status(500).json(newResponse('CBD', 'Sem conexão com o banco de dados'))
    }

    if (Object.keys(req.body).length != 3) {
        return res.status(400).json(newResponse('DTE', 'Dados incorretos'))
    }

    if (titulo === undefined || descricao === undefined || data === undefined) {
        return res.status(400).json(newResponse('DTE', 'Não omita nenhum dos dados, envie como nulo se for necessário.'))
    }

    // Cria modelo e envia para o BD
    console.log(data.slice(0, 19).replace('T', ' '))
    let new_evento;
    try {
        new_evento = new models.Evento(descricao, titulo, userId, data.slice(0, 19).replace('T', ' '), evento.id);
    } catch {
        return res.status(400).json(newResponse('DTE', 'Não foi possivel construir um modelo de evento a partir dos dados enviados.'))
    }

    let result = await db.updateEvento(new_evento);

    if (result === undefined) {
        return res.status(500).json(newResponse('CBD', 'Não foi possivel acessar o banco de dados.'))
    } else if (result === false) {
        return res.status(400).json(newResponse('ERR', 'Conflito com outros eventos.'))
    }

    return res.status(200).json(newResponse('OK', 'Seu agendamento foi alterado com sucesso!'))
})
module.exports = router

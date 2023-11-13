

const newMessage = (tipo, titulo, descricao) => {
    return {
        tipo: tipo,
        titulo: titulo,
        descricao: descricao
    }
}

const newResponse = (status, data, message) => {
    return {
        status: status, // "error" or "success"
        data: data, // object, can be null
        message: message
    }
}


module.exports = newMessage;
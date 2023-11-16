

const newMessage = (tipo, titulo, descricao) => {
    return {
        tipo: tipo,
        titulo: titulo,
        descricao: descricao
    }
}

const newResponse = (type, message, data=null) => {
    return {
        type: type,
        message: message,
        data: data // object, can be null
        
    }
}


module.exports = {newMessage, newResponse};
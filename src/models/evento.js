
class Evento {

    #descricao
    #titulo
    #idUsuario
    #data

    constructor(descricao, titulo, idUsuario, data) {
        this.#descricao = descricao
        this.#titulo = titulo
        this.#idUsuario = idUsuario
        this.#data = data
    }

    get descricao() {
        return this.#descricao
    }

    get titulo() {
        return this.#titulo
    }

    get idUsuario() {
        return this.#idUsuario
    }

    get data() {
        return this.#data
    }

}

module.exports = Evento;
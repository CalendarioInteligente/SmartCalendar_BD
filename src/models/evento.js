
class Evento {

    #descricao
    #titulo
    #idUsuario
    #data
    #id

    constructor(descricao, titulo, idUsuario, data, id=-1) {
        this.#descricao = descricao
        this.#titulo = titulo
        this.#idUsuario = idUsuario
        this.#data = data
        this.#id = id
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

    get id() {
        return this.#id
    }

}

module.exports = Evento;
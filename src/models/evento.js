
class Evento {

    #descricao
    #titulo
    #idUsuario
    #data
    #tipo 

    constructor(descricao, titulo, idUsuario, data, tipo) {
        this.#descricao = descricao
        this.#tipo = titulo
        this.#idUsuario = idUsuario
        this.#data = data
        this.#tipo = tipo 
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

    get tipo() {
        return this.#tipo
    }

}

module.exports = Evento;
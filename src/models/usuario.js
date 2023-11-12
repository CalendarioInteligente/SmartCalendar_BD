
/**id int IDENTITY(1, 1) NOT NULL,
	nome varchar(30) not null,
	sobrenome varchar(100) not null,
	email varchar(100) not null unique,
	telefone varchar(13),
	senha CHAR(60) not null,
	PRIMARY KEY(id) */

class Usuario {

    #id
    #nome
    #sobrenome
    #email
    #telefone
    #senha

    constructor(id, nome, sobrenome, email, telefone, senha) {
        this.#id = id;
        this.#nome = nome;
        this.#sobrenome = sobrenome;
        this.#email = email;
        this.#telefone = telefone;
        this.#senha = senha;
    }

    // SETTERS
    set id(x) {
        this.#id = x
    }

    set nome(x) {
        this.#nome = x
    }

    set sobrenome(x) {
        this.#sobrenome = x
    }

    set email(x) {
        this.#email = x
    }

    set telefone(x) {
        this.#telefone = x
    }

    set senha(x) {
        this.#senha = x
    }

    // GETTERS
    get id() {
        return this.#id
    }

    get nome() {
        return this.#nome
    }

    get sobrenome() {
        return this.#sobrenome
    }

    get email() {
        return this.#email
    }

    get telefone() {
        return this.#telefone
    }

    get senha() {
        return this.#senha
    }

}

class Evento {

    constructor() {

    }

}

module.exports = {Usuario, Evento}
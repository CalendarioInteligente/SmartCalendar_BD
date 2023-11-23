-- CREATE SCHEMA CALENDARIO;

CREATE TABLE CALENDARIO.Usuario
(
	id int IDENTITY(1, 1) NOT NULL,
	nome varchar(30) not null,
	sobrenome varchar(100) not null,
	email varchar(100) not null unique,
	telefone varchar(13),
	senha CHAR(60) not null,
	PRIMARY KEY(id)
)

-- Utilizado para com que os numeros de telefones de varios usuarios possam ser nulos e ao mesmo tempo unicos (quando se tem valor)
CREATE UNIQUE INDEX IDX_TELEFONE_NOTNULL
ON CALENDARIO.Usuario(telefone) WHERE telefone IS NOT NULL;

CREATE TABLE CALENDARIO.Evento
(
	id int IDENTITY(1, 1) NOT NULL,
	descricao varchar(200) not null,
	titulo varchar(40) not null,
	idUsuario int not null,
	data datetime not null,
	foreign key(idUsuario) references CALENDARIO.Usuario(id),
	PRIMARY KEY(id)
)

CREATE TABLE CALENDARIO.FormaNotificacao
(
	id int not null,
	nome varchar(10) not null,
	primary key(id)
)

INSERT INTO CALENDARIO.FormaNotificacao
	(id, nome)
VALUES
	(1, 'email'),
	(2, 'whatsapp');

CREATE TABLE CALENDARIO.Notificacao
(
	idEvento int NOT NULL,
	idFormaNotificacao int not null,
	foreign key(idEvento) references CALENDARIO.Evento(id),
	foreign key(idFormaNotificacao) references CALENDARIO.FormaNotificacao(id)
)

CREATE TABLE CALENDARIO.Session
(
	sessionId binary(16) not null primary key,
	lastTouchedUtc datetime not null DEFAULT GETDATE(),
	userId int not null,
	foreign key(userId) references CALENDARIO.Usuario(id)
)

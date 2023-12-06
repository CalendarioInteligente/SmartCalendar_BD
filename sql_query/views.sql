-- VIEW EVENTO
CREATE OR ALTER VIEW CALENDARIO.ViewEventos AS
SELECT
	U.id,
	U.nome,
	U.sobrenome,
	E.titulo,
	E.descricao, 
	E.data
FROM
	CALENDARIO.Usuario U
	JOIN CALENDARIO.Evento E ON U.id = E.idUsuario

--------------------------------------------------------------------------------------------------

-- VIEW EVENTOS EXPIRADOS

CREATE OR ALTER VIEW CALENDARIO.ViewEventosExpirados AS
SELECT
	U.nome as 'Nome do Usuário',
	U.sobrenome as 'Sobrenome do Usuário',
	E.titulo as 'Título do evento',
	E.descricao as 'Descrição do evento', 
	E.data as 'Data do evento expirado'
FROM
	CALENDARIO.Usuario U
	JOIN CALENDARIO.Evento E ON U.id = E.idUsuario
WHERE
	E.data < GETDATE()

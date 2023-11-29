-- VIEW EVENTO
create or alter view CALENDARIO.ViewEventos as 
select 
	U.nome,
	U.sobrenome,
	E.titulo,
	E.descricao, 
	E.data
from
	CALENDARIO.Usuario U
	JOIN CALENDARIO.Evento E on U.id = E.idUsuario


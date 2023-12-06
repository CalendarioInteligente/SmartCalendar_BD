
-- Procedure de adicionar usuario
-- Procedure de adicionar eventos
CREATE PROCEDURE CALENDARIO.Notify
    @idEvento int
AS
BEGIN
    DECLARE @dataAtual datetime,
    @dataEvento datetime,
    @notified bit;
    SELECT @dataAtual = GETDATE();

    SELECT @dataEvento = data
    FROM CALENDARIO.Evento
    WHERE id = @idEvento;

    SELECT @notified = notified
    from CALENDARIO.Evento
    WHERE id = @idEvento;

    IF @dataAtual >= @dataEvento
    BEGIN
        IF (@notified = 0)
        BEGIN
            UPDATE CALENDARIO.Evento
            SET notified = 1;
        END
        ELSE
        BEGIN
            RAISERROR('Não é possivel notificar um evento que já foi notificado', 16, 1)
            RETURN;
        END
    END
    ELSE
    BEGIN
        RAISERROR('Não é possivel notificar um evento que ainda não passou da data marcada', 16, 1)
        RETURN;
    END
END

--------------------------------------------------------------------------------------------------------------------------------------------

-- Procedure de adicionar evento para todos os usuários
CREATE PROCEDURE Calendario.aplicarEventoGlobalmente
@descricao VARCHAR(200),
@titulo VARCHAR(40),
@data DATETIME
AS
BEGIN
	DECLARE cur_idDoUsuario CURSOR
		FOR SELECT id FROM CALENDARIO.Usuario;

	DECLARE @id INT;

	OPEN cur_idDoUsuario;

	FETCH NEXT FROM cur_idDoUsuario
		INTO @id;

	WHILE @@FETCH_STATUS = 0
	BEGIN

		INSERT INTO CALENDARIO.Evento VALUES(@descricao, @titulo, @id, default, default, @data);

		FETCH NEXT FROM cur_idDoUsuario
		INTO @id;
	END

	CLOSE cur_idDoUsuario
	DEALLOCATE cur_idDoUsuario
END

--------------------------------------------------------------------------------------------------------------------------------------------

-- Procedure para deletar usuário
CREATE PROCEDURE Calendario.DeletarUsuario
@id INT
AS
BEGIN

	DELETE FROM 
		CALENDARIO.Evento
	WHERE	
		idUsuario = @id;

	DELETE FROM	
		CALENDARIO.Usuario
	WHERE
		id = @id;
END




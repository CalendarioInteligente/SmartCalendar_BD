
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

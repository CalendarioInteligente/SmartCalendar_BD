
CREATE TRIGGER CALENDARIO.trEventoCheck
	ON CALENDARIO.Evento
	for INSERT, UPDATE
AS
BEGIN
	DECLARE @dataMarcada datetime,
			@dataAtual datetime,
			@idEvento int

	SELECT @dataMarcada = GETDATE(),
		@dataAtual = data,
		@idEvento = id
	from inserted

	BEGIN
		if @dataMarcada < @dataAtual
		begin
			Delete from CALENDARIO.Evento where id = @idEvento
			RAISERROR('Data invalida.', 15, 2);
		end
	END
END

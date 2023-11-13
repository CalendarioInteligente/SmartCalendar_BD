# Restful API do SmartCalendar

Para inicializar o servidor é importante que primeiro você execute o template.bat para iniciar as variáveis de ambiente,
em seguida na pasta 'src/' execute o comando "node index.js"

## Como usar a API (Com exemplos)

### Usuario

Os valores `telefone`, `nome` e `sobrenome` são opcionais e podem ser nulos
Mas caso você não passe um nome o nome padrão usado será "User"

`POST "url/usuarios"`

```json
{
  "email": "email@teste.com",
  "senha": "password",
  "telefone:": "19000000000",
  "nome": "João",
  "sobrenome": "da Silva"
}
```

RESPONSE

```json
{
  "status": "success",
  "message": "Logado com sucesso!",
  "data": {
    "session": "session-token",
    "userId": 1
  }
}
```

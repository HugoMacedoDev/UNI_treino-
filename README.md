# UNI Treino

Aplicação fullstack para gerenciamento de treinos, com front-end em React e back-end em Node.js / Express.

## Estrutura do projeto

* `client/` - front-end em Vite + React
* `server/` - API Node.js com rotas de conta e chat

## Como executar

1. No terminal do back-end:
   ```powershell
   cd server
   npm install
   npm start
   ```

2. No terminal do front-end:
   ```powershell
   cd client
   npm install
   npm run dev
   ```

## Principais funcionalidades

* Cadastro, login e recuperação de senha
* Validação de campos e envio de e-mail de redefinição
* Chat e gerenciamento de treinos

## Tecnologias

* Front-end: React, Vite
* Back-end: Node.js, Express
* Autenticação: JWT
* Banco de dados: (configuração em `server/config/database.js`)

## Observações

O projeto está configurado em uma estrutura separada entre cliente e servidor para facilitar o desenvolvimento e a implantação.

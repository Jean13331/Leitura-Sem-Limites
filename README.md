# Leitura-Sem-Limites

# Sistema de Gerenciamento Escolar

## Descrição
Este projeto é um Sistema de Gerenciamento Escolar desenvolvido com React no frontend e Node.js com Express no backend. O sistema permite o gerenciamento de professores, alunos, turmas, disciplinas e salas de aula.

## Funcionalidades
- Cadastro e autenticação de professores e alunos
- Gerenciamento de turmas
- Cadastro e edição de salas de aula
- Cadastro e gerenciamento de disciplinas
- Edição de perfil de usuário
- Visualização de turmas e alunos matriculados

## Tecnologias Utilizadas
- Frontend: React, Material-UI
- Backend: Node.js, Express
- Banco de Dados: MySQL
- Outras bibliotecas: Axios, react-router-dom

## Pré-requisitos
- Node.js
- MySQL

## Instalação

1. Clone o repositório:
   ```
   git clone https://git@github.com:Jean13331/Leitura-Sem-Limites.git
   ```

2. Instale as dependências do frontend:
   ```
   cd trabalho/src
   npm install
   ```

3. Instale as dependências do backend:
   ```
   cd backend
   npm install
   ```

4. Configure o banco de dados MySQL:
   - Crie um banco de dados
   - Atualize as credenciais de conexão no arquivo `backend/db.js`

5. Inicie o servidor backend:
   ```
   cd backend
   node index.js
   ```

6. Inicie o aplicativo React:
   ```
   cd trabalho/src
   npm start
   ```

## Uso
Após iniciar o servidor e o aplicativo React, acesse `http://localhost:3000` no seu navegador. Você poderá se registrar como professor ou aluno e utilizar as funcionalidades do sistema.

## Estrutura do Projeto
- `trabalho/src/`: Contém os componentes React e arquivos do frontend
- `backend/`: Contém os arquivos do servidor Node.js e Express
- `backend/index.js`: Arquivo principal do servidor com as rotas da API
- `backend/db.js`: Configuração da conexão com o banco de dados MySQL





Link do Projeto: [https://github.com/Jean13331/Leitura-Sem-Limites]

# Leitura Sem Limites

## Sistema de Gerenciamento Escolar

### Descrição
O Leitura Sem Limites é um Sistema de Gerenciamento Escolar desenvolvido com React no frontend e Node.js com Express no backend. O sistema permite o gerenciamento eficiente de professores, alunos, turmas, disciplinas e salas de aula.

### Funcionalidades Principais
- Cadastro e autenticação de professores e alunos
- Gerenciamento completo de turmas
- Cadastro e edição de salas de aula
- Cadastro e gerenciamento de disciplinas
- Edição de perfil de usuário
- Visualização detalhada de turmas e alunos matriculados

### Tecnologias Utilizadas
- **Frontend:** React, Material-UI
- **Backend:** Node.js, Express
- **Banco de Dados:** MySQL
- **Bibliotecas Adicionais:** Axios, react-router-dom

### Pré-requisitos
- Node.js (versão recomendada: 14.x ou superior)
- MySQL (versão recomendada: 8.x)

### Instalação e Configuração

1. Clone o repositório:
   ```
   git clone https://github.com/Jean13331/Leitura-Sem-Limites.git
   cd Leitura-Sem-Limites
   ```

2. Instale as dependências do frontend:
   ```
   cd trabalho/src
   npm install
   ```

3. Instale as dependências do backend:
   ```
   cd ../../backend
   npm install
   ```

4. Configure o banco de dados MySQL:
   - Crie um novo banco de dados
   - Atualize as credenciais de conexão no arquivo `backend/db.js`

5. Inicie o servidor backend:
   ```
   node index.js
   ```

6. Em um novo terminal, inicie o aplicativo React:
   ```
   cd ../trabalho/src
   npm start
   ```

### Como Usar
Após iniciar o servidor e o aplicativo React, acesse `http://localhost:3000` no seu navegador. Você poderá se registrar como professor ou aluno e começar a utilizar as funcionalidades do sistema.

### Estrutura do Projeto
- `trabalho/src/`: Componentes React e arquivos do frontend
- `backend/`: Arquivos do servidor Node.js e Express
  - `index.js`: Arquivo principal do servidor com as rotas da API
  - `db.js`: Configuração da conexão com o banco de dados MySQL

### Contribuição
Contribuições são bem-vindas! Por favor, leia o arquivo CONTRIBUTING.md para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

### Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE.md para detalhes.

### Contato
Jean - [jeanortegajunior@gmail.com]

Link do Projeto: [https://github.com/Jean13331/Leitura-Sem-Limites](https://github.com/Jean13331/Leitura-Sem-Limites)

---

**Nota:** Os comandos SQL para criar o banco de dados foram omitidos nesta versão do README para manter o foco nas informações essenciais do projeto. Considere mover esses comandos para um arquivo separado, como `database_setup.sql`, e mencioná-lo na seção de instalação.

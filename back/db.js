const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',      // ou o IP do servidor de banco de dados
  user: 'root',           // seu usuário MySQL
  password: '1234',  // sua senha MySQL
  database: 'leitura' // nome do banco de dados
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL: ', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});

module.exports = connection;

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'leitura',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const connection = await pool.getConnection(); // Obtém uma conexão do pool
    console.log('Conectado ao MySQL!');
    connection.release(); // Libera a conexão de volta ao pool
  } catch (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  }
}

testConnection();

module.exports = pool; // Exporta o pool

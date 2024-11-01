const express = require('express');
const router = express.Router();
const db = require('./db'); // Certifique-se de que o caminho esteja correto

// Rota para registrar usuário
router.post('/register', (req, res) => {
  const { role, nome, dataNascimento, email, telefone, senha, disciplina } = req.body;

  let sql;
  if (role === 'aluno') {
    sql = 'INSERT INTO alunos (Nome, Data_Nascimento, Email, Telefone, Senha) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nome, dataNascimento, email, telefone, senha], (err, result) => {
      if (err) {
        console.error('Erro ao registrar aluno:', err);
        return res.status(500).send('Erro ao registrar aluno.');
      }
      res.status(201).send('Aluno registrado com sucesso!');
    });
  } else if (role === 'professor') {
    sql = 'INSERT INTO professores (Nome, Email, Telefone, Senha, Disciplina) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nome, email, telefone, senha, disciplina], (err, result) => {
      if (err) {
        console.error('Erro ao registrar professor:', err);
        return res.status(500).send('Erro ao registrar professor.');
      }
      res.status(201).send('Professor registrado com sucesso!');
    });
  }
});

module.exports = router;

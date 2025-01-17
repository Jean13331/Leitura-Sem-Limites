const express = require('express');
const router = express.Router();
const db = require('./db'); // Certifique-se de que o caminho esteja correto
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conexão com o MongoDB (para logs)
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB com sucesso!"))
  .catch((err) => console.log("Erro de conexão:", err));

// Definir o schema de logs para MongoDB
const logSchema = new mongoose.Schema({
  action: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

// Função para registrar logs no MongoDB
const logToMongoDB = (action, message) => {
  const newLog = new Log({
    action,
    message
  });

  newLog.save()
    .then(() => console.log('Log registrado no MongoDB'))
    .catch((err) => console.error('Erro ao registrar log no MongoDB:', err));
};

// Rota para registrar usuário
router.post('/register', (req, res) => {
  const { role, nome, dataNascimento, email, telefone, senha, disciplina } = req.body;

  // Verificar se o email já está registrado (no MySQL)
  let sql;
  if (role === 'aluno') {
    sql = 'INSERT INTO alunos (Nome, Data_Nascimento, Email, Telefone, Senha) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nome, dataNascimento, email, telefone, senha], (err, result) => {
      if (err) {
        console.error('Erro ao registrar aluno no MySQL:', err);
        logToMongoDB('Erro ao registrar aluno', err.message); // Registrar erro no MongoDB
        return res.status(500).send('Erro ao registrar aluno no MySQL.');
      }
      res.status(201).send('Aluno registrado com sucesso!');
      logToMongoDB('Registro de aluno', `Aluno ${nome} registrado com sucesso`); // Log de sucesso
    });
  } else if (role === 'professor') {
    sql = 'INSERT INTO professores (Nome, Email, Telefone, Senha, Disciplina) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nome, email, telefone, senha, disciplina], (err, result) => {
      if (err) {
        console.error('Erro ao registrar professor no MySQL:', err);
        logToMongoDB('Erro ao registrar professor', err.message); // Registrar erro no MongoDB
        return res.status(500).send('Erro ao registrar professor no MySQL.');
      }
      res.status(201).send('Professor registrado com sucesso!');
      logToMongoDB('Registro de professor', `Professor ${nome} registrado com sucesso`); // Log de sucesso
    });
  }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Importar a conexão do db.js
const db = require('./db');

// Habilitar CORS e JSON
app.use(cors());
app.use(express.json());

// Endpoint para obter todas as turmas
app.get('/turmas', (req, res) => {
  const query = `
      SELECT 
          t.idTurma, t.Nome AS nomeTurma, 
          p.Nome AS nomeProfessor, 
          d.Nome AS nomeDisciplina, 
          s.Nome AS nomeSala,
          GROUP_CONCAT(CONCAT(a.idAluno, ':', a.Nome) SEPARATOR ', ') AS alunos
      FROM turma t
      JOIN professor p ON t.Professor_idProfessor = p.idProfessor
      JOIN disciplina d ON t.Disciplina_idDisciplina = d.idDisciplina
      JOIN sala s ON t.Sala_idSala = s.idSala
      LEFT JOIN turma_aluno ta ON t.idTurma = ta.turma_id
      LEFT JOIN aluno a ON ta.aluno_id = a.idAluno
      GROUP BY t.idTurma
  `;
  db.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao buscar turmas:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar turmas.' });
    }
    return res.status(200).json(results);
  });
});

// Endpoint de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  let query = 'SELECT * FROM aluno WHERE Email = ? AND Senha = ?';
  db.query(query, [email, password], (error, results) => {
    if (error) {
      console.error('Erro no servidor:', error);
      return res.status(500).json({ success: false, message: 'Erro no servidor' });
    }

    if (results.length > 0) {
      return res.status(200).json({ success: true, role: 'aluno' });
    } else {
      query = 'SELECT * FROM professor WHERE Email = ? AND Senha = ?';
      db.query(query, [email, password], (error, results) => {
        if (error) {
          console.error('Erro no servidor:', error);
          return res.status(500).json({ success: false, message: 'Erro no servidor' });
        }

        if (results.length > 0) {
          return res.status(200).json({
            success: true,
            role: 'professor',
            idProfessor: results[0].idProfessor
          });
        } else {
          return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }
      });
    }
  });
});

// Conectar ao banco de dados e verificar erros
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados!');

  // Iniciar o servidor após a conexão bem-sucedida
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
});

// Endpoint para obter todos os professores
app.get('/professores', (req, res) => {
  const query = 'SELECT * FROM professor';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao buscar professores:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar professores.' });
    }
    return res.status(200).json(results);
  });
});

// Endpoint para obter todas as disciplinas
app.get('/disciplinas', (req, res) => {
  const query = 'SELECT * FROM disciplina';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao buscar disciplinas:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar disciplinas.' });
    }
    return res.status(200).json(results);
  });
});

// Endpoint para obter todas as salas
app.get('/salas', (req, res) => {
  const query = 'SELECT * FROM sala';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao buscar salas:', error);
      return res.status(500).json ({ success: false, message: 'Erro ao buscar salas.' });
    }
    return res.status(200).json(results);
  });
});

// Endpoint para obter todos os alunos
app.get('/alunos', (req, res) => {
  const query = 'SELECT * FROM aluno';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao buscar alunos:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar alunos.' });
    }
    return res.status(200).json(results);
  });
});

// Endpoint para registrar usuários
app.post('/register', (req, res) => {
  const { nome, dataNascimento, email, telefone, senha, disciplina } = req.body;
  const role = req.query.role;

  console.log('Dados recebidos:', { nome, dataNascimento, email, telefone, senha, disciplina, role });

  // Verificar se o e-mail já está cadastrado
  const checkEmailQuery = 'SELECT Email FROM aluno WHERE Email = ? UNION SELECT Email FROM professor WHERE Email = ?';
  db.query(checkEmailQuery, [email, email], (error, results) => {
    if (error) {
      console.error('Erro ao verificar e-mail:', error);
      return res.status(500).json({ success: false, message: 'Erro ao verificar e-mail.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: 'E-mail já cadastrado.' });
    }

    let query;
    let values;

    if (role === 'aluno') {
      query = 'INSERT INTO aluno (Nome, Data_Nascimento, Email, Senha, Telefone) VALUES (?, ?, ?, ?, ?)';
      values = [nome, dataNascimento, email, senha, telefone || '']; // Use uma string vazia se telefone for null ou undefined
    } 
    else if (role === 'professor') {
      if (!telefone) {
        return res.status(400).json({ success: false, message: 'Telefone é obrigatório para professores.' });
      }
      query = 'INSERT INTO professor (Nome, Email, Telefone, Senha) VALUES (?, ?, ?, ?)';
      values = [nome, email, telefone, senha];
    } 
    else {
      return res.status(400).json({ success: false, message: 'Função não reconhecida.' });
    }

    console.log('Query de inserção:', query, 'Valores:', values);

    db.query(query, values, (error, results) => {
      if (error) {
        console.error(`Erro ao registrar ${role}:`, error);
        return res.status(500).json({ success: false, message: `Erro ao registrar ${role}.` });
      }

      if (role === 'professor') {
        const professorId = results.insertId;

        if (!disciplina) {
          return res.status(400).json({ success: false, message: 'Disciplina é obrigatória para o professor.' });
        }

        const disciplinaQuery = 'INSERT INTO disciplina (Nome, Professor_id) VALUES (?, ?)';
        db.query(disciplinaQuery, [disciplina, professorId], (error) => {
          if (error) {
            console.error('Erro ao registrar disciplina:', error);
            return res.status(500).json({ success: false, message: 'Erro ao registrar disciplina.' });
          }

          return res.status(201).json({ success: true, message: 'Professor registrado com sucesso.' });
        });
      } else {
        return res.status(201).json({ success: true, message: 'Aluno registrado com sucesso' });
      }
    });
  });
});

// Endpoint para verificar se o e-mail já está cadastrado
app.post('/check-email', (req, res) => {
  const { email } = req.body;

  const checkEmailQuery = 'SELECT * FROM aluno WHERE Email = ? UNION SELECT * FROM professor WHERE Email = ?';
  db.query(checkEmailQuery, [email, email], (error, results) => {
    if (error) {
      console.error('Erro ao verificar e-mail:', error);
      return res.status(500).json({ success: false, message: 'Erro ao verificar e-mail.' });
    }

    return res.json({ exists: results.length > 0 });
  });
});

// Endpoint para cadastrar turma
app.post('/cadastrar-turma', (req, res) => {
  const { Nome, Ano, Semestre, Professor_idProfessor, Disciplina_idDisciplina, Sala_idSala, turma_aluno_id } = req.body;

  console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));

  // Validação mais rigorosa
  const numericFields = { Ano, Professor_idProfessor, Disciplina_idDisciplina, Sala_idSala };
  const invalidFields = Object.entries(numericFields).filter(([key, value]) => {
    const parsedValue = parseInt(value);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      console.log(`Campo inválido: ${key}, valor: ${value}`);
      return true;
    }
    return false;
  });

  if (invalidFields.length > 0) {
    const invalidFieldNames = invalidFields.map(([key]) => key).join(', ');
    console.log(`Campos inválidos: ${invalidFieldNames}`);
    return res.status(400).json({ 
      success: false, 
      message: `Valores numéricos inválidos para os campos: ${invalidFieldNames}` 
    });
  }

  // Validação do Semestre
  if (typeof Semestre !== 'string' || Semestre.trim() === '') {
    console.log('Semestre inválido:', Semestre);
    return res.status(400).json({ success: false, message: 'Semestre inválido' });
  }

  // Validação do Nome
  if (typeof Nome !== 'string' || Nome.trim() === '') {
    console.log('Nome inválido:', Nome);
    return res.status(400).json({ success: false, message: 'Nome da turma inválido' });
  }

  // Validação do turma_aluno_id
  if (!Array.isArray(turma_aluno_id)) {
    console.log('turma_aluno_id não é um array:', turma_aluno_id);
    return res.status(400).json({ success: false, message: 'turma_aluno_id deve ser um array' });
  }

  // Se chegou até aqui, todos os dados são válidos
  console.log('Todos os dados válidos, prosseguindo com a inserção no banco de dados');

  // Iniciar transação
  db.beginTransaction((err) => {
    if (err) {
      console.error('Erro ao iniciar transação:', err);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }

    // Inserir a turma
    const query = 'INSERT INTO turma (Nome, Ano, Semestre, Professor_idProfessor, Disciplina_idDisciplina, Sala_idSala) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [Nome, Ano, Semestre, Professor_idProfessor, Disciplina_idDisciplina, Sala_idSala], (error, result) => {
      if (error) {
        db.rollback(() => {
          console.error('Erro ao cadastrar turma:', error);
          res.status(500).json({ success: false, message: 'Erro ao cadastrar turma: ' + error.message });
        });
        return;
      }

      const turmaId = result.insertId;

      // Se houver alunos, inserir na tabela turma_aluno
      if (turma_aluno_id && turma_aluno_id.length > 0) {
        const insertTurmaAlunoQuery = 'INSERT INTO turma_aluno (turma_id, aluno_id) VALUES ?';
        const values = turma_aluno_id.map(alunoId => [turmaId, alunoId]);

        db.query(insertTurmaAlunoQuery, [values], (error) => {
          if (error) {
            db.rollback(() => {
              console.error('Erro ao inserir alunos na turma:', error);
              res.status(500).json({ success: false, message: 'Erro ao inserir alunos na turma: ' + error.message });
            });
            return;
          }

          // Commit da transação
          db.commit((err) => {
            if (err) {
              db.rollback(() => {
                console.error('Erro ao finalizar transação:', err);
                res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
              });
              return;
            }
            res.status(201).json({ success: true, message: 'Turma e alunos cadastrados com sucesso!', turmaId });
          });
        });
      } else {
        // Commit da transação (caso não haja alunos para cadastrar)
        db.commit((err) => {
          if (err) {
            db.rollback(() => {
              console.error('Erro ao finalizar transação:', err);
              res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
            });
            return;
          }
          res.status(201).json({ success: true, message: 'Turma cadastrada com sucesso!', turmaId });
        });
      }
    });
  });
});

// Rota para buscar disciplinas de um professor específico
app.get('/disciplinas-professor/:idProfessor', (req, res) => {
  const { idProfessor } = req.params;
  const query = `
    SELECT * 
    FROM disciplina
    WHERE professor_id = ?
  `;
  
  db.query(query, [idProfessor], (error, results) => {
    if (error) {
      console.error('Erro ao buscar disciplinas do professor:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar disciplinas do professor.' });
    }
    return res.status(200).json(results);
  });
});

// Endpoint para editar sala
app.put('/editar-sala/:nomeSala', (req, res) => {
  const { nomeSala } = req.params;
  const { capacidade, localizacao } = req.body;

  const query = 'UPDATE sala SET Capacidade = ?, Localizacao = ? WHERE Nome = ?';
  db.query(query, [capacidade, localizacao, nomeSala], (error, results) => {
    if (error) {
      console.error('Erro ao editar sala:', error);
      return res.status(500).json({ success: false, message: 'Erro ao editar sala.' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Sala não encontrada.' });
    }
    return res.status(200).json({ success: true, message: 'Sala editada com sucesso.' });
  });
});

// Endpoint para excluir sala
app.delete('/excluir-sala/:nomeSala', (req, res) => {
  const { nomeSala } = req.params;

  // Primeiro, verificamos se a sala está sendo usada por alguma turma
  const checkTurmaQuery = 'SELECT COUNT(*) as count FROM turma WHERE Sala_idSala = (SELECT idSala FROM sala WHERE Nome = ?)';
  db.query(checkTurmaQuery, [nomeSala], (error, results) => {
    if (error) {
      console.error('Erro ao verificar uso da sala:', error);
      return res.status(500).json({ success: false, message: 'Erro ao verificar uso da sala.' });
    }

    if (results[0].count > 0) {
      return res.status(400).json({ success: false, message: 'Não é possível excluir a sala, pois ela está sendo usada por uma ou mais turmas.' });
    }

    // Se a sala não estiver sendo usada, podemos excluí-la
    const deleteQuery = 'DELETE FROM sala WHERE Nome = ?';
    db.query(deleteQuery, [nomeSala], (error, results) => {
      if (error) {
        console.error('Erro ao excluir sala:', error);
        return res.status(500).json({ success: false, message: 'Erro ao excluir sala.' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Sala não encontrada.' });
      }
      return res.status(200).json({ success: true, message: 'Sala excluída com sucesso.' });
    });
  });
});

// Endpoint para editar turma
app.put('/editar-turma/:idTurma', (req, res) => {
  const { idTurma } = req.params;
  const { Nome, Ano, Semestre, Professor_idProfessor, Disciplina_idDisciplina, Sala_idSala, turma_aluno_id } = req.body;

  db.beginTransaction((err) => {
    if (err) {
      console.error('Erro ao iniciar transação:', err);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }

    // Primeiro, buscar os dados atuais da turma
    const selectTurmaQuery = 'SELECT * FROM turma WHERE idTurma = ?';
    db.query(selectTurmaQuery, [idTurma], (error, results) => {
      if (error) {
        db.rollback(() => {
          console.error('Erro ao buscar dados da turma:', error);
          res.status(500).json({ success: false, message: 'Erro ao atualizar turma: ' + error.message });
        });
        return;
      }

      if (results.length === 0) {
        db.rollback(() => {
          res.status(404).json({ success: false, message: 'Turma não encontrada.' });
        });
        return;
      }

      const turmaAtual = results[0];

      // Preparar os dados para atualização, usando os valores existentes se não fornecidos
      const dadosAtualizados = {
        Nome: Nome !== undefined ? Nome : turmaAtual.Nome,
        Ano: Ano !== undefined ? Ano : turmaAtual.Ano,
        Semestre: Semestre !== undefined ? Semestre : turmaAtual.Semestre,
        Professor_idProfessor: Professor_idProfessor !== undefined ? Professor_idProfessor : turmaAtual.Professor_idProfessor,
        Disciplina_idDisciplina: Disciplina_idDisciplina !== undefined ? Disciplina_idDisciplina : turmaAtual.Disciplina_idDisciplina,
        Sala_idSala: Sala_idSala !== undefined ? Sala_idSala : turmaAtual.Sala_idSala
      };

      // Atualizar a turma
      const updateTurmaQuery = 'UPDATE turma SET Nome = ?, Ano = ?, Semestre = ?, Professor_idProfessor = ?, Disciplina_idDisciplina = ?, Sala_idSala = ? WHERE idTurma = ?';
      db.query(updateTurmaQuery, [dadosAtualizados.Nome, dadosAtualizados.Ano, dadosAtualizados.Semestre, dadosAtualizados.Professor_idProfessor, dadosAtualizados.Disciplina_idDisciplina, dadosAtualizados.Sala_idSala, idTurma], (error) => {
        if (error) {
          db.rollback(() => {
            console.error('Erro ao atualizar turma:', error);
            res.status(500).json({ success: false, message: 'Erro ao atualizar turma: ' + error.message });
          });
          return;
        }

        // Atualizar alunos da turma
        const deleteTurmaAlunoQuery = 'DELETE FROM turma_aluno WHERE turma_id = ?';
        db.query(deleteTurmaAlunoQuery, [idTurma], (error) => {
          if (error) {
            db.rollback(() => {
              console.error('Erro ao remover alunos antigos da turma:', error);
              res.status(500).json({ success: false, message: 'Erro ao atualizar alunos da turma: ' + error.message });
            });
            return;
          }

          // Inserir apenas os alunos ativos
          if (turma_aluno_id && turma_aluno_id.length > 0) {
            const insertTurmaAlunoQuery = 'INSERT INTO turma_aluno (turma_id, aluno_id) VALUES ?';
            const values = turma_aluno_id.map(alunoId => [idTurma, alunoId]);

            db.query(insertTurmaAlunoQuery, [values], (error) => {
              if (error) {
                db.rollback(() => {
                  console.error('Erro ao inserir novos alunos na turma:', error);
                  res.status(500).json({ success: false, message: 'Erro ao atualizar alunos da turma: ' + error.message });
                });
                return;
              }
              finalizarTransacao();
            });
          } else {
            finalizarTransacao();
          }
        });
      });
    });
  });

  function finalizarTransacao() {
    db.commit((err) => {
      if (err) {
        db.rollback(() => {
          console.error('Erro ao finalizar transação:', err);
          res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        });
        return;
      }
      res.status(200).json({ success: true, message: 'Turma atualizada com sucesso!' });
    });
  }
});

// Endpoint para excluir turma
app.delete('/excluir-turma/:idTurma', (req, res) => {
  const { idTurma } = req.params;

  db.beginTransaction((err) => {
    if (err) {
      console.error('Erro ao iniciar transação:', err);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }

    // Primeiro, excluir os registros da tabela turma_aluno
    const deleteTurmaAlunoQuery = 'DELETE FROM turma_aluno WHERE turma_id = ?';
    db.query(deleteTurmaAlunoQuery, [idTurma], (error) => {
      if (error) {
        db.rollback(() => {
          console.error('Erro ao excluir registros de turma_aluno:', error);
          res.status(500).json({ success: false, message: 'Erro ao excluir turma: ' + error.message });
        });
        return;
      }

      // Agora, excluir a turma
      const deleteTurmaQuery = 'DELETE FROM turma WHERE idTurma = ?';
      db.query(deleteTurmaQuery, [idTurma], (error, results) => {
        if (error) {
          db.rollback(() => {
            console.error('Erro ao excluir turma:', error);
            res.status(500).json({ success: false, message: 'Erro ao excluir turma: ' + error.message });
          });
          return;
        }

        if (results.affectedRows === 0) {
          db.rollback(() => {
            res.status(404).json({ success: false, message: 'Turma não encontrada.' });
          });
          return;
        }

        db.commit((err) => {
          if (err) {
            db.rollback(() => {
              console.error('Erro ao finalizar transação:', err);
              res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
            });
            return;
          }
          res.status(200).json({ success: true, message: 'Turma excluída com sucesso.' });
        });
      });
    });
  });
});

// Endpoint para buscar disciplinas do professor pelo email
app.get('/disciplinas-professor', (req, res) => {
  const professorEmail = req.query.email;

  if (!professorEmail) {
    return res.status(400).json({ success: false, message: 'Email do professor não fornecido.' });
  }

  console.log('Buscando disciplinas para o professor:', professorEmail);

  const query = `
    SELECT d.idDisciplina, d.Nome
    FROM disciplina d
    JOIN professor p ON d.professor_id = p.idProfessor
    WHERE p.Email = ?
  `;
  
  db.query(query, [professorEmail], (error, results) => {
    if (error) {
      console.error('Erro ao buscar disciplinas do professor:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar disciplinas do professor.' });
    }
    console.log('Disciplinas encontradas:', results);
    return res.status(200).json(results);
  });
});

// Endpoint para adicionar uma nova disciplina
app.post('/disciplinas', (req, res) => {
  const { Nome, professorEmail } = req.body;

  // Primeiro, obtenha o ID do professor
  const getProfessorIdQuery = 'SELECT idProfessor FROM professor WHERE Email = ?';
  db.query(getProfessorIdQuery, [professorEmail], (error, results) => {
    if (error) {
      console.error('Erro ao buscar ID do professor:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar ID do professor.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Professor não encontrado.' });
    }

    const professorId = results[0].idProfessor;

    // Agora, insira a nova disciplina
    const insertDisciplinaQuery = 'INSERT INTO disciplina (Nome, professor_id) VALUES (?, ?)';
    db.query(insertDisciplinaQuery, [Nome, professorId], (error, result) => {
      if (error) {
        console.error('Erro ao adicionar disciplina:', error);
        return res.status(500).json({ success: false, message: 'Erro ao adicionar disciplina.' });
      }
      return res.status(201).json({ success: true, message: 'Disciplina adicionada com sucesso.', idDisciplina: result.insertId });
    });
  });
});

// Endpoint para excluir uma disciplina
app.delete('/disciplinas/:idDisciplina', (req, res) => {
  const { idDisciplina } = req.params;

  // Primeiro, verifique se a disciplina está sendo usada por alguma turma
  const checkTurmaQuery = 'SELECT COUNT(*) as count FROM turma WHERE Disciplina_idDisciplina = ?';
  db.query(checkTurmaQuery, [idDisciplina], (error, results) => {
    if (error) {
      console.error('Erro ao verificar uso da disciplina:', error);
      return res.status(500).json({ success: false, message: 'Erro ao verificar uso da disciplina.' });
    }

    if (results[0].count > 0) {
      return res.status(400).json({ success: false, message: 'Não é possível excluir a disciplina, pois ela está sendo usada por uma ou mais turmas.' });
    }

    // Se a disciplina não estiver sendo usada, podemos excluí-la
    const deleteQuery = 'DELETE FROM disciplina WHERE idDisciplina = ?';
    db.query(deleteQuery, [idDisciplina], (error, results) => {
      if (error) {
        console.error('Erro ao excluir disciplina:', error);
        return res.status(500).json({ success: false, message: 'Erro ao excluir disciplina.' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Disciplina não encontrada.' });
      }
      return res.status(200).json({ success: true, message: 'Disciplina excluída com sucesso.' });
    });
  });
});

// Endpoint para atualizar uma disciplina
app.put('/disciplinas/:idDisciplina', (req, res) => {
  const { idDisciplina } = req.params;
  const { Nome } = req.body;

  const query = 'UPDATE disciplina SET Nome = ? WHERE idDisciplina = ?';
  db.query(query, [Nome, idDisciplina], (error, results) => {
    if (error) {
      console.error('Erro ao atualizar disciplina:', error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar disciplina.' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Disciplina não encontrada.' });
    }
    return res.status(200).json({ success: true, message: 'Disciplina atualizada com sucesso.' });
  });
});

// Endpoint para buscar informações do professor
app.get('/professor', (req, res) => {
  const professorEmail = req.query.email;

  console.log('Buscando professor com email:', professorEmail); // Log adicionado

  if (!professorEmail) {
    return res.status(400).json({ success: false, message: 'Email do professor não fornecido.' });
  }

  const query = 'SELECT idProfessor, Nome, Email, Telefone FROM professor WHERE Email = ?';
  
  db.query(query, [professorEmail], (error, results) => {
    if (error) {
      console.error('Erro ao buscar informações do professor:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar informações do professor.' });
    }
    console.log('Resultados da busca:', results); // Log adicionado
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Professor não encontrado.' });
    }
    return res.status(200).json(results[0]);
  });
});

// Endpoint para editar informações do professor
app.put('/professor', (req, res) => {
  const { idProfessor, Nome, Email, Telefone } = req.body;

  if (!idProfessor) {
    return res.status(400).json({ success: false, message: 'ID do professor não fornecido.' });
  }

  const query = 'UPDATE professor SET Nome = ?, Email = ?, Telefone = ? WHERE idProfessor = ?';
  
  db.query(query, [Nome, Email, Telefone, idProfessor], (error, result) => {
    if (error) {
      console.error('Erro ao atualizar informações do professor:', error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar informações do professor.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Professor não encontrado.' });
    }
    return res.status(200).json({ success: true, message: 'Informações do professor atualizadas com sucesso.' });
  });
});

// Endpoint para excluir professor
app.delete('/professor/:idProfessor', (req, res) => {
  const { idProfessor } = req.params;

  db.beginTransaction((err) => {
    if (err) {
      console.error('Erro ao iniciar transação:', err);
      return res.status(500).json({ success: false, message: 'Erro ao excluir professor.' });
    }

    // Primeiro, exclua todas as disciplinas associadas ao professor
    const deleteDisciplinasQuery = 'DELETE FROM disciplina WHERE professor_id = ?';
    db.query(deleteDisciplinasQuery, [idProfessor], (error) => {
      if (error) {
        return db.rollback(() => {
          console.error('Erro ao excluir disciplinas do professor:', error);
          res.status(500).json({ success: false, message: 'Erro ao excluir professor.' });
        });
      }

      // Agora, exclua o professor
      const deleteProfessorQuery = 'DELETE FROM professor WHERE idProfessor = ?';
      db.query(deleteProfessorQuery, [idProfessor], (error, result) => {
        if (error) {
          return db.rollback(() => {
            console.error('Erro ao excluir professor:', error);
            res.status(500).json({ success: false, message: 'Erro ao excluir professor.' });
          });
        }

        if (result.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ success: false, message: 'Professor não encontrado.' });
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Erro ao commit da transação:', err);
              res.status(500).json({ success: false, message: 'Erro ao excluir professor.' });
            });
          }
          res.status(200).json({ success: true, message: 'Professor excluído com sucesso.' });
        });
      });
    });
  });
});

// Endpoint para cadastrar sala
app.post('/cadastrar-sala', (req, res) => {
  const { nome, capacidade, localizacao } = req.body;

  const query = 'INSERT INTO sala (Nome, Capacidade, Localizacao) VALUES (?, ?, ?)';
  db.query(query, [nome, capacidade, localizacao], (error, results) => {
    if (error) {
      console.error('Erro ao cadastrar sala:', error);
      return res.status(500).json({ success: false, message: 'Erro ao cadastrar sala.' });
    }
    return res.status(201).json({ success: true, message: 'Sala cadastrada com sucesso.' });
  });
});


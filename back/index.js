const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Importar a conexão do db.js
const pool = require('./db');

// Habilitar CORS e JSON
app.use(cors());
app.use(express.json());

// Endpoint para obter todas as turmas
app.get('/turmas', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const status = req.query.status;
        const orderBy = req.query.orderBy || 'nome';
        const order = req.query.order || 'asc';
        
        let query = `
            SELECT 
                t.idTurma, 
                t.Nome,
                t.Ano,
                t.Semestre,
                t.Status,
                t.Professor_idProfessor,
                t.Disciplina_idDisciplina,
                t.Sala_idSala,
                t.Dia_semana,
                t.Horario_inicio,
                t.Horario_termino,
                p.Nome AS nomeProfessor,
                p.Email AS emailProfessor,
                p.Titulacao AS titulacaoProfessor,
                d.Nome AS nomeDisciplina,
                d.Codigo AS codigoDisciplina, 
                s.Nome AS nomeSala,
                (SELECT COUNT(*) FROM turma_aluno ta 
                 INNER JOIN aluno a ON a.idAluno = ta.aluno_id 
                 WHERE ta.turma_id = t.idTurma AND a.Status = 1) as qtdAlunos
            FROM turma t
            LEFT JOIN professor p ON t.Professor_idProfessor = p.idProfessor
            LEFT JOIN disciplina d ON t.Disciplina_idDisciplina = d.idDisciplina
            LEFT JOIN sala s ON t.Sala_idSala = s.idSala
        `;
        
        const params = [];
        if (status === '1' || status === '0') {
            query += ` WHERE t.Status = ?`;
            params.push(parseInt(status));
        }

        // Ordenação
        const orderByMap = {
            'disciplina': 'd.Nome',
            'ano': 't.Ano',
            'nome': 't.Nome',
            'qtdAlunos': 'qtdAlunos'
        };

        const orderByField = orderByMap[orderBy] || 't.Nome';
        query += ` ORDER BY ${orderByField} ${order.toUpperCase()}`;

        const [results] = await connection.query(query, params);
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar turmas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar turmas',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Remova o db.connect e inicie o servidor diretamente
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

//endpoint professor disciplina
app.get('/professores/ativos', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [results] = await connection.query(`
            SELECT 
                idProfessor,
                Nome,
                Email,
                Telefone,
                Titulacao,
                Status
            FROM professor
            WHERE Status = 1
            ORDER BY Nome ASC
        `);
        
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar professores ativos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar professores ativos',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para editar turma
app.put('/turmas/:idTurma', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { idTurma } = req.params;
        const updateData = req.body;

        console.log(`Recebendo atualização para turma ID: ${idTurma}`);
        console.log('Dados recebidos:', updateData);

        // Construir a query dinamicamente apenas com os campos fornecidos
        const updates = [];
        const values = [];

        // Mapeia os campos que podem ser atualizados
        const allowedFields = {
            'Nome': 'Nome',
            'professor_id': 'Professor_idProfessor',
            'disciplina_id': 'Disciplina_idDisciplina',
            'sala_id': 'Sala_idSala',
            'Dia_semana': 'Dia_semana',
            'Horario_inicio': 'Horario_inicio',
            'Horario_termino': 'Horario_termino',
            'Ano': 'Ano',
            'Semestre': 'Semestre',
            'Status': 'Status'
        };

        // Adiciona apenas os campos que foram fornecidos na requisição
        Object.entries(updateData).forEach(([key, value]) => {
            if (allowedFields[key] && value !== undefined && value !== null) {
                updates.push(`${allowedFields[key]} = ?`);
                values.push(value);
            }
        });

        // Caso nenhum campo válido seja recebido
        if (updates.length === 0) {
            console.warn('Nenhum campo para atualizar');
            return res.status(400).json({
                success: false,
                message: 'Nenhum campo válido fornecido para atualizar'
            });
        }

        // Adiciona o ID da turma ao final dos valores
        values.push(idTurma);

        // Monta a query SQL dinamicamente
        const query = `
            UPDATE turma 
            SET ${updates.join(', ')}
            WHERE idTurma = ?
        `;

        console.log('Query de atualização:', query);
        console.log('Valores:', values);

        // Executa a query
        const [result] = await connection.query(query, values);

        // Verifica se a turma foi realmente atualizada
        if (result.affectedRows === 0) {
            console.warn(`Turma com ID ${idTurma} não encontrada ou nenhum dado alterado.`);
            return res.status(404).json({
                success: false,
                message: 'Turma não encontrada ou nenhum dado foi alterado'
            });
        }

        await connection.commit();
        console.log('Turma atualizada com sucesso!');
        res.json({
            success: true,
            message: 'Turma atualizada com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao atualizar turma:', error);
        if (connection) await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar turma',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar salas
app.get('/salas', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const status = req.query.status;
        const orderBy = req.query.orderBy || 'nome';
        const order = req.query.order || 'asc';
        
        let query = `
            SELECT 
                idSala,
                Nome,
                Capacidade,
                Localizacao,
                Status
            FROM sala
        `;
        
        const params = [];
        if (status === '1' || status === '0') {
            query += ` WHERE Status = ?`;
            params.push(parseInt(status));
        }
        
        // Mapeamento para ordenação
        const orderByMap = {
            'nome': 'Nome',
            'capacidade': 'Capacidade'
        };
        
        const orderByField = orderByMap[orderBy] || 'Nome';
        query += ` ORDER BY ${orderByField} ${order.toUpperCase()}`;
        
        const [results] = await connection.query(query, params);
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar salas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar salas.',
            error: error.message 
        });
    } finally {
        connection.release();
    }
});

// Endpoint para alterar status da sala
app.put('/sala-status/:idSala', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { idSala } = req.params;
        const { Status } = req.body;

        // Verifica se a sala está sendo usada por alguma turma ativa
        if (Status === 0) {
            const [turmasAtivas] = await connection.query(
                'SELECT COUNT(*) as count FROM turma WHERE Sala_idSala = ? AND Status = 1',
                [idSala]
            );

            if (turmasAtivas[0].count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Não é possível inativar esta sala pois ela está sendo usada por turmas ativas'
                });
            }
        }
        
        await connection.query(
            'UPDATE sala SET Status = ? WHERE idSala = ?',
            [Status, idSala]
        );
        
        res.json({ 
            success: true, 
            message: `Sala ${Status ? 'ativada' : 'inativada'} com sucesso!` 
        });
    } catch (error) {
        console.error('Erro ao alterar status da sala:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao alterar status da sala',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar alunos
app.get('/alunos', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const status = req.query.status;
        const orderBy = req.query.orderBy || 'Nome';
        const order = req.query.order || 'asc';
        
        let query = `
            SELECT 
                a.*,
                (SELECT COUNT(*) 
                 FROM turma_aluno ta 
                 INNER JOIN turma t ON ta.turma_id = t.idTurma 
                 WHERE ta.aluno_id = a.idAluno AND t.Status = 1) as qtdTurmas
            FROM aluno a
        `;
        
        const params = [];
        if (status === '1' || status === '0') {
            query += ` WHERE a.Status = ?`;
            params.push(parseInt(status));
        }

        // Mapeamento de campos para ordenação
        const orderByMap = {
            'Nome': 'a.Nome',
            'Email': 'a.Email',
            'Data_Nascimento': 'a.Data_Nascimento',
            'qtdTurmas': 'qtdTurmas'
        };

        const orderByField = orderByMap[orderBy] || 'a.Nome';
        query += ` ORDER BY ${orderByField} ${order.toUpperCase()}`;

        const [results] = await connection.query(query, params);
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar alunos',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar professor por email
app.get('/professor', async (req, res) => {
    const { email } = req.query;
    try {
        const [results] = await pool.query('SELECT * FROM professor WHERE Email = ?', [email]);
        if (results.length > 0) {
            console.log('Professor encontrado:', results[0]);
            res.json({ success: true, data: results[0] });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Professor não encontrado' 
            });
        }
    } catch (error) {
        console.error('Erro ao buscar professor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar professor',
            error: error.message 
        });
    }
});

// Endpoint para buscar disciplinas do professor
app.get('/disciplinas-professor', async (req, res) => {
    const { email } = req.query;
    try {
        const query = `
            SELECT d.* 
            FROM disciplina d
            INNER JOIN professor p ON d.professor_id = p.idProfessor
            WHERE p.Email = ? AND d.Status = 1
            ORDER BY d.Nome
        `;
        
        const [results] = await pool.query(query, [email]);
        console.log('Email do professor:', email);
        console.log('Disciplinas encontradas:', results);
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar disciplinas do professor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar disciplinas',
            error: error.message 
        });
    }
});

// Endpoint para excluir turma
app.delete('/excluir-turma/:idTurma', async (req, res) => {
    const { idTurma } = req.params;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Primeiro remove as relações na tabela turma_aluno
        await connection.query('DELETE FROM turma_has_aluno WHERE turma_id = ?', [idTurma]);
        
        // Depois remove a turma
        await connection.query('DELETE FROM turma WHERE idTurma = ?', [idTurma]);

        await connection.commit();
        res.json({ success: true, message: 'Turma excluída com sucesso!' });
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao excluir turma:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao excluir turma',
            error: error.message 
        });
    } finally {
        connection.release();
    }
});

// Endpoint para alterar status da turma
app.put('/turma-status/:idTurma', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { idTurma } = req.params;
        const { Status } = req.body;
        
        await connection.query(
            'UPDATE turma SET Status = ? WHERE idTurma = ?',
            [Status, idTurma]
        );
        
        res.json({ 
            success: true, 
            message: `Turma ${Status ? 'ativada' : 'inativada'} com sucesso!` 
        });
    } catch (error) {
        console.error('Erro ao alterar status da turma:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao alterar status da turma',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar disciplinas
app.get('/disciplinas', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Query simplificada para teste
        const query = `
            SELECT 
                idDisciplina,
                Nome,
                codigo,
                Periodo,
                Status
            FROM disciplina
            ORDER BY Nome
        `;
        
        const [results] = await connection.query(query);
        console.log('Disciplinas encontradas:', results); // Debug
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar disciplinas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar disciplinas',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para criar nova disciplina
app.post('/disciplinas', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { Nome, codigo, Periodo } = req.body;

        // Validação dos campos obrigatórios
        if (!Nome || !codigo || !Periodo) {
            return res.status(400).json({
                success: false,
                message: 'Nome, código e período são campos obrigatórios'
            });
        }

        const query = `
            INSERT INTO disciplina (Nome, codigo, Periodo, Status) 
            VALUES (?, ?, ?, 1)
        `;
        
        const [result] = await connection.query(query, [Nome, codigo, Periodo]);
        
        res.json({
            success: true,
            message: 'Disciplina cadastrada com sucesso',
            data: { idDisciplina: result.insertId }
        });
    } catch (error) {
        console.error('Erro ao cadastrar disciplina:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao cadastrar disciplina',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para atualizar status da disciplina
app.put('/inativar-disciplina/:idDisciplina', async (req, res) => {
    const { idDisciplina } = req.params;
    const { ativo } = req.body;
    
    try {
        await pool.query(
            'UPDATE disciplina SET Status = ? WHERE idDisciplina = ?',
            [ativo ? 1 : 0, idDisciplina]
        );
        
        res.json({
            success: true,
            message: `Disciplina ${ativo ? 'ativada' : 'desativada'} com sucesso!`
        });
    } catch (error) {
        console.error('Erro ao alterar status da disciplina:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao alterar status da disciplina',
            error: error.message
        });
    }
});

// Endpoint para atualizar disciplina
app.put('/disciplina/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const { Nome, codigo, Periodo, Status } = req.body;

        // Validação
        if (!Nome || !codigo || !Periodo) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }

        const query = `
            UPDATE disciplina 
            SET Nome = ?, 
                codigo = ?, 
                Periodo = ?, 
                Status = ?
            WHERE idDisciplina = ?
        `;

        await connection.query(query, [Nome, codigo, Periodo, Status, id]);

        res.json({
            success: true,
            message: 'Disciplina atualizada com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao atualizar disciplina:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar disciplina',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
});

// Adicionar este endpoint para editar sala
app.put('/salas/:idSala', async (req, res) => {
    const { idSala } = req.params;
    const { Nome, Capacidade, Localizacao } = req.body;
    
    try {
        await pool.query(
            'UPDATE sala SET Nome = ?, Capacidade = ?, Localizacao = ? WHERE idSala = ?',
            [Nome, Capacidade, Localizacao, idSala]
        );
        
        res.json({
            success: true,
            message: 'Sala atualizada com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao atualizar sala:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar sala',
            error: error.message
        });
    }
});

// Função de validação
const validarProfessorDisciplina = async (connection, professorId, disciplinaId) => {
    const [disciplinas] = await connection.query(`
        SELECT 1 FROM professor_disciplina 
        WHERE Professor_idProfessor = ? AND Disciplina_idDisciplina = ?
    `, [professorId, disciplinaId]);

    return disciplinas.length > 0;
};

// Atualizar o endpoint de criar turma
app.post('/turmas', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const { 
            Nome, 
            idProfessor, 
            idDisciplina, 
            idSala,
            Dia_semana,
            Horario_inicio,
            Horario_termino,
            Ano,
            Semestre,
            Status,
            alunos // Array com os IDs dos alunos
        } = req.body;

        // Insere a turma
        const [result] = await connection.query(`
            INSERT INTO turma (
                Nome,
                Ano,
                Semestre,
                Professor_idProfessor,
                Disciplina_idDisciplina,
                Sala_idSala,
                Dia_semana,
                Horario_inicio,
                Horario_termino,
                Status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            Nome,
            Ano,
            Semestre,
            idProfessor,
            idDisciplina,
            idSala,
            Dia_semana,
            Horario_inicio,
            Horario_termino,
            Status
        ]);

        const turmaId = result.insertId;

        // Se houver alunos selecionados, insere na tabela turma_aluno
        if (alunos && alunos.length > 0) {
            // Remove duplicatas do array de alunos
            const alunosUnicos = [...new Set(alunos)];
            
            // Cria array de valores para inserção em lote
            const values = alunosUnicos.map(alunoId => [turmaId, alunoId]);
            
            // Insere as associações turma-aluno
            await connection.query(
                'INSERT INTO turma_aluno (turma_id, aluno_id) VALUES ?',
                [values]
            );
        }

        await connection.commit();
        res.json({ 
            success: true, 
            message: 'Turma criada com sucesso',
            id: turmaId 
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Erro ao criar turma:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao criar turma',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para cadastrar sala
app.post('/cadastrar-sala', async (req, res) => {
    const { nome, capacidade, localizacao } = req.body;
    
    try {
        // Validar dados
        if (!nome || !capacidade || !localizacao) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO sala (Nome, Capacidade, Localizacao, Status) VALUES (?, ?, ?, 1)',
            [nome, capacidade, localizacao]
        );
        
        res.json({
            success: true,
            message: 'Sala cadastrada com sucesso!',
            salaId: result.insertId
        });
    } catch (error) {
        console.error('Erro ao cadastrar sala:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao cadastrar sala',
            error: error.message
        });
    }
});

// Endpoint para obter professores
app.get('/professores', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const query = `
            SELECT 
                idProfessor,
                Nome,
                Email,
                Telefone,
                Titulacao,
                Status
            FROM professor
            ORDER BY Nome ASC
        `;
        
        const [results] = await connection.query(query);
        console.log('Professores encontrados:', results); // Debug
        res.json(results);
        
    } catch (error) {
        console.error('Erro ao buscar professores:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar professores',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para alterar status do professor
app.put('/professor-status/:idProfessor', async (req, res) => {
    const { idProfessor } = req.params;
    const { Status } = req.body;
    
    try {
        await pool.query(
            'UPDATE professor SET Status = ? WHERE idProfessor = ?',
            [Status ? 1 : 0, idProfessor]
        );
        
        res.json({ 
            success: true, 
            message: `Professor ${Status ? 'ativado' : 'desativado'} com sucesso!` 
        });
    } catch (error) {
        console.error('Erro ao alterar status do professor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao alterar status do professor',
            error: error.message 
        });
    }
});

// Endpoint para atualizar professor
app.put('/professores/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const updateData = req.body;

        // Primeiro, busca o professor atual
        const [professor] = await connection.query(
            'SELECT * FROM professor WHERE idProfessor = ?',
            [id]
        );

        if (professor.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Professor não encontrado'
            });
        }

        // Monta a query apenas com os campos fornecidos
        const updates = [];
        const values = [];
        
        if (updateData.Nome !== undefined) {
            updates.push('Nome = ?');
            values.push(updateData.Nome);
        }
        if (updateData.Email !== undefined) {
            updates.push('Email = ?');
            values.push(updateData.Email);
        }
        if (updateData.CPF !== undefined) {
            updates.push('CPF = ?');
            values.push(updateData.CPF);
        }
        if (updateData.Titulacao !== undefined) {
            updates.push('Titulacao = ?');
            values.push(updateData.Titulacao);
        }
        if (updateData.Telefone !== undefined) {
            updates.push('Telefone = ?');
            values.push(updateData.Telefone);
        }
        if (updateData.Senha !== undefined) {
            updates.push('Senha = ?');
            values.push(updateData.Senha);
        }
        if (updateData.Status !== undefined) {
            updates.push('Status = ?');
            values.push(updateData.Status);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum campo para atualizar'
            });
        }

        // Adiciona o ID ao final dos valores
        values.push(id);

        const query = `
            UPDATE professor 
            SET ${updates.join(', ')}
            WHERE idProfessor = ?
        `;

        await connection.query(query, values);

        res.json({ 
            success: true, 
            message: 'Professor atualizado com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao atualizar professor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao atualizar professor',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Primeiro tenta encontrar um professor
        const [professors] = await pool.query(
            'SELECT idProfessor, Nome, Email, Status FROM professor WHERE Email = ? AND Senha = ?',
            [email, password]
        );

        if (professors.length > 0) {
            // Verifica se o professor está ativo
            if (professors[0].Status === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Conta inativa. Entre em contato com o administrador.'
                });
            }
            
            return res.json({
                success: true,
                role: 'professor',
                user: professors[0]
            });
        }

        // Se não encontrou professor, tenta encontrar um aluno
        const [students] = await pool.query(
            'SELECT idAluno, Nome, Email, Status FROM aluno WHERE Email = ? AND Senha = ?',
            [email, password]
        );

        if (students.length > 0) {
            // Verifica se o aluno está ativo
            if (students[0].Status === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Conta inativa. Entre em contato com o administrador.'
                });
            }
            
            return res.json({
                success: true,
                role: 'aluno',
                user: students[0]
            });
        }

        // Se não encontrou nenhum usuário
        return res.status(401).json({
            success: false,
            message: 'Email ou senha incorretos.'
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao realizar login',
            error: error.message
        });
    }
});

// Endpoint para criar nova turma
app.post('/turmas', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const {
            Nome,
            Ano,
            Semestre,
            Professor_idProfessor,
            Disciplina_idDisciplina,
            Sala_idSala,
            Dia_semana,
            Horario_inicio,
            Horario_termino
        } = req.body;

        // Validar campos obrigatórios
        if (!Nome) {
            throw new Error('Nome da turma é obrigatório');
        }

        // Converter strings vazias para null
        const professorId = Professor_idProfessor || null;
        const disciplinaId = Disciplina_idDisciplina || null;
        const salaId = Sala_idSala || null;
        const semestre = Semestre || null;
        const diaSemana = Dia_semana || null;
        const horarioInicio = Horario_inicio || null;
        const horarioTermino = Horario_termino || null;

        const [result] = await connection.query(`
            INSERT INTO turma (
                Nome,
                Ano,
                Semestre,
                Professor_idProfessor,
                Disciplina_idDisciplina,
                Sala_idSala,
                Dia_semana,
                Horario_inicio,
                Horario_termino,
                Status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `, [
            Nome,
            Ano,
            semestre,
            professorId,
            disciplinaId,
            salaId,
            diaSemana,
            horarioInicio,
            horarioTermino
        ]);

        res.json({
            success: true,
            message: 'Turma criada com sucesso!',
            id: result.insertId
        });
    } catch (error) {
        console.error('Erro ao criar turma:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar turma: ' + error.message
        });
    } finally {
        connection.release();
    }
});

// Endpoint para criar nova sala
app.post('/salas', async (req, res) => {
    const { Nome, Capacidade, Localizacao } = req.body;
    
    try {
        const [result] = await pool.query(
            'INSERT INTO sala (Nome, Capacidade, Localizacao, Status) VALUES (?, ?, ?, 1)',
            [Nome, Capacidade, Localizacao]
        );
        
        res.json({
            success: true,
            message: 'Sala criada com sucesso!',
            id: result.insertId
        });
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar sala',
            error: error.message
        });
    }
});

// Endpoint para criar nova disciplina
app.post('/disciplinas', async (req, res) => {
    const { Nome, codigo, Periodo, Professor_idProfessor } = req.body;
    
    console.log('Recebendo requisição para criar disciplina:', {
        Nome,
        codigo,
        Periodo,
        Professor_idProfessor
    });

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Primeiro, criar a disciplina
        const [result] = await connection.query(
            'INSERT INTO disciplina (Nome, codigo, Periodo, Status) VALUES (?, ?, ?, 1)',
            [Nome, codigo, Periodo]
        );
        
        console.log('Disciplina criada com ID:', result.insertId);
        
        // Depois, criar a relação professor_disciplina
        await connection.query(
            'INSERT INTO professor_disciplina (Professor_idProfessor, Disciplina_idDisciplina) VALUES (?, ?)',
            [Professor_idProfessor, result.insertId]
        );
        
        await connection.commit();
        
        res.json({
            success: true,
            message: 'Disciplina criada com sucesso!',
            id: result.insertId
        });
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao criar disciplina:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar disciplina',
            error: error.message
        });
    } finally {
        connection.release();
    }
});

// Endpoint para criar professor
app.post('/professores', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { Nome, Email, Telefone, Senha, CPF, Titulacao, Status = 1 } = req.body;

        // Validação dos campos obrigatórios
        if (!Nome || !Email || !Senha || !CPF || !Titulacao) {
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios não preenchidos'
            });
        }

        const query = `
            INSERT INTO professor 
            (Nome, Email, Telefone, Senha, CPF, Titulacao, Status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.query(query, [
            Nome,
            Email,
            Telefone,
            Senha,
            CPF.replace(/[^\d]/g, ''), // Remove caracteres não numéricos do CPF
            Titulacao,
            Status
        ]);

        res.status(201).json({
            success: true,
            message: 'Professor criado com sucesso',
            id: result.insertId
        });

    } catch (error) {
        console.error('Erro ao criar professor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar professor',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar professor por email
app.get('/professor-by-email', async (req, res) => {
    const { email } = req.query;
    
    try {
        const [professors] = await pool.query(
            'SELECT idProfessor, Nome, Email FROM professor WHERE Email = ?',
            [email]
        );
        
        if (professors.length > 0) {
            res.json({
                success: true,
                professor: professors[0]
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Professor não encontrado'
            });
        }
    } catch (error) {
        console.error('Erro ao buscar professor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar professor',
            error: error.message
        });
    }
});

// Endpoint para editar disciplina
app.put('/editar-disciplina/:idDisciplina', async (req, res) => {
    const { idDisciplina } = req.params;
    const { Nome, codigo, Periodo, Status } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        await connection.query(`
            UPDATE disciplina 
            SET Nome = ?,
                codigo = ?,
                Periodo = ?,
                Status = ?
            WHERE idDisciplina = ?
        `, [Nome, codigo, Periodo, Status, idDisciplina]);
        
        await connection.commit();
        
        res.json({
            success: true,
            message: 'Disciplina atualizada com sucesso!'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao atualizar disciplina:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar disciplina',
            error: error.message
        });
    } finally {
        connection.release();
    }
});

// Endpoint para inativar disciplina
app.put('/inativar-disciplina/:idDisciplina', async (req, res) => {
    const { idDisciplina } = req.params;
    const { ativo } = req.body;
    
    try {
        await pool.query(
            'UPDATE disciplina SET Status = ? WHERE idDisciplina = ?',
            [ativo ? 1 : 0, idDisciplina]
        );
        
        res.json({
            success: true,
            message: `Disciplina ${ativo ? 'ativada' : 'desativada'} com sucesso!`
        });
    } catch (error) {
        console.error('Erro ao alterar status da disciplina:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao alterar status da disciplina',
            error: error.message
        });
    }
});

// Endpoint para inativar turma
app.put('/inativar-turma/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Status } = req.body; // Recebendo o status do corpo da requisição

        await pool.query(
            "UPDATE turma SET Status = ? WHERE idTurma = ?",
            [Status, id]
        );

        res.json({ message: 'Turma inativada com sucesso' });
    } catch (error) {
        console.error('Erro ao inativar turma:', error);
        res.status(500).json({ error: 'Erro ao inativar turma' });
    }
});

// Endpoint para inativar sala
app.put('/inativar-sala/:idSala', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            UPDATE sala 
            SET Status = 0
            WHERE idSala = ?
        `, [req.params.idSala]);
        
        res.json({ success: true, message: 'Sala inativada com sucesso!' });
    } catch (error) {
        console.error('Erro ao inativar sala:', error);
        res.status(500).json({ success: false, message: 'Erro ao inativar sala' });
    } finally {
        connection.release();
    }
});

// Endpoint para inativar professor
app.put('/inativar-professor/:idProfessor', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            UPDATE professor 
            SET Status = 0
            WHERE idProfessor = ?
        `, [req.params.idProfessor]);
        
        res.json({ success: true, message: 'Professor inativado com sucesso!' });
    } catch (error) {
        console.error('Erro ao inativar professor:', error);
        res.status(500).json({ success: false, message: 'Erro ao inativar professor' });
    } finally {
        connection.release();
    }
});

// Primeiro, vamos ajustar o endpoint para buscar uma turma específica
app.get('/turma/:idTurma', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [turma] = await connection.query(`
            SELECT 
                t.idTurma, 
                t.Nome AS nomeTurma, 
                t.Ano,
                t.Semestre,
                t.Status,
                t.Professor_idProfessor,
                t.Disciplina_idDisciplina,
                t.Sala_idSala,
                t.Dia_semana,
                t.Horario_inicio,
                t.Horario_termino,
                p.Nome AS nomeProfessor,
                d.Nome AS nomeDisciplina, 
                s.Nome AS nomeSala
            FROM turma t
            LEFT JOIN professor p ON t.Professor_idProfessor = p.idProfessor
            LEFT JOIN disciplina d ON t.Disciplina_idDisciplina = d.idDisciplina
            LEFT JOIN sala s ON t.Sala_idSala = s.idSala
            WHERE t.idTurma = ?
        `, [req.params.idTurma]);

        if (turma.length > 0) {
            res.json(turma[0]);
        } else {
            res.status(404).json({ message: 'Turma não encontrada' });
        }
    } catch (error) {
        console.error('Erro ao buscar turma:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar turma',
            error: error.message 
        });
    } finally {
        connection.release();
    }
});

// Endpoint para reativar turma
app.put('/turmas/:idTurma/reactivate', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            UPDATE turma 
            SET Status = 1
            WHERE idTurma = ?
        `, [req.params.idTurma]);
        
        res.json({ success: true, message: 'Turma reativada com sucesso!' });
    } catch (error) {
        console.error('Erro ao reativar turma:', error);
        res.status(500).json({ success: false, message: 'Erro ao reativar turma' });
    } finally {
        connection.release();
    }
});

// Endpoint para reativar sala
app.put('/salas/:idSala/reactivate', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            UPDATE sala 
            SET Status = 1
            WHERE idSala = ?
        `, [req.params.idSala]);
        
        res.json({ success: true, message: 'Sala reativada com sucesso!' });
    } catch (error) {
        console.error('Erro ao reativar sala:', error);
        res.status(500).json({ success: false, message: 'Erro ao reativar sala' });
    } finally {
        connection.release();
    }
});

app.put('/disciplinas/:idDisciplina', async (req, res) => {
    const { idDisciplina } = req.params; // Pega o ID da disciplina da URL
    const { Nome, codigo, Periodo, Status } = req.body; // Dados enviados pelo front-end
    
    console.log('Recebendo atualização para disciplina ID:', idDisciplina);
    console.log('Dados recebidos:', { Nome, codigo, Periodo, Status });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Array para construir a query dinamicamente
        const updates = [];
        const values = [];

        // Adiciona os campos que foram enviados
        if (Nome !== undefined) {
            updates.push('Nome = ?');
            values.push(Nome);
        }
        if (codigo !== undefined) {
            updates.push('codigo = ?');
            values.push(codigo);
        }
        if (Periodo !== undefined) {
            updates.push('Periodo = ?');
            values.push(Periodo);
        }
        if (Status !== undefined) {
            updates.push('Status = ?');
            values.push(Status);
        }

        // Se nenhum campo for enviado, retorna erro
        if (updates.length === 0) {
            console.warn('Nenhum campo enviado para atualização');
            return res.status(400).json({
                success: false,
                message: 'Nenhum campo enviado para atualização',
            });
        }

        // Adiciona o ID da disciplina no final dos valores
        values.push(idDisciplina);

        // Monta a query dinamicamente
        const query = `
            UPDATE disciplina 
            SET ${updates.join(', ')} 
            WHERE idDisciplina = ?
        `;

        console.log('Query de atualização:', query);
        console.log('Valores:', values);

        const [result] = await connection.query(query, values);

        if (result.affectedRows === 0) {
            console.warn(`Disciplina com ID ${idDisciplina} não encontrada`);
            return res.status(404).json({
                success: false,
                message: 'Disciplina não encontrada',
            });
        }

        await connection.commit();

        console.log('Disciplina atualizada com sucesso!');
        res.json({
            success: true,
            message: 'Disciplina atualizada com sucesso!',
        });
    } catch (error) {
        console.error('Erro ao atualizar disciplina:', error);
        if (connection) await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar disciplina',
            error: error.message,
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para cadastrar disciplina na homeProfessor
app.post('/disciplinas', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const { Nome, codigo, Periodo, Status } = req.body;
        
        const [result] = await connection.query(
            'INSERT INTO disciplina (Nome, codigo, Periodo, Status) VALUES (?, ?, ?, ?)', 
            [Nome, codigo, Periodo, Status]
        );
        
        res.json({
            success: true,
            message: 'Disciplina criada com sucesso',
            idDisciplina: result.insertId,
            data: { idDisciplina: result.insertId }
        });
    } catch (error) {
        console.error('Erro ao criar disciplina:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao criar disciplina',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// tamo aquiii
app.post('/disciplinas/:idDisciplina/professores/:idProfessor', async (req, res) => {

    const { idDisciplina, idProfessor } = req.params;
    // console.log('Dados recebidos no backend:', { Nome, codigo, Periodo, Status });

    try {
        const query = `
            INSERT INTO professor_disciplina (Professor_idProfessor, Disciplina_idDisciplina)
            VALUES (?, ?)
        `;
        const [result] = await pool.query(query, [idProfessor, idDisciplina]);

        console.log('Professor-Disciplina criada com sucesso:', result);

        res.status(201).json({
            success: true,
            message: 'Professor-Disciplina criada com sucesso',
        });
    } catch (error) {
        console.error('Erro ao criar professor_disciplina:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar professor_disciplina',
            error: error.message,
        });
    }
});

// Endpoint para buscar disciplinas com seus professores
app.get('/disciplinas', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const status = req.query.status;
        const orderBy = req.query.orderBy || 'nome';
        const order = req.query.order || 'asc';

        let query = `
            SELECT 
                d.idDisciplina,
                d.Nome,
                d.codigo,
                d.Periodo,
                d.Status,
                GROUP_CONCAT(DISTINCT pd.Professor_idProfessor) as professores
            FROM disciplina d
            LEFT JOIN professor_disciplina pd ON d.idDisciplina = pd.Disciplina_idDisciplina
        `;

        const params = [];
        if (status === '1' || status === '0') {
            query += ` WHERE d.Status = ?`;
            params.push(parseInt(status));
        }

        query += ` GROUP BY d.idDisciplina`;

        const orderByMap = {
            'nome': 'd.Nome',
            'codigo': 'd.codigo',
            'periodo': 'd.Periodo'
        };

        const orderByField = orderByMap[orderBy] || 'd.Nome';
        query += ` ORDER BY ${orderByField} ${order.toUpperCase()}`;

        const [results] = await connection.query(query, params);

        // Convert the comma-separated professor IDs to an array
        results.forEach(disciplina => {
            disciplina.professores = disciplina.professores 
                ? disciplina.professores.split(',').map(id => parseInt(id))
                : [];
        });

        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar disciplinas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar disciplinas',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar professores ativos
app.get('/professores/ativos', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [results] = await connection.query(`
            SELECT 
                idProfessor,
                Nome,
                Email,
                Telefone,
                Titulacao,
                Status
            FROM professor
            WHERE Status = 1
            ORDER BY Nome ASC
        `);
        
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar professores ativos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar professores ativos',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar detalhes de uma disciplina específica
app.get('/disciplinas/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;

        const query = `
            SELECT 
                d.idDisciplina,
                d.Nome,
                d.codigo,
                d.Periodo,
                d.Status,
                GROUP_CONCAT(DISTINCT pd.Professor_idProfessor) as professores
            FROM disciplina d
            LEFT JOIN professor_disciplina pd ON d.idDisciplina = pd.Disciplina_idDisciplina
            WHERE d.idDisciplina = ?
            GROUP BY d.idDisciplina
        `;

        const [results] = await connection.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Disciplina não encontrada'
            });
        }

        // Convert the comma-separated professor IDs to an array of numbers
        const disciplina = {
            ...results[0],
            professores: results[0].professores 
                ? results[0].professores.split(',').map(Number) 
                : []
        };

        res.json(disciplina);

    } catch (error) {
        console.error('Erro ao buscar detalhes da disciplina:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar detalhes da disciplina',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar detalhes da sala com turmas associadas
app.get('/salas/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;

        const query = `
            SELECT 
                s.idSala,
                s.Nome,
                s.Localizacao,
                s.Capacidade,
                s.Status,
                GROUP_CONCAT(
                    DISTINCT CONCAT(
                        t.Nome, '|',
                        d.Nome, '|',
                        p.Nome, '|',
                        t.Dia_semana, '|',
                        t.Horario_inicio, '|',
                        t.Horario_termino
                    )
                ) as turmas
            FROM sala s
            LEFT JOIN turma t ON s.idSala = t.Sala_idSala
            LEFT JOIN disciplina d ON t.Disciplina_idDisciplina = d.idDisciplina
            LEFT JOIN professor p ON t.Professor_idProfessor = p.idProfessor
            WHERE s.idSala = ?
            GROUP BY s.idSala
        `;

        const [results] = await connection.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sala não encontrada'
            });
        }

        // Processar as turmas
        const sala = {
            ...results[0],
            turmas: results[0].turmas 
                ? results[0].turmas.split(',').map(turma => {
                    const [nome, disciplina, professor, dia, inicio, termino] = turma.split('|');
                    return {
                        nome,
                        disciplina,
                        professor,
                        dia,
                        horario: `${inicio} - ${termino}`
                    };
                })
                : []
        };

        res.json(sala);

    } catch (error) {
        console.error('Erro ao buscar detalhes da sala:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar detalhes da sala',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
});

// Listar todos os alunos
app.get('/alunos', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [alunos] = await connection.query(`
            SELECT idAluno, Nome, Email, Telefone, Data_Nascimento, Status
            FROM aluno
        `);
        
        res.json(alunos);
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar alunos',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Criar novo aluno
app.post('/alunos', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { Nome, Email, Telefone, Data_Nascimento, Senha } = req.body;

        const [result] = await connection.query(
            'INSERT INTO aluno (Nome, Email, Telefone, Data_Nascimento, Senha, Status) VALUES (?, ?, ?, ?, ?, 1)',
            [Nome, Email, Telefone, Data_Nascimento, Senha]
        );

        res.json({ 
            success: true, 
            message: 'Aluno criado com sucesso',
            id: result.insertId 
        });
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao criar aluno',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Atualizar aluno
app.put('/alunos/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        const updateData = req.body;

        // Se for apenas atualização de status
        if (Object.keys(updateData).length === 1 && updateData.Status !== undefined) {
            await connection.query(
                'UPDATE aluno SET Status = ? WHERE idAluno = ?',
                [updateData.Status, id]
            );
        } 
        // Se for atualização completa do aluno
        else {
            const { Nome, Email, Telefone, Data_Nascimento, Status } = updateData;
            await connection.query(
                'UPDATE aluno SET Nome = ?, Email = ?, Telefone = ?, Data_Nascimento = ?, Status = ? WHERE idAluno = ?',
                [Nome, Email, Telefone, Data_Nascimento, Status, id]
            );
        }

        res.json({ 
            success: true, 
            message: 'Aluno atualizado com sucesso' 
        });
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao atualizar aluno',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Excluir aluno
app.delete('/alunos/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;

        await connection.query('DELETE FROM aluno WHERE idAluno = ?', [id]);

        res.json({ 
            success: true, 
            message: 'Aluno excluído com sucesso' 
        });
    } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao excluir aluno',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Buscar turmas do aluno
app.get('/alunos/:id/turmas', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;

        const query = `
            SELECT 
                t.idTurma,
                t.Nome,
                t.Dia_semana,
                t.Horario_inicio,
                t.Horario_termino,
                d.Nome as nomeDisciplina,
                p.Nome as nomeProfessor
            FROM turma t
            INNER JOIN turma_aluno ta ON t.idTurma = ta.turma_id
            INNER JOIN disciplina d ON t.Disciplina_idDisciplina = d.idDisciplina
            INNER JOIN professor p ON t.Professor_idProfessor = p.idProfessor
            WHERE ta.aluno_id = ? AND t.Status = 1
            ORDER BY t.Dia_semana, t.Horario_inicio
        `;

        const [turmas] = await connection.query(query, [id]);
        res.json(turmas);
    } catch (error) {
        console.error('Erro ao buscar turmas do aluno:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar turmas do aluno',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar detalhes de um aluno específico
app.get('/alunos/:idAluno', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query(`
            SELECT 
                idAluno,
                Nome,
                Email,
                Telefone,
                Data_Nascimento,
                Status
            FROM aluno
            WHERE idAluno = ?
        `, [req.params.idAluno]);

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Aluno não encontrado' 
            });
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes do aluno:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar detalhes do aluno',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar alunos inativos
app.get('/alunos', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [alunos] = await connection.query(`
            SELECT idAluno, Nome, Email, Telefone, Data_Nascimento, Status
            FROM aluno
        `);
        
        res.json(alunos);
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar alunos',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para reativar aluno
app.put('/alunos/:idAluno/reactivate', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query(
            'UPDATE aluno SET Status = 1 WHERE idAluno = ?',
            [req.params.idAluno]
        );
        res.json({ success: true, message: 'Aluno reativado com sucesso' });
    } catch (error) {
        console.error('Erro ao reativar aluno:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao reativar aluno',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar turmas com contagem de alunos
app.get('/turmas/with-alunos-count', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const query = `
            SELECT 
                t.idTurma,
                t.Nome,
                t.Ano,
                t.Semestre,
                t.Status,
                t.Dia_semana,
                t.Horario_inicio,
                t.Horario_termino,
                p.Nome as nomeProfessor,
                d.Nome as nomeDisciplina,
                s.Nome as nomeSala,
                COUNT(DISTINCT ta.aluno_id) as totalAlunos
            FROM turma t
            LEFT JOIN professor p ON t.Professor_idProfessor = p.idProfessor
            LEFT JOIN disciplina d ON t.Disciplina_idDisciplina = d.idDisciplina
            LEFT JOIN sala s ON t.Sala_idSala = s.idSala
            LEFT JOIN turma_aluno ta ON t.idTurma = ta.turma_id
            GROUP BY 
                t.idTurma, 
                t.Nome, 
                t.Ano,
                t.Semestre,
                t.Status,
                t.Dia_semana,
                t.Horario_inicio,
                t.Horario_termino,
                p.Nome,
                d.Nome,
                s.Nome
            ORDER BY t.Nome
        `;
        
        const [turmas] = await connection.query(query);
        res.json(turmas);
    } catch (error) {
        console.error('Erro ao buscar turmas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar turmas',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar associações professor-disciplina
app.get('/professor-disciplinas', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [results] = await connection.query(`
            SELECT 
                pd.Professor_idProfessor as professor_id,
                pd.Disciplina_idDisciplina as disciplina_id,
                p.Nome as professor_nome,
                d.Nome as disciplina_nome
            FROM professor_disciplina pd
            INNER JOIN professor p ON p.idProfessor = pd.Professor_idProfessor
            INNER JOIN disciplina d ON d.idDisciplina = pd.Disciplina_idDisciplina
            WHERE p.Status = 1 AND d.Status = 1
        `);
        
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar associações professor-disciplina:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar associações professor-disciplina',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para atualizar alunos de uma turma
app.put('/turmas/:id/alunos', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const { id } = req.params;
        const { alunosIds } = req.body;

        // Remove todos os alunos atuais da turma
        await connection.query('DELETE FROM turma_aluno WHERE turma_id = ?', [id]);

        // Adiciona os novos alunos
        if (alunosIds && alunosIds.length > 0) {
            const values = alunosIds.map(alunoId => [id, alunoId]);
            await connection.query(
                'INSERT INTO turma_aluno (turma_id, aluno_id) VALUES ?',
                [values]
            );
        }

        await connection.commit();
        res.json({ success: true, message: 'Alunos da turma atualizados com sucesso' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao atualizar alunos da turma:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao atualizar alunos da turma',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar todas as disciplinas
app.get('/disciplinas', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Query simplificada para teste
        const query = `
            SELECT 
                idDisciplina,
                Nome,
                codigo,
                Periodo,
                Status
            FROM disciplina
            ORDER BY Nome
        `;
        
        const [results] = await connection.query(query);
        console.log('Disciplinas encontradas:', results); // Debug
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar disciplinas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar disciplinas',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para cadastrar disciplina
app.post('/cadastrar-disciplina', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { Nome, codigo, Periodo, Status = 1 } = req.body;

        // Validação
        if (!Nome || !codigo || !Periodo) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }

        const query = `
            INSERT INTO disciplina 
            (Nome, codigo, Periodo, Status) 
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await connection.query(query, [Nome, codigo, Periodo, Status]);

        res.json({
            success: true,
            message: 'Disciplina cadastrada com sucesso!',
            disciplinaId: result.insertId
        });

    } catch (error) {
        console.error('Erro ao cadastrar disciplina:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao cadastrar disciplina',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
});

// Endpoint para buscar professores ativos
app.get('/professores/ativos', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const query = `
            SELECT 
                idProfessor,
                Nome,
                Email,
                Telefone,
                Titulacao,
                Status
            FROM professor
            WHERE Status = 1
            ORDER BY Nome ASC
        `;
        
        const [results] = await connection.query(query);
        res.json(results);
        
    } catch (error) {
        console.error('Erro ao buscar professores ativos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar professores ativos',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

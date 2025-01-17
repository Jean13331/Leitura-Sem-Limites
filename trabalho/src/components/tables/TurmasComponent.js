import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Stack,
    Typography,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const TurmasComponent = ({
    searchTerm,
    statusFilter,
    orderBy,
    order,
    page,
    rowsPerPage,
    handleSort,
    setSuccessMessage,
    professores,
    disciplinas,
    salas,
    handleOptionChange
}) => {
    const [turmas, setTurmas] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [selectedTurma, setSelectedTurma] = useState(null);
    const [formData, setFormData] = useState({});
    const [turmaAlunos, setTurmaAlunos] = useState([]);
    const [todosAlunos, setTodosAlunos] = useState([]);
    const [searchAlunoTerm, setSearchAlunoTerm] = useState('');
    const [professorDisciplinas, setProfessorDisciplinas] = useState([]);

    useEffect(() => {
        fetchTurmas();
        fetchAlunos();
    }, [statusFilter, orderBy, order]);

    const fetchTurmas = async () => {
        try {
            const response = await fetch(`http://localhost:3001/turmas?status=${statusFilter}&orderBy=${orderBy}&order=${order}`);
            if (!response.ok) throw new Error('Erro ao buscar turmas');
            const data = await response.json();
            setTurmas(data);
        } catch (error) {
            console.error('Erro:', error);
            setSuccessMessage('Erro ao carregar turmas');
        }
    };

    const fetchAlunos = async () => {
        try {
            const response = await fetch('http://localhost:3001/alunos/ativos');
            if (!response.ok) throw new Error('Erro ao carregar alunos');
            const data = await response.json();
            setTodosAlunos(data);
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
        }
    };

    const handleAdd = () => {
        setSelectedTurma(null);
        setFormData({
            Nome: '',
            professor_id: '',
            disciplina_id: '',
            sala_id: '',
            Ano: new Date().getFullYear(),
            Semestre: 1,
            Dia_semana: '',
            Horario_inicio: '',
            Horario_termino: '',
            Status: 1
        });
        setTurmaAlunos([]);
        setOpenModal(true);
    };

    const handleEdit = async (turma) => {
        setSelectedTurma(turma);
        setFormData({
            ...turma,
            professor_id: turma.Professor_idProfessor,
            disciplina_id: turma.Disciplina_idDisciplina,
            sala_id: turma.Sala_idSala
        });
        await carregarAlunosTurma(turma.idTurma);
        setOpenModal(true);
    };

    const handleView = async (turma) => {
        setSelectedTurma(turma);
        await carregarAlunosTurma(turma.idTurma);
        setOpenViewModal(true);
    };

    const handleDelete = async (turma) => {
        if (!window.confirm('Deseja realmente inativar esta turma?')) return;

        try {
            const response = await fetch(`http://localhost:3001/inativar-turma/${turma.idTurma}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Status: 0 })
            });

            if (!response.ok) throw new Error('Erro ao inativar turma');

            setSuccessMessage('Turma inativada com sucesso');
            fetchTurmas();
        } catch (error) {
            console.error('Erro:', error);
            setSuccessMessage('Erro ao inativar turma');
        }
    };

    const handleSave = async () => {
        try {
            if (!formData.Nome || !formData.professor_id || !formData.disciplina_id || !formData.sala_id) {
                setSuccessMessage('Por favor, preencha todos os campos obrigatórios');
                return;
            }

            const url = selectedTurma
                ? `http://localhost:3001/turmas/${selectedTurma.idTurma}`
                : 'http://localhost:3001/turmas';

            const response = await fetch(url, {
                method: selectedTurma ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    Status: 1,
                    alunos: turmaAlunos.map(aluno => aluno.idAluno)
                }),
            });

            if (!response.ok) throw new Error('Erro ao salvar turma');

            setSuccessMessage('Turma salva com sucesso');
            setOpenModal(false);
            fetchTurmas();
        } catch (error) {
            console.error('Erro:', error);
            setSuccessMessage('Erro ao salvar turma');
        }
    };

    const carregarAlunosTurma = async (turmaId) => {
        try {
            const response = await fetch(`http://localhost:3001/turmas/${turmaId}/alunos`);
            if (!response.ok) throw new Error('Erro ao buscar alunos da turma');
            const alunos = await response.json();
            setTurmaAlunos(alunos);
        } catch (error) {
            console.error('Erro:', error);
            setTurmaAlunos([]);
        }
    };

    const handleAlunoSelect = (aluno) => {
        const isSelected = turmaAlunos.some(a => a.idAluno === aluno.idAluno);
        if (isSelected) {
            setTurmaAlunos(prev => prev.filter(a => a.idAluno !== aluno.idAluno));
        } else {
            setTurmaAlunos(prev => [...prev, aluno]);
        }
    };

    const filteredTurmas = turmas.filter(turma => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            turma.Nome?.toLowerCase().includes(searchLower) ||
            turma.nomeProfessor?.toLowerCase().includes(searchLower) ||
            turma.nomeDisciplina?.toLowerCase().includes(searchLower) ||
            turma.nomeSala?.toLowerCase().includes(searchLower) ||
            turma.Dia_semana?.toLowerCase().includes(searchLower)
        );
    });

    const fetchProfessorDisciplinas = async (professorId) => {
        try {
            const response = await fetch(`http://localhost:3001/professores/${professorId}/disciplinas`);
            if (!response.ok) throw new Error('Erro ao buscar disciplinas do professor');
            const data = await response.json();
            setProfessorDisciplinas(data);
        } catch (error) {
            console.error('Erro:', error);
            setSuccessMessage('Erro ao carregar disciplinas do professor');
        }
    };

    const handleProfessorChange = (professorId) => {
        setFormData(prev => ({
            ...prev,
            professor_id: professorId,
            disciplina_id: '' // Resetar a disciplina quando trocar de professor
        }));
        fetchProfessorDisciplinas(professorId);
    };

    const handleSortClick = (field) => {
        const isAsc = orderBy === field && order === 'asc';
        handleSort(field, isAsc ? 'desc' : 'asc');
    };

    const getSortIcon = (field) => {
        if (orderBy !== field) return null;
        return order === 'asc' ? 
            <ArrowUpwardIcon fontSize="small" sx={{ ml: 1 }} /> : 
            <ArrowDownwardIcon fontSize="small" sx={{ ml: 1 }} />;
    };

    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                >
                    Adicionar Turma
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell 
                                onClick={() => handleSortClick('nome')}
                                style={{ cursor: 'pointer' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Nome
                                    {getSortIcon('nome')}
                                </Box>
                            </TableCell>
                            <TableCell>Professor</TableCell>
                            <TableCell 
                                onClick={() => handleSortClick('disciplina')}
                                style={{ cursor: 'pointer' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Disciplina
                                    {getSortIcon('disciplina')}
                                </Box>
                            </TableCell>
                            <TableCell 
                                onClick={() => handleSortClick('ano')}
                                style={{ cursor: 'pointer' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Ano
                                    {getSortIcon('ano')}
                                </Box>
                            </TableCell>
                            <TableCell>Semestre</TableCell>
                            <TableCell>Horário</TableCell>
                            <TableCell>Sala</TableCell>
                            <TableCell>Alunos</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTurmas.map((turma) => (
                            <TableRow key={turma.idTurma}>
                                <TableCell>{turma.Nome}</TableCell>
                                <TableCell>{turma.nomeProfessor}</TableCell>
                                <TableCell>{turma.nomeDisciplina}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={turma.Ano}
                                        color="primary"
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={`${turma.Semestre}º`}
                                        color="secondary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{`${turma.Dia_semana} ${turma.Horario_inicio}-${turma.Horario_termino}`}</TableCell>
                                <TableCell>{turma.nomeSala}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={turma.qtdAlunos || 0}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={turma.Status === 1 ? 'Ativa' : 'Inativa'}
                                        color={turma.Status === 1 ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" onClick={() => handleView(turma)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleEdit(turma)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(turma)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Edição/Adição */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedTurma ? 'Editar Turma' : 'Adicionar Turma'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nome da Turma"
                                    value={formData.Nome || ''}
                                    onChange={(e) => setFormData({ ...formData, Nome: e.target.value })}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Professor</InputLabel>
                                    <Select
                                        value={formData.professor_id || ''}
                                        onChange={(e) => handleProfessorChange(e.target.value)}
                                    >
                                        {professores.map((prof) => (
                                            <MenuItem key={prof.idProfessor} value={prof.idProfessor}>
                                                {prof.Nome}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Disciplina</InputLabel>
                                    <Select
                                        value={formData.disciplina_id || ''}
                                        onChange={(e) => setFormData({ ...formData, disciplina_id: e.target.value })}
                                        disabled={!formData.professor_id} // Desabilita se não houver professor selecionado
                                    >
                                        {professorDisciplinas.map((disc) => (
                                            <MenuItem key={disc.idDisciplina} value={disc.idDisciplina}>
                                                {disc.Nome}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formData.professor_id && professorDisciplinas.length === 0 && (
                                        <Typography color="error" variant="caption">
                                            Este professor não possui disciplinas cadastradas
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Ano"
                                    value={formData.Ano || new Date().getFullYear()}
                                    onChange={(e) => setFormData({ ...formData, Ano: e.target.value })}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Semestre</InputLabel>
                                    <Select
                                        value={formData.Semestre || 1}
                                        onChange={(e) => setFormData({ ...formData, Semestre: e.target.value })}
                                    >
                                        <MenuItem value={1}>1º Semestre</MenuItem>
                                        <MenuItem value={2}>2º Semestre</MenuItem>
                                        <MenuItem value={3}>3º Semestre</MenuItem>
                                        <MenuItem value={4}>4º Semestre</MenuItem>
                                        <MenuItem value={5}>5º Semestre</MenuItem>
                                        <MenuItem value={6}>6º Semestre</MenuItem>
                                        <MenuItem value={7}>7º Semestre</MenuItem>
                                        <MenuItem value={8}>8º Semestre</MenuItem>
                                        <MenuItem value={9}>9º Semestre</MenuItem>
                                        <MenuItem value={10}>10º Semestre</MenuItem>
                                        <MenuItem value={11}>Outros</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth required>
                                    <InputLabel>Dia da Semana</InputLabel>
                                    <Select
                                        value={formData.Dia_semana || ''}
                                        onChange={(e) => setFormData({ ...formData, Dia_semana: e.target.value })}
                                    >
                                        <MenuItem value="Segunda">Segunda-feira</MenuItem>
                                        <MenuItem value="Terça">Terça-feira</MenuItem>
                                        <MenuItem value="Quarta">Quarta-feira</MenuItem>
                                        <MenuItem value="Quinta">Quinta-feira</MenuItem>
                                        <MenuItem value="Sexta">Sexta-feira</MenuItem>
                                        <MenuItem value="Sexta">Sábado</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Horário Início"
                                    type="time"
                                    value={formData.Horario_inicio || ''}
                                    onChange={(e) => setFormData({ ...formData, Horario_inicio: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Horário Término"
                                    type="time"
                                    value={formData.Horario_termino || ''}
                                    onChange={(e) => setFormData({ ...formData, Horario_termino: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Sala</InputLabel>
                                    <Select
                                        value={formData.sala_id || ''}
                                        onChange={(e) => setFormData({ ...formData, sala_id: e.target.value })}
                                    >
                                        {salas.map((sala) => (
                                            <MenuItem key={sala.idSala} value={sala.idSala}>
                                                {sala.Nome}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Lista de Alunos */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Alunos
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Buscar Alunos"
                                    value={searchAlunoTerm}
                                    onChange={(e) => setSearchAlunoTerm(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    {todosAlunos
                                        .filter(aluno => 
                                            aluno.Nome.toLowerCase().includes(searchAlunoTerm.toLowerCase())
                                        )
                                        .map((aluno) => (
                                            <ListItem key={aluno.idAluno}>
                                                <ListItemText primary={aluno.Nome} />
                                                <ListItemSecondaryAction>
                                                    <Checkbox
                                                        edge="end"
                                                        onChange={() => handleAlunoSelect(aluno)}
                                                        checked={turmaAlunos.some(a => a.idAluno === aluno.idAluno)}
                                                    />
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))
                                    }
                                </List>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">Salvar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Visualização */}
            <Dialog open={openViewModal} onClose={() => setOpenViewModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography variant="h5" component="div">
                        Detalhes da Turma
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {selectedTurma && (
                        <Box sx={{ p: 2 }}>
                            <Grid container spacing={3}>
                                {/* Informações Principais */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        {selectedTurma.Nome}
                                    </Typography>
                                    <Chip 
                                        label={selectedTurma.Status === 1 ? 'Ativa' : 'Inativa'}
                                        color={selectedTurma.Status === 1 ? 'success' : 'error'}
                                        sx={{ ml: 1 }}
                                    />
                                </Grid>

                                {/* Período */}
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2">Ano</Typography>
                                                <Chip 
                                                    label={selectedTurma.Ano}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2">Semestre</Typography>
                                                <Chip 
                                                    label={`${selectedTurma.Semestre}º Semestre`}
                                                    color="secondary"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Informações do Professor */}
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Professor
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                    {selectedTurma.nomeProfessor}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Email: {selectedTurma.emailProfessor || 'Não informado'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Titulação: {selectedTurma.titulacaoProfessor || 'Não informada'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Informações da Disciplina */}
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Disciplina
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedTurma.nomeDisciplina}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Código: {selectedTurma.codigoDisciplina || 'Não informado'}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                {/* Horário e Local */}
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2">Horário</Typography>
                                                <Typography>
                                                    {selectedTurma.Dia_semana} •{' '}
                                                    {selectedTurma.Horario_inicio} - {selectedTurma.Horario_termino}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2">Sala</Typography>
                                                <Typography>{selectedTurma.nomeSala}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Alunos */}
                                <Grid item xs={12}>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                            Alunos Matriculados
                                            <Chip 
                                                label={turmaAlunos.length}
                                                color="primary"
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                        </Typography>
                                        <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
                                            {turmaAlunos.length > 0 ? (
                                                <List>
                                                    {turmaAlunos.map((aluno) => (
                                                        <ListItem key={aluno.idAluno}>
                                                            <ListItemText
                                                                primary={aluno.Nome}
                                                                secondary={
                                                                    <>
                                                                        <Typography component="span" variant="body2">
                                                                            Email: {aluno.Email}
                                                                        </Typography>
                                                                        {aluno.Telefone && (
                                                                            <>
                                                                                <br />
                                                                                <Typography component="span" variant="body2">
                                                                                    Tel: {aluno.Telefone}
                                                                                </Typography>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                }
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            ) : (
                                                <Typography color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                                                    Nenhum aluno matriculado nesta turma
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewModal(false)}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TurmasComponent; 
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    TextField, 
    Button, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Typography, 
    Checkbox, 
    FormControlLabel,
    AppBar,
    Toolbar,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    Alert,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    Switch,
    InputAdornment,
    Box,
    Pagination,
    Grid,
    Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import Header from './common/Header.js';
import Sidebar from './common/Sidebar.js';

const useTurmaState = () => {
    const [turmas, setTurmas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('Nome');
    const [order, setOrder] = useState('asc');
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const turmasFiltradas = useMemo(() => {
        return turmas.filter(turma => {
            const search = searchTerm.toLowerCase();
            return (
                (turma.Nome?.toLowerCase().includes(search)) ||
                (turma.nomeProfessor?.toLowerCase().includes(search)) ||
                (turma.nomeDisciplina?.toLowerCase().includes(search))
            );
        });
    }, [turmas, searchTerm]);

    const turmasOrdenadas = useMemo(() => {
        return [...turmasFiltradas].sort((a, b) => {
            if (orderBy === 'Nome') {
                return order === 'asc' 
                    ? (a.Nome || '').localeCompare(b.Nome || '')
                    : (b.Nome || '').localeCompare(a.Nome || '');
            }
            return 0;
        });
    }, [turmasFiltradas, orderBy, order]);

    const turmasPaginadas = useMemo(() => {
        return turmasOrdenadas.slice(
            (page - 1) * rowsPerPage,
            (page - 1) * rowsPerPage + rowsPerPage
        );
    }, [turmasOrdenadas, page, rowsPerPage]);

    return {
        turmas,
        setTurmas,
        searchTerm,
        setSearchTerm,
        orderBy,
        setOrderBy,
        order,
        setOrder,
        page,
        setPage,
        turmasPaginadas,
        totalPages: Math.ceil(turmasFiltradas.length / rowsPerPage)
    };
};

const TurmasTable = ({ turmas, onEdit, onDelete, orderBy, order, onSort, onViewAlunos }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell onClick={() => onSort('Nome')} style={{ cursor: 'pointer' }}>
                            Nome {orderBy === 'Nome' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell>Professor</TableCell>
                        <TableCell>Disciplina</TableCell>
                        <TableCell>Ano</TableCell>
                        <TableCell>Semestre</TableCell>
                        <TableCell>Horário</TableCell>
                        <TableCell>Sala</TableCell>
                        <TableCell align="center">Alunos</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Ações</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {turmas.map((turma) => (
                        <TableRow key={turma.idTurma}>
                            <TableCell>{turma.Nome}</TableCell>
                            <TableCell>{turma.nomeProfessor}</TableCell>
                            <TableCell>{turma.nomeDisciplina}</TableCell>
                            <TableCell>{turma.Ano}</TableCell>
                            <TableCell>{turma.Semestre}º</TableCell>
                            <TableCell>{`${turma.Dia_semana} ${turma.Horario_inicio}-${turma.Horario_termino}`}</TableCell>
                            <TableCell>{turma.nomeSala}</TableCell>
                            <TableCell align="center">
                                <IconButton 
                                    size="small" 
                                    onClick={() => onViewAlunos(turma)}
                                    title="Ver alunos"
                                >
                                    <VisibilityIcon />
                                </IconButton>
                                {turma.totalAlunos || 0}
                            </TableCell>
                            <TableCell align="center">
                                <Chip 
                                    label={turma.Status === 1 ? "Ativo" : "Inativo"}
                                    color={turma.Status === 1 ? "success" : "default"}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell align="center">
                                <IconButton onClick={() => onEdit(turma)} size="small" title="Editar">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => onDelete(turma)} size="small" title="Excluir">
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const CadastrarTurma = () => {
    const navigate = useNavigate();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const turmaState = useTurmaState();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTurma, setSelectedTurma] = useState(null);
    const [openNewModal, setOpenNewModal] = useState(false);
    const [newTurma, setNewTurma] = useState({
        Nome: '',
        idProfessor: '',
        idDisciplina: '',
        idSala: '',
        Dia_semana: '',
        Horario_inicio: '',
        Horario_termino: '',
        Ano: new Date().getFullYear(),
        Semestre: 1,
        Status: 1
    });
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [salas, setSalas] = useState([]);
    const [openAlunosModal, setOpenAlunosModal] = useState(false);
    const [selectedTurmaAlunos, setSelectedTurmaAlunos] = useState(null);
    const [alunosTurma, setAlunosTurma] = useState([]);
    const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
    const [selectedAlunos, setSelectedAlunos] = useState([]);
    const [searchAlunoTerm, setSearchAlunoTerm] = useState('');
    const [alunosParaNovaTurma, setAlunosParaNovaTurma] = useState([]);
    const [professorDisciplinas, setProfessorDisciplinas] = useState([]);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editingTurma, setEditingTurma] = useState(null);
    const [openGerenciarAlunosModal, setOpenGerenciarAlunosModal] = useState(false);
    const [alunosTurmaAtual, setAlunosTurmaAtual] = useState([]);
    const [alunosParaEditar, setAlunosParaEditar] = useState([]);
    const [modifiedFields, setModifiedFields] = useState({});

    // Carregar turmas
    const fetchTurmas = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3001/turmas/with-alunos-count');
            turmaState.setTurmas(response.data);
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao carregar turmas',
                severity: 'error'
            });
        }
    }, [turmaState]);

    useEffect(() => {
        fetchTurmas();
    }, [fetchTurmas]);

    // Função de edição
    const handleEdit = useCallback(async (turma) => {
        try {
            // Busca os alunos da turma
            const alunosResponse = await axios.get(`http://localhost:3001/turmas/${turma.idTurma}/alunos`);
            const alunosAtivos = await axios.get('http://localhost:3001/alunos', {
                params: { status: '1' }
            });
            
            setEditingTurma({
                ...turma,
                idProfessor: turma.Professor_idProfessor,
                idDisciplina: turma.Disciplina_idDisciplina,
                idSala: turma.Sala_idSala
            });
            setAlunosDisponiveis(alunosAtivos.data);
            setAlunosParaEditar(alunosResponse.data.map(aluno => aluno.idAluno));
            setOpenEditModal(true);
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao carregar dados da turma',
                severity: 'error'
            });
        }
    }, []);

    // Função de exclusão
    const handleDelete = useCallback(async (turma) => {
        try {
            // Confirma com o usuário antes de inativar
            if (window.confirm('Tem certeza que deseja inativar esta turma?')) {
                await axios.put(`http://localhost:3001/turma-status/${turma.idTurma}`, {
                    Status: 0  // 0 para inativo
                });
                
                setSnackbar({
                    open: true,
                    message: 'Turma inativada com sucesso',
                    severity: 'success'
                });
                fetchTurmas(); // Recarrega a lista
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao inativar turma',
                severity: 'error'
            });
        }
    }, [fetchTurmas]);

    // Função de ordenação
    const handleSort = useCallback((field) => {
        if (turmaState.orderBy === field) {
            turmaState.setOrder(turmaState.order === 'asc' ? 'desc' : 'asc');
        } else {
            turmaState.setOrderBy(field);
            turmaState.setOrder('asc');
        }
    }, [turmaState]);

    // Adicione estas funções para carregar os dados necessários
    const fetchProfessores = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3001/professores/ativos');
            setProfessores(response.data);
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
        }
    }, []);

    const fetchDisciplinas = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3001/disciplinas');
            setDisciplinas(response.data);
        } catch (error) {
            console.error('Erro ao carregar disciplinas:', error);
        }
    }, []);

    const fetchSalas = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3001/salas');
            setSalas(response.data);
        } catch (error) {
            console.error('Erro ao carregar salas:', error);
        }
    }, []);

    // Adicione esta função para buscar as associações
    const fetchProfessorDisciplinas = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3001/professor-disciplinas');
            setProfessorDisciplinas(response.data);
        } catch (error) {
            console.error('Erro ao carregar associações professor-disciplina:', error);
        }
    }, []);

    // Modifique o useEffect existente para incluir a busca das associações
    useEffect(() => {
        fetchProfessores();
        fetchDisciplinas();
        fetchSalas();
        fetchProfessorDisciplinas();
    }, [fetchProfessores, fetchDisciplinas, fetchSalas, fetchProfessorDisciplinas]);

    // Adicione este useEffect para carregar os alunos quando o modal de nova turma for aberto
    useEffect(() => {
        if (openNewModal) {
            const fetchData = async () => {
                try {
                    // Busca alunos ativos
                    const alunosResponse = await axios.get('http://localhost:3001/alunos', {
                        params: { status: '1' }
                    });
                    setAlunosDisponiveis(alunosResponse.data);

                    // Busca professores
                    const professoresResponse = await axios.get('http://localhost:3001/professores');
                    setProfessores(professoresResponse.data);

                    // Busca disciplinas
                    const disciplinasResponse = await axios.get('http://localhost:3001/disciplinas');
                    setDisciplinas(disciplinasResponse.data);

                    // Busca associações professor-disciplina
                    const profDiscResponse = await axios.get('http://localhost:3001/professor-disciplinas');
                    setProfessorDisciplinas(profDiscResponse.data);

                    // Busca salas
                    const salasResponse = await axios.get('http://localhost:3001/salas');
                    setSalas(salasResponse.data);
                } catch (error) {
                    console.error('Erro ao carregar dados:', error);
                    setSnackbar({
                        open: true,
                        message: 'Erro ao carregar dados',
                        severity: 'error'
                    });
                }
            };

            fetchData();
        }
    }, [openNewModal]);

    // Modifique a função handleSaveTurma para incluir os alunos selecionados
    const handleSaveTurma = async () => {
        // Verifica se o professor está associado à disciplina
        const professorTemDisciplina = professorDisciplinas.some(
            pd => pd.professor_id === newTurma.idProfessor && 
                 pd.disciplina_id === newTurma.idDisciplina
        );

        if (!professorTemDisciplina) {
            setSnackbar({
                open: true,
                message: 'O professor selecionado não está associado a esta disciplina',
                severity: 'error'
            });
            return;
        }

        try {
            // Primeiro, cria a turma
            const response = await axios.post('http://localhost:3001/turmas', {
                ...newTurma,
                alunos: alunosParaNovaTurma // Adiciona os IDs dos alunos selecionados
            });

            setSnackbar({
                open: true,
                message: 'Turma cadastrada com sucesso',
                severity: 'success'
            });
            setOpenNewModal(false);
            setNewTurma({
                Nome: '',
                idProfessor: '',
                idDisciplina: '',
                idSala: '',
                Dia_semana: '',
                Horario_inicio: '',
                Horario_termino: '',
                Ano: new Date().getFullYear(),
                Semestre: 1,
                Status: 1
            });
            setAlunosParaNovaTurma([]); // Limpa os alunos selecionados
            fetchTurmas();
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao cadastrar turma',
                severity: 'error'
            });
        }
    };

    const handleViewAlunos = useCallback(async (turma) => {
        try {
            const response = await axios.get(`http://localhost:3001/turmas/${turma.idTurma}/alunos`);
            setAlunosTurma(response.data);
            setSelectedTurmaAlunos(turma);
            setOpenAlunosModal(true);
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao carregar alunos da turma',
                severity: 'error'
            });
        }
    }, []);

    const fetchAlunosDisponiveis = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3001/alunos/ativos');
            setAlunosDisponiveis(response.data);
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao carregar alunos',
                severity: 'error'
            });
        }
    }, []);

    const handleAddAlunos = async (turmaId) => {
        try {
            await axios.post(`http://localhost:3001/turmas/${turmaId}/alunos`, {
                alunosIds: selectedAlunos
            });
            setSnackbar({
                open: true,
                message: 'Alunos adicionados com sucesso',
                severity: 'success'
            });
            setSelectedAlunos([]);
            fetchTurmas();
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao adicionar alunos',
                severity: 'error'
            });
        }
    };

    useEffect(() => {
        if (openAlunosModal) {
            fetchAlunosDisponiveis();
        }
    }, [openAlunosModal, fetchAlunosDisponiveis]);

    // Adicione este useMemo para filtrar as disciplinas disponíveis
    const disciplinasDisponiveis = useMemo(() => {
        if (!newTurma.idProfessor) return [];
        
        const disciplinasDoProf = professorDisciplinas
            .filter(pd => pd.professor_id === newTurma.idProfessor)
            .map(pd => pd.disciplina_id);
        
        return disciplinas.filter(disc => 
            disciplinasDoProf.includes(disc.idDisciplina)
        );
    }, [newTurma.idProfessor, professorDisciplinas, disciplinas]);

    // Modifique a função que atualiza o editingTurma
    const handleEditingTurmaChange = (field, value) => {
        setEditingTurma(prev => ({ ...prev, [field]: value }));
        setModifiedFields(prev => ({ ...prev, [field]: value }));
    };

    // Modifique a função handleSaveEdit
    const handleSaveEdit = async () => {
        try {
            // Verifica se o professor está associado à disciplina (se ambos foram modificados)
            if (modifiedFields.idProfessor && modifiedFields.idDisciplina) {
                const professorTemDisciplina = professorDisciplinas.some(
                    pd => pd.professor_id === modifiedFields.idProfessor && 
                         pd.disciplina_id === modifiedFields.idDisciplina
                );

                if (!professorTemDisciplina) {
                    setSnackbar({
                        open: true,
                        message: 'O professor selecionado não está associado a esta disciplina',
                        severity: 'error'
                    });
                    return;
                }
            }

            // Envia apenas os campos modificados
            await axios.put(`http://localhost:3001/turmas/${editingTurma.idTurma}`, modifiedFields);
            
            setSnackbar({
                open: true,
                message: 'Turma atualizada com sucesso',
                severity: 'success'
            });
            setOpenEditModal(false);
            setModifiedFields({}); // Limpa os campos modificados
            fetchTurmas();
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao atualizar turma',
                severity: 'error'
            });
        }
    };

    // Adicione esta função para buscar alunos da turma atual
    const fetchAlunosTurmaAtual = async (turmaId) => {
        try {
            const response = await axios.get(`http://localhost:3001/turmas/${turmaId}/alunos`);
            setAlunosTurmaAtual(response.data);
            setAlunosParaEditar(response.data.map(aluno => aluno.idAluno));
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao carregar alunos da turma',
                severity: 'error'
            });
        }
    };

    // Adicione esta função para salvar as alterações nos alunos
    const handleSaveAlunosEdit = async () => {
        try {
            await axios.put(`http://localhost:3001/turmas/${editingTurma.idTurma}/alunos`, {
                alunosIds: alunosParaEditar
            });
            
            setSnackbar({
                open: true,
                message: 'Alunos da turma atualizados com sucesso',
                severity: 'success'
            });
            setOpenGerenciarAlunosModal(false);
            fetchTurmas();
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao atualizar alunos da turma',
                severity: 'error'
            });
        }
    };

    return (
        <div>
            <Header 
                professorEmail={localStorage.getItem('professorEmail')} 
                toggleDrawer={() => setOpenDrawer(!openDrawer)} 
            />
            <Sidebar 
                onNavigate={navigate} 
                isOpen={openDrawer} 
                toggleDrawer={() => setOpenDrawer(!openDrawer)}
                handleLogout={() => {
                    localStorage.removeItem('professorEmail');
                    navigate('/login');
                }}
            />
            
            <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                {/* Barra de pesquisa */}
                <TextField
                    sx={{ flex: 1 }}
                    label="Buscar por turma, professor ou disciplina"
                    value={turmaState.searchTerm}
                    onChange={(e) => turmaState.setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                {/* Botão de nova turma */}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenNewModal(true)}
                >
                    Nova Turma
                </Button>
            </Box>

            {/* Tabela de Turmas */}
            <TurmasTable 
                turmas={turmaState.turmasPaginadas}
                onEdit={handleEdit}
                onDelete={handleDelete}
                orderBy={turmaState.orderBy}
                order={turmaState.order}
                onSort={handleSort}
                onViewAlunos={handleViewAlunos}
            />

            {/* Paginação */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination 
                    count={turmaState.totalPages}
                    page={turmaState.page}
                    onChange={(_, newPage) => turmaState.setPage(newPage)}
                />
            </Box>

            {/* ... seus modais existentes ... */}

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Modal de cadastro */}
            <Dialog open={openNewModal} onClose={() => setOpenNewModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Adicionar Turma</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        {/* Nome da Turma - Linha única */}
                        <TextField
                            label="Nome da Turma *"
                            fullWidth
                            value={newTurma.Nome}
                            onChange={(e) => setNewTurma(prev => ({ ...prev, Nome: e.target.value }))}
                        />

                        {/* Professor e Disciplina */}
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Professor *</InputLabel>
                                    <Select
                                        value={newTurma.idProfessor}
                                        onChange={(e) => setNewTurma(prev => ({ ...prev, idProfessor: e.target.value }))}
                                        label="Professor *"
                                    >
                                        {professores.map(prof => (
                                            <MenuItem key={prof.idProfessor} value={prof.idProfessor}>
                                                {prof.Nome}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Disciplina *</InputLabel>
                                    <Select
                                        value={newTurma.idDisciplina}
                                        onChange={(e) => setNewTurma(prev => ({ ...prev, idDisciplina: e.target.value }))}
                                        label="Disciplina *"
                                        disabled={!newTurma.idProfessor}
                                    >
                                        {disciplinasDisponiveis.map(disc => (
                                            <MenuItem key={disc.idDisciplina} value={disc.idDisciplina}>
                                                {disc.Nome}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Ano e Semestre */}
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Ano *"
                                    type="number"
                                    fullWidth
                                    value={newTurma.Ano}
                                    onChange={(e) => setNewTurma(prev => ({ ...prev, Ano: e.target.value }))}
                                    InputProps={{ inputProps: { min: 2000, max: 2100 } }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Semestre *</InputLabel>
                                    <Select
                                        value={newTurma.Semestre}
                                        onChange={(e) => setNewTurma(prev => ({ ...prev, Semestre: e.target.value }))}
                                        label="Semestre *"
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
                        </Grid>

                        {/* Horários */}
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Dia da Semana *</InputLabel>
                                    <Select
                                        value={newTurma.Dia_semana}
                                        onChange={(e) => setNewTurma(prev => ({ ...prev, Dia_semana: e.target.value }))}
                                        label="Dia da Semana *"
                                    >
                                        {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(dia => (
                                            <MenuItem key={dia} value={dia}>
                                                {dia}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Horário Início *"
                                    type="time"
                                    fullWidth
                                    value={newTurma.Horario_inicio}
                                    onChange={(e) => setNewTurma(prev => ({ ...prev, Horario_inicio: e.target.value }))}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Horário Término *"
                                    type="time"
                                    fullWidth
                                    value={newTurma.Horario_termino}
                                    onChange={(e) => setNewTurma(prev => ({ ...prev, Horario_termino: e.target.value }))}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>

                        {/* Sala */}
                        <FormControl fullWidth>
                            <InputLabel>Sala *</InputLabel>
                            <Select
                                value={newTurma.idSala}
                                onChange={(e) => setNewTurma(prev => ({ ...prev, idSala: e.target.value }))}
                                label="Sala *"
                            >
                                {salas.map(sala => (
                                    <MenuItem key={sala.idSala} value={sala.idSala}>
                                        {sala.Nome}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Seleção de Alunos */}
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>Alunos</Typography>
                        <TextField
                            fullWidth
                            label="Buscar Alunos"
                            value={searchAlunoTerm}
                            onChange={(e) => setSearchAlunoTerm(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        const todosIds = alunosDisponiveis
                                                            .filter(aluno => 
                                                                aluno.Nome.toLowerCase().includes(searchAlunoTerm.toLowerCase())
                                                            )
                                                            .map(aluno => aluno.idAluno);
                                                        setAlunosParaNovaTurma(todosIds);
                                                    } else {
                                                        setAlunosParaNovaTurma([]);
                                                    }
                                                }}
                                                checked={
                                                    alunosDisponiveis.length > 0 &&
                                                    alunosDisponiveis
                                                        .filter(aluno => 
                                                            aluno.Nome.toLowerCase().includes(searchAlunoTerm.toLowerCase())
                                                        )
                                                        .every(aluno => 
                                                            alunosParaNovaTurma.includes(aluno.idAluno)
                                                        )
                                                }
                                                indeterminate={
                                                    alunosParaNovaTurma.length > 0 &&
                                                    alunosParaNovaTurma.length < alunosDisponiveis
                                                        .filter(aluno => 
                                                            aluno.Nome.toLowerCase().includes(searchAlunoTerm.toLowerCase())
                                                        ).length
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>Nome</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Telefone</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {alunosDisponiveis
                                        .filter(aluno => 
                                            aluno.Nome.toLowerCase().includes(searchAlunoTerm.toLowerCase())
                                        )
                                        .map((aluno) => (
                                            <TableRow 
                                                key={aluno.idAluno}
                                                hover
                                                onClick={() => {
                                                    const isSelected = alunosParaNovaTurma.includes(aluno.idAluno);
                                                    setAlunosParaNovaTurma(prev => 
                                                        isSelected
                                                            ? prev.filter(id => id !== aluno.idAluno)
                                                            : prev.concat(aluno.idAluno)
                                                    );
                                                }}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={alunosParaNovaTurma.includes(aluno.idAluno)}
                                                        onChange={(e) => {
                                                            const isSelected = alunosParaNovaTurma.includes(aluno.idAluno);
                                                            setAlunosParaNovaTurma(prev => 
                                                                isSelected
                                                                    ? prev.filter(id => id !== aluno.idAluno)
                                                                    : prev.concat(aluno.idAluno)
                                                            );
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{aluno.Nome}</TableCell>
                                                <TableCell>{aluno.Email}</TableCell>
                                                <TableCell>{aluno.Telefone}</TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNewModal(false)}>Cancelar</Button>
                    <Button onClick={handleSaveTurma} variant="contained" color="primary">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Visualização de Alunos */}
            <Dialog 
                open={openAlunosModal} 
                onClose={() => setOpenAlunosModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Alunos da Turma: {selectedTurmaAlunos?.Nome}
                </DialogTitle>
                <DialogContent>
                    {/* Tabela de alunos existente */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Telefone</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {alunosTurma.length > 0 ? (
                                    alunosTurma.map((aluno) => (
                                        <TableRow key={aluno.idAluno}>
                                            <TableCell>{aluno.Nome}</TableCell>
                                            <TableCell>{aluno.Email}</TableCell>
                                            <TableCell>{aluno.Telefone}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            Nenhum aluno matriculado nesta turma
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAlunosModal(false)}>
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de edição */}
            <Dialog 
                open={openEditModal} 
                onClose={() => setOpenEditModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Editar Turma
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* Nome da Turma */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nome da Turma"
                                value={editingTurma?.Nome || ''}
                                onChange={(e) => handleEditingTurmaChange('Nome', e.target.value)}
                            />
                        </Grid>

                        {/* Professor e Disciplina */}
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Professor *</InputLabel>
                                <Select
                                    value={editingTurma?.idProfessor || ''}
                                    onChange={(e) => handleEditingTurmaChange('professor_id', e.target.value)}
                                    label="Professor *"
                                >
                                    {professores.map(prof => (
                                        <MenuItem key={prof.idProfessor} value={prof.idProfessor}>
                                            {prof.Nome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Disciplina *</InputLabel>
                                <Select
                                    value={editingTurma?.idDisciplina || ''}
                                    onChange={(e) => handleEditingTurmaChange('disciplina_id', e.target.value)}
                                    label="Disciplina *"
                                    disabled={!editingTurma?.idProfessor}
                                >
                                    {disciplinasDisponiveis.map(disc => (
                                        <MenuItem key={disc.idDisciplina} value={disc.idDisciplina}>
                                            {disc.Nome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Ano e Semestre */}
                        <Grid item xs={6}>
                            <TextField
                                label="Ano *"
                                type="number"
                                fullWidth
                                value={editingTurma?.Ano || ''}
                                onChange={(e) => handleEditingTurmaChange('Ano', e.target.value)}
                                InputProps={{ inputProps: { min: 2000, max: 2100 } }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Semestre *</InputLabel>
                                <Select
                                    value={editingTurma?.Semestre || ''}
                                    onChange={(e) => handleEditingTurmaChange('Semestre', e.target.value)}
                                    label="Semestre *"
                                >
                                    {[1,2,3,4,5,6,7,8,9,10,11].map(num => (
                                        <MenuItem key={num} value={num}>
                                            {num === 11 ? 'Outros' : `${num}º Semestre`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Horários */}
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel>Dia da Semana *</InputLabel>
                                <Select
                                    value={editingTurma?.Dia_semana || ''}
                                    onChange={(e) => handleEditingTurmaChange('Dia_semana', e.target.value)}
                                    label="Dia da Semana *"
                                >
                                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(dia => (
                                        <MenuItem key={dia} value={dia}>{dia}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="Horário Início *"
                                type="time"
                                fullWidth
                                value={editingTurma?.Horario_inicio || ''}
                                onChange={(e) => handleEditingTurmaChange('Horario_inicio', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="Horário Término *"
                                type="time"
                                fullWidth
                                value={editingTurma?.Horario_termino || ''}
                                onChange={(e) => handleEditingTurmaChange('Horario_termino', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Sala */}
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Sala *</InputLabel>
                                <Select
                                    value={editingTurma?.idSala || ''}
                                    onChange={(e) => handleEditingTurmaChange('sala_id', e.target.value)}
                                    label="Sala *"
                                >
                                    {salas.map(sala => (
                                        <MenuItem key={sala.idSala} value={sala.idSala}>
                                            {sala.Nome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditModal(false)}>Cancelar</Button>
                    <Button 
                        onClick={() => {
                            fetchAlunosTurmaAtual(editingTurma.idTurma);
                            setOpenGerenciarAlunosModal(true);
                        }}
                        color="secondary"
                    >
                        Gerenciar Alunos
                    </Button>
                    <Button onClick={handleSaveEdit} variant="contained" color="primary">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal para gerenciar alunos */}
            <Dialog
                open={openGerenciarAlunosModal}
                onClose={() => setOpenGerenciarAlunosModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Gerenciar Alunos da Turma: {editingTurma?.Nome}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Buscar Aluno"
                            value={searchAlunoTerm}
                            onChange={(e) => setSearchAlunoTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setAlunosParaEditar(alunosDisponiveis.map(a => a.idAluno));
                                                } else {
                                                    setAlunosParaEditar([]);
                                                }
                                            }}
                                            checked={alunosDisponiveis.length > 0 && 
                                                alunosDisponiveis.every(a => alunosParaEditar.includes(a.idAluno))}
                                        />
                                    </TableCell>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Telefone</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {alunosDisponiveis
                                    .filter(aluno => 
                                        aluno.Nome.toLowerCase().includes(searchAlunoTerm.toLowerCase())
                                    )
                                    .map((aluno) => (
                                        <TableRow 
                                            key={aluno.idAluno}
                                            hover
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={alunosParaEditar.includes(aluno.idAluno)}
                                                    onChange={() => {
                                                        setAlunosParaEditar(prev => 
                                                            prev.includes(aluno.idAluno)
                                                                ? prev.filter(id => id !== aluno.idAluno)
                                                                : [...prev, aluno.idAluno]
                                                        );
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{aluno.Nome}</TableCell>
                                            <TableCell>{aluno.Email}</TableCell>
                                            <TableCell>{aluno.Telefone}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenGerenciarAlunosModal(false)}>Cancelar</Button>
                    <Button onClick={handleSaveAlunosEdit} variant="contained" color="primary">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CadastrarTurma;

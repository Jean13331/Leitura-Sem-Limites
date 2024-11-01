import React, { useState, useEffect } from 'react';
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
    InputAdornment
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; // Adicione esta importação
import SearchIcon from '@mui/icons-material/Search';

const Header = ({ professorEmail, toggleDrawer }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" onClick={toggleDrawer}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6">
                    {professorEmail ? `Bem-vindo, ${professorEmail}` : 'Professor'}
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

const Sidebar = ({ onNavigate, isOpen, toggleDrawer, handleLogout }) => {
    const menuItems = [
        { text: 'Home', path: '/home-professor' },
        { text: 'Cadastrar Turma', path: '/cadastrar-turma' },
        { text: 'Cadastrar Sala', path: '/cadastrar-sala' },
        { text: 'Cadastrar Disciplina', path: '/cadastrar-disciplina' },
        { text: 'Professor', path: '/editar-professor' }
    ];

    return (
        <Drawer anchor="left" open={isOpen} onClose={toggleDrawer}>
            <List>
                {menuItems.map((item, index) => (
                    <ListItem button key={index} onClick={() => { onNavigate(item.path); toggleDrawer(); }}>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                <ListItem 
                    button 
                    onClick={handleLogout} 
                    style={{ 
                        marginTop: 'auto', 
                        backgroundColor: '#ffebee' // Fundo vermelho claro
                    }}
                >
                    <ListItemText 
                        primary="Sair" 
                        primaryTypographyProps={{ 
                            style: { color: '#d32f2f' } // Texto em vermelho
                        }} 
                    />
                </ListItem>
            </List>
        </Drawer>
    );
};

const CadastrarTurma = () => {
    const [formData, setFormData] = useState({
        Nome: '',
        Ano: '',
        Semestre: '',
        Professor_idProfessor: '',
        Disciplina_idDisciplina: '',
        Sala_idSala: '',
        turma_aluno_id: []
    });
    const [professorLogado, setProfessorLogado] = useState({
        idProfessor: '',
        Nome: '',
        Email: ''
    });
    const [disciplinasProfessor, setDisciplinasProfessor] = useState([]);
    const [salas, setSalas] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [openDrawer, setOpenDrawer] = useState(false);
    const [turmas, setTurmas] = useState([]);
    const [editingTurma, setEditingTurma] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [turmaParaExcluir, setTurmaParaExcluir] = useState(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [alunosAtivos, setAlunosAtivos] = useState({});
    const [professores, setProfessores] = useState([]);
    const [filtros, setFiltros] = useState({
        nomeTurma: '',
        professor: '',
        disciplina: '',
        status: 'todos'
    });
    const [buscarAluno, setBuscarAluno] = useState('');

    const navigate = useNavigate();
    const professorEmail = localStorage.getItem('professorEmail');

    useEffect(() => {
        const buscarProfessorLogado = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/professores?email=${professorEmail}`);
                if (response.data && response.data.length > 0) {
                    const professor = response.data[0];
                    setProfessorLogado(professor);
                    setFormData(prev => ({
                        ...prev,
                        Professor_idProfessor: professor.idProfessor,
                        nomeProfessor: professor.Nome
                    }));
                }
            } catch (error) {
                console.error('Erro ao buscar professor:', error);
            }
        };

        if (professorEmail) {
            buscarProfessorLogado();
        }
    }, [professorEmail]);

    useEffect(() => {
        fetchData();
    }, [professorEmail]);

    useEffect(() => {
        console.log('Disciplinas do professor:', disciplinasProfessor);
    }, [disciplinasProfessor]);

    useEffect(() => {
        if (editingTurma) {
            const alunosAtivosObj = {};
            if (editingTurma.alunos) {
                editingTurma.alunos.split(',').forEach(aluno => {
                    const [id] = aluno.split(':');
                    alunosAtivosObj[id.trim()] = true;
                });
            }
            setAlunosAtivos(alunosAtivosObj);
            setFormData(prev => ({
                ...prev,
                turma_aluno_id: Object.keys(alunosAtivosObj)
            }));
        }
    }, [editingTurma]);

    const fetchData = async () => {
        try {
            const professorRes = await axios.get(`http://localhost:3001/professor?email=${professorEmail}`);
            
            if (!professorRes.data?.success || !professorRes.data?.data) {
                throw new Error('Professor não encontrado');
            }

            const professor = professorRes.data.data;
            console.log('Professor logado:', professor);

            setProfessorLogado(professor);
            
            setFormData(prev => ({
                ...prev,
                Professor_idProfessor: professor.idProfessor
            }));

            const [disciplinasRes, salasRes, alunosRes, turmasRes] = await Promise.all([
                axios.get(`http://localhost:3001/disciplinas-professor?email=${professorEmail}`),
                axios.get('http://localhost:3001/salas'),
                axios.get('http://localhost:3001/alunos'),
                axios.get('http://localhost:3001/turmas')
            ]);

            setDisciplinasProfessor(disciplinasRes.data);
            setSalas(salasRes.data);
            setAlunos(alunosRes.data);
            setTurmas(turmasRes.data);
            
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setSnackbarMessage('Erro ao carregar dados');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSelectAluno = (alunoId) => {
        setFormData(prevState => {
            const newTurmaAlunoId = prevState.turma_aluno_id.includes(alunoId)
                ? prevState.turma_aluno_id.filter(id => id !== alunoId)
                : [...prevState.turma_aluno_id, alunoId];
            
            setAlunosAtivos(prev => ({
                ...prev,
                [alunoId]: newTurmaAlunoId.includes(alunoId)
            }));

            return {
                ...prevState,
                turma_aluno_id: newTurmaAlunoId
            };
        });
    };

    const handleEdit = (turma) => {
        setEditingTurma(turma);
        setFormData({
            Nome: turma.nomeTurma,
            Ano: turma.Ano || '',
            Semestre: turma.Semestre || '',
            Professor_idProfessor: turma.Professor_idProfessor,
            Disciplina_idDisciplina: turma.Disciplina_idDisciplina || '',
            Sala_idSala: turma.Sala_idSala || '',
            turma_aluno_id: turma.alunos 
                ? turma.alunos.split(',').map(aluno => {
                    const [id] = aluno.split(':');
                    return id.trim();
                  })
                : []
        });
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        resetForm();
    };

    const handleAlunoToggle = (alunoId) => {
        setAlunosAtivos(prev => ({
            ...prev,
            [alunoId]: !prev[alunoId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!professorLogado?.idProfessor) {
            setSnackbarMessage('Erro: Professor não identificado');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                Professor_idProfessor: professorLogado.idProfessor
            };

            console.log('Professor logado:', professorLogado);
            console.log('Dados sendo enviados:', dataToSend);

            const response = await axios.post('http://localhost:3001/cadastrar-turma', dataToSend);

            if (response.data.success) {
                setSnackbarMessage('Turma cadastrada com sucesso!');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                resetForm();
                fetchData();
            }
        } catch (error) {
            console.error('Erro ao cadastrar turma:', error);
            setSnackbarMessage(error.response?.data?.message || 'Erro ao cadastrar turma');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const toggleDrawer = () => {
        setOpenDrawer(!openDrawer);
    };

    const handleOpenConfirmDialog = (turma) => {
        setTurmaParaExcluir(turma);
        setOpenConfirmDialog(true);
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
        setTurmaParaExcluir(null);
    };

    const handleExcluir = async () => {
        try {
            const response = await axios.delete(`http://localhost:3001/excluir-turma/${turmaParaExcluir.idTurma}`);
            if (response.data.success) {
                setSnackbarMessage('Turma excluída com sucesso!');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                fetchData();
            }
        } catch (error) {
            console.error('Erro ao excluir turma:', error);
            setSnackbarMessage('Erro ao excluir turma. Por favor, tente novamente.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
        handleCloseConfirmDialog();
    };

    const resetForm = () => {
        if (!professorLogado?.idProfessor) {
            console.error('Professor não identificado ao resetar formulário');
            return;
        }

        setFormData({
            Nome: '',
            Ano: '',
            Semestre: '',
            Professor_idProfessor: professorLogado.idProfessor,
            nomeProfessor: professorLogado.Nome,
            emailProfessor: professorLogado.Email,
            Disciplina_idDisciplina: '',
            Sala_idSala: '',
            turma_aluno_id: []
        });
        setAlunosAtivos({});
        setEditingTurma(null);
        setEditDialogOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('professorEmail');
        navigate('/login');
    };

    const handleToggleAtivo = async (turma) => {
        try {
            const response = await axios.put(`http://localhost:3001/inativar-turma/${turma.idTurma}`, {
                ativo: !turma.ativo
            });

            if (response.data.success) {
                setSnackbarMessage(response.data.message);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                fetchData();
            }
        } catch (error) {
            console.error('Erro ao alterar status da turma:', error);
            setSnackbarMessage('Erro ao alterar status da turma');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const turmasFiltradas = turmas.filter(turma => {
        const matchNomeTurma = turma.nomeTurma?.toLowerCase().includes(filtros.nomeTurma.toLowerCase());
        const matchProfessor = turma.nomeProfessor?.toLowerCase().includes(filtros.professor.toLowerCase());
        const matchDisciplina = turma.nomeDisciplina?.toLowerCase().includes(filtros.disciplina.toLowerCase());
        const matchStatus = filtros.status === 'todos' ? true :
            (filtros.status === 'ativos' ? turma.ativo : !turma.ativo);
        
        return matchNomeTurma && matchProfessor && matchDisciplina && matchStatus;
    });

    const alunosFiltrados = alunos.filter(aluno => 
        aluno.Nome.toLowerCase().includes(buscarAluno.toLowerCase())
    );

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div>
            <Header 
                professorEmail={professorEmail} 
                toggleDrawer={toggleDrawer}
            />
            <Sidebar 
                onNavigate={navigate} 
                isOpen={openDrawer} 
                toggleDrawer={toggleDrawer}
                handleLogout={handleLogout}
            />
            <div style={{ padding: '20px' }}>
                <h1>Gerenciamento de Turmas</h1>
                
                <div style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    marginBottom: '20px',
                    backgroundColor: '#f5f5f5',
                    padding: '16px',
                    borderRadius: '8px'
                }}>
                    <TextField
                        name="nomeTurma"
                        value={filtros.nomeTurma}
                        onChange={handleFiltroChange}
                        placeholder="Filtrar por nome da turma"
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        name="professor"
                        value={filtros.professor}
                        onChange={handleFiltroChange}
                        placeholder="Filtrar por professor"
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        name="disciplina"
                        value={filtros.disciplina}
                        onChange={handleFiltroChange}
                        placeholder="Filtrar por disciplina"
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl size="small" style={{ minWidth: 120 }}>
                        <Select
                            name="status"
                            value={filtros.status}
                            onChange={handleFiltroChange}
                            displayEmpty
                        >
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="ativos">Ativos</MenuItem>
                            <MenuItem value="inativos">Inativos</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <h2>Turmas Cadastradas</h2>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Nome da Turma</strong></TableCell>
                                <TableCell><strong>Professor</strong></TableCell>
                                <TableCell><strong>Disciplina</strong></TableCell>
                                <TableCell><strong>Sala</strong></TableCell>
                                <TableCell><strong>Alunos</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {turmasFiltradas.length > 0 ? (
                                turmasFiltradas.map((turma, index) => (
                                    <TableRow 
                                        key={index}
                                        sx={{
                                            backgroundColor: turma.emailProfessor === professorEmail 
                                                ? 'rgba(144, 238, 144, 0.1)' // Verde claro para turmas do professor logado
                                                : !turma.ativo 
                                                    ? 'rgba(0, 0, 0, 0.1)' 
                                                    : 'inherit',
                                            opacity: !turma.ativo ? 0.7 : 1
                                        }}
                                    >
                                        <TableCell>{turma.nomeTurma}</TableCell>
                                        <TableCell>
                                            {turma.nomeProfessor}
                                            {turma.emailProfessor === professorEmail && (
                                                <span style={{ 
                                                    marginLeft: '5px', 
                                                    fontSize: '12px', 
                                                    color: 'green' 
                                                }}>
                                                    (Você)
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{turma.nomeDisciplina}</TableCell>
                                        <TableCell>{turma.nomeSala}</TableCell>
                                        <TableCell>
                                            {turma.alunos && turma.alunos.split(',').map((aluno, idx) => {
                                                const nomeAluno = aluno.split(':')[1] ? aluno.split(':')[1].trim() : aluno.trim();
                                                return (
                                                    <React.Fragment key={idx}>
                                                        {nomeAluno}
                                                        {idx < turma.alunos.split(',').length - 1 && <br />}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={turma.ativo}
                                                        onChange={() => handleToggleAtivo(turma)}
                                                        color="primary"
                                                    />
                                                }
                                                label={turma.ativo ? "Ativa" : "Inativa"}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(turma)}>
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography variant="subtitle1" style={{ padding: '20px' }}>
                                            Nenhuma turma encontrada com os filtros aplicados.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <div>
                    <h2>Cadastrar Nova Turma</h2>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Nome da Turma"
                            name="Nome"
                            value={formData.Nome}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Ano"
                            name="Ano"
                            type="number"
                            value={formData.Ano}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Semestre"
                            name="Semestre"
                            value={formData.Semestre}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Disciplina</InputLabel>
                            <Select
                                name="Disciplina_idDisciplina"
                                value={formData.Disciplina_idDisciplina}
                                onChange={handleInputChange}
                                required
                            >
                                {disciplinasProfessor.map(disciplina => (
                                    <MenuItem key={disciplina.idDisciplina} value={disciplina.idDisciplina}>
                                        {disciplina.Nome}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Sala</InputLabel>
                            <Select
                                name="Sala_idSala"
                                value={formData.Sala_idSala}
                                onChange={handleInputChange}
                                required
                            >
                                {salas.map(sala => (
                                    <MenuItem key={sala.idSala} value={sala.idSala}>
                                        {sala.Nome}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <div>
                            <Typography variant="subtitle1">Alunos:</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar alunos..."
                                value={buscarAluno}
                                onChange={(e) => setBuscarAluno(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                style={{ marginBottom: '16px' }}
                            />
                            <div style={{ 
                                maxHeight: '200px', 
                                overflowY: 'auto',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '8px'
                            }}>
                                {alunosFiltrados.map((aluno) => (
                                    <FormControlLabel
                                        key={aluno.idAluno}
                                        control={
                                            <Checkbox
                                                checked={alunosAtivos[aluno.idAluno] || false}
                                                onChange={() => handleSelectAluno(aluno.idAluno)}
                                            />
                                        }
                                        label={aluno.Nome}
                                        style={{ display: 'block', marginBottom: '8px' }}
                                    />
                                ))}
                            </div>
                        </div>
                        <Button type="submit" variant="contained" color="primary">
                            Cadastrar Turma
                        </Button>
                    </form>
                </div>

                <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
                    <DialogTitle>{editingTurma ? 'Editar Turma' : 'Cadastrar Nova Turma'}</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Nome da Turma"
                                name="Nome"
                                value={formData.Nome}
                                onChange={handleInputChange}
                                required
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Ano"
                                name="Ano"
                                type="number"
                                value={formData.Ano}
                                onChange={handleInputChange}
                                required
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Semestre"
                                name="Semestre"
                                value={formData.Semestre}
                                onChange={handleInputChange}
                                required
                                fullWidth
                                margin="normal"
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Disciplina</InputLabel>
                                <Select
                                    name="Disciplina_idDisciplina"
                                    value={formData.Disciplina_idDisciplina}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {disciplinasProfessor.map(disciplina => (
                                        <MenuItem key={disciplina.idDisciplina} value={disciplina.idDisciplina}>
                                            {disciplina.Nome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Sala</InputLabel>
                                <Select
                                    name="Sala_idSala"
                                    value={formData.Sala_idSala}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {salas.map(sala => (
                                        <MenuItem key={sala.idSala} value={sala.idSala}>
                                            {sala.Nome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <div>
                                <Typography variant="subtitle1" style={{ marginTop: '16px', marginBottom: '8px' }}>
                                    Alunos:
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Buscar alunos..."
                                    value={buscarAluno}
                                    onChange={(e) => setBuscarAluno(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    style={{ marginBottom: '16px' }}
                                />
                                <div style={{ 
                                    maxHeight: '200px', 
                                    overflowY: 'auto',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '8px'
                                }}>
                                    {alunosFiltrados.map((aluno) => (
                                        <div key={aluno.idAluno} style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            marginBottom: '8px' 
                                        }}>
                                            <span>{aluno.Nome}</span>
                                            <Switch
                                                checked={alunosAtivos[aluno.idAluno] || false}
                                                onChange={() => handleAlunoToggle(aluno.idAluno)}
                                                color="primary"
                                                size="small"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditDialog}>Cancelar</Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            Salvar Alterações
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openConfirmDialog}
                    onClose={handleCloseConfirmDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Confirmar exclusão"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Tem certeza que deseja excluir a turma {turmaParaExcluir?.nomeTurma}?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
                        <Button onClick={handleExcluir} autoFocus>
                            Confirmar
                        </Button>
                    </DialogActions>
                </Dialog>

                {mensagem && <Typography color="error">{mensagem}</Typography>}
                
                <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </div>
        </div>
    );
};

export default CadastrarTurma;

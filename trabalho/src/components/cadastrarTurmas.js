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
    Switch
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; // Adicione esta importação

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
    const [professorLogado, setProfessorLogado] = useState(null);
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

    const navigate = useNavigate();
    const professorEmail = localStorage.getItem('professorEmail');

    useEffect(() => {
        fetchData();
        fetchTurmas();
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
            const [professorLogadoRes, disciplinasRes, salasRes, alunosRes, professoresRes] = await Promise.all([
                axios.get(`http://localhost:3001/professores?email=${professorEmail}`),
                axios.get(`http://localhost:3001/disciplinas-professor?email=${professorEmail}`),
                axios.get('http://localhost:3001/salas'),
                axios.get('http://localhost:3001/alunos'),
                axios.get('http://localhost:3001/professores')
            ]);
            
            if (professorLogadoRes.data && professorLogadoRes.data.length > 0) {
                const professor = professorLogadoRes.data[0];
                setProfessorLogado(professor);
                setFormData(prevState => ({
                    ...prevState,
                    Professor_idProfessor: professor.idProfessor
                }));
            } else {
                setMensagem('Professor não encontrado. Por favor, fa��a login novamente.');
            }

            setDisciplinasProfessor(disciplinasRes.data);
            setSalas(salasRes.data);
            setAlunos(alunosRes.data);
            setProfessores(professoresRes.data);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setMensagem('Erro ao carregar dados. Por favor, tente novamente.');
        }
    };

    const fetchTurmas = async () => {
        try {
            const response = await axios.get('http://localhost:3001/turmas');
            setTurmas(response.data);
        } catch (error) {
            console.error('Erro ao buscar turmas:', error);
            setSnackbarMessage('Erro ao carregar turmas. Por favor, tente novamente.');
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
        try {
            let dataToSend = {
                ...formData,
                turma_aluno_id: Object.keys(alunosAtivos).filter(id => alunosAtivos[id])
            };

            // Remover campos vazios ou undefined
            Object.keys(dataToSend).forEach(key => 
                (dataToSend[key] === '' || dataToSend[key] === undefined) && delete dataToSend[key]
            );

            let response;
            if (editingTurma) {
                response = await axios.put(`http://localhost:3001/editar-turma/${editingTurma.idTurma}`, dataToSend);
            } else {
                response = await axios.post('http://localhost:3001/cadastrar-turma', dataToSend);
            }

            if (response.data.success) {
                setSnackbarMessage(editingTurma ? 'Turma atualizada com sucesso!' : 'Turma cadastrada com sucesso!');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                resetForm();
                fetchTurmas();
            } else {
                throw new Error(response.data.message || 'Erro ao processar a solicitação');
            }
        } catch (error) {
            console.error('Erro ao cadastrar/atualizar turma:', error);
            setSnackbarMessage(error.message || 'Erro ao cadastrar/atualizar turma. Por favor, tente novamente.');
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
                fetchTurmas();
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
        setFormData({
            Nome: '',
            Ano: '',
            Semestre: '',
            Professor_idProfessor: professorLogado ? professorLogado.idProfessor : '',
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
                
                {/* Seção 1: Turmas Cadastradas */}
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
                                <TableCell><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {turmas.map((turma, index) => (
                                <TableRow key={index}>
                                    <TableCell>{turma.nomeTurma}</TableCell>
                                    <TableCell>{turma.nomeProfessor}</TableCell>
                                    <TableCell>{turma.nomeDisciplina}</TableCell>
                                    <TableCell>{turma.nomeSala}</TableCell>
                                    <TableCell>
                                        {turma.alunos && turma.alunos.split(',').map((aluno, idx) => {
                                            // Remover o ID do aluno e exibir apenas o nome
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
                                        <IconButton onClick={() => handleEdit(turma)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenConfirmDialog(turma)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Seção 2: Cadastrar Nova Turma */}
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
                            {alunos.map((aluno) => (
                                <FormControlLabel
                                    key={aluno.idAluno}
                                    control={
                                        <Checkbox
                                            checked={alunosAtivos[aluno.idAluno] || false}
                                            onChange={() => handleSelectAluno(aluno.idAluno)}
                                        />
                                    }
                                    label={aluno.Nome}
                                />
                            ))}
                        </div>
                        <Button type="submit" variant="contained" color="primary">
                            Cadastrar Turma
                        </Button>
                    </form>
                </div>

                {/* Diálogo de edição */}
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
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Professor</InputLabel>
                                <Select
                                    name="Professor_idProfessor"
                                    value={formData.Professor_idProfessor}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {professores.map(professor => (
                                        <MenuItem key={professor.idProfessor} value={professor.idProfessor}>
                                            {professor.Nome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <div>
                                <Typography variant="subtitle1" style={{ marginTop: '16px', marginBottom: '8px' }}>Alunos:</Typography>
                                {alunos.map((aluno) => (
                                    <div key={aluno.idAluno} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditDialog}>Cancelar</Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            Salvar Alterações
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Diálogo de confirmação de exclusão */}
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

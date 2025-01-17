import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Alert,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    InputLabel,
    Chip,
    Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const CadastrarDisciplina = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [disciplinas, setDisciplinas] = useState([]);
    const [formData, setFormData] = useState({ 
        Nome: '',
        codigo: '',
        Periodo: ''
    });
    const [editingDisciplina, setEditingDisciplina] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [filtros, setFiltros] = useState({
        busca: '',
        status: 'todos'
    });
    const [orderBy, setOrderBy] = useState('nome');
    const [orderDirection, setOrderDirection] = useState('asc');
    const navigate = useNavigate();
    const professorEmail = localStorage.getItem('professorEmail');

    const handleLogout = () => {
        localStorage.removeItem('professorEmail');
        navigate('/login');
    };

    const menuItems = [
        { text: 'Home', path: '/home-professor' },
        { text: 'Cadastrar Turma', path: '/cadastrar-turma' },
        { text: 'Cadastrar Sala', path: '/cadastrar-sala' },
        { text: 'Cadastrar Disciplina', path: '/cadastrar-disciplina' },
        { text: 'Reativar Itens', path: '/reativar' },
        { text: 'Professor', path: '/editar-professor' },
        { text: 'Cadastrar Aluno', path: '/cadastrar-aluno' },
    ];

    useEffect(() => {
        fetchDisciplinas();
    }, []);

    const fetchDisciplinas = async () => {
        try {
            console.log('Iniciando busca de disciplinas...');
            const response = await axios.get('http://localhost:3001/disciplinas');
            console.log('Resposta completa:', response);
            console.log('Dados recebidos:', response.data);
            
            if (Array.isArray(response.data)) {
                setDisciplinas(response.data);
                console.log('Disciplinas atualizadas no estado:', response.data);
            } else {
                console.error('Resposta não é um array:', response.data);
                setDisciplinas([]);
            }
        } catch (error) {
            console.error('Erro ao buscar disciplinas:', error);
            setSnackbarMessage('Erro ao carregar disciplinas');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            setDisciplinas([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.Nome || !formData.codigo || !formData.Periodo) {
            setSnackbarMessage('Todos os campos são obrigatórios');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }

        try {
            const data = {
                Nome: formData.Nome.trim(),
                codigo: formData.codigo.trim(),
                Periodo: formData.Periodo.trim()
            };

            let response;
            if (editingDisciplina) {
                response = await axios.put(
                    `http://localhost:3001/disciplinas/${editingDisciplina.idDisciplina}`, 
                    data
                );
            } else {
                response = await axios.post('http://localhost:3001/disciplinas', data);
            }

            if (response.data.success) {
                setSnackbarMessage(
                    editingDisciplina 
                        ? 'Disciplina atualizada com sucesso!' 
                        : 'Disciplina cadastrada com sucesso!'
                );
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setOpenDialog(false);
                setFormData({ Nome: '', codigo: '', Periodo: '' });
                setEditingDisciplina(null);
                fetchDisciplinas();
            }
        } catch (error) {
            console.error('Erro:', error);
            setSnackbarMessage(
                error.response?.data?.message || 
                'Erro ao processar a solicitação'
            );
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleEdit = (disciplina) => {
        console.log('Editando disciplina:', disciplina);
        setEditingDisciplina(disciplina);
        setFormData({ 
            Nome: disciplina.Nome || '', 
            codigo: disciplina.codigo || '', 
            Periodo: disciplina.Periodo || ''
        });
        setOpenDialog(true);
    };

    const handleDelete = async (idDisciplina) => {
        if (window.confirm('Tem certeza que deseja excluir esta disciplina?')) {
            try {
                const response = await axios.delete(`http://localhost:3001/disciplinas/${idDisciplina}`);
                if (response.data.success) {
                    setSnackbarMessage('Disciplina excluída com sucesso!');
                    setSnackbarSeverity('success');
                    setOpenSnackbar(true);
                    fetchDisciplinas();
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                console.error('Erro ao excluir disciplina:', error);
                setSnackbarMessage(error.response?.data?.message || 'Erro ao excluir disciplina. Por favor, tente novamente.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            }
        }
    };

    const toggleDrawer = () => {
        setOpenDrawer(!openDrawer);
    };

    // Função para filtrar disciplinas
    const disciplinasFiltradas = disciplinas.filter(disciplina => {
        const termoBusca = filtros.busca.toLowerCase();
        const matchBusca = 
            disciplina.Nome?.toLowerCase().includes(termoBusca) ||
            disciplina.codigo?.toLowerCase().includes(termoBusca) ||
            disciplina.Periodo?.toLowerCase().includes(termoBusca);
        
        const matchStatus = filtros.status === 'todos' ? true :
            (filtros.status === 'ativos' ? disciplina.Status === 1 : disciplina.Status === 0);
        
        return matchBusca && matchStatus;
    });

    // Função para atualizar os filtros
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Função para inativar disciplina
    const handleToggleAtivo = async (disciplina) => {
        try {
            if (window.confirm('Tem certeza que deseja inativar esta disciplina?')) {
                const response = await axios.put(
                    `http://localhost:3001/inativar-disciplina/${disciplina.idDisciplina}`,
                    { ativo: false }  // Sempre inativa
                );

                if (response.data.success) {
                    setSnackbarMessage('Disciplina inativada com sucesso!');
                    setSnackbarSeverity('success');
                    setOpenSnackbar(true);
                    fetchDisciplinas();
                }
            }
        } catch (error) {
            console.error('Erro ao inativar disciplina:', error);
            setSnackbarMessage('Erro ao inativar disciplina');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    // Adicione esta função para ordenar as disciplinas
    const ordenarDisciplinas = (disciplinas) => {
        return [...disciplinas].sort((a, b) => {
            let compareValue;
            
            switch (orderBy) {
                case 'nome':
                    compareValue = a.Nome.localeCompare(b.Nome);
                    break;
                case 'codigo':
                    compareValue = a.codigo.localeCompare(b.codigo);
                    break;
                case 'periodo':
                    compareValue = a.Periodo.localeCompare(b.Periodo);
                    break;
                case 'turmas':
                    compareValue = (a.numTurmas || 0) - (b.numTurmas || 0);
                    break;
                default:
                    compareValue = 0;
            }
            
            return orderDirection === 'asc' ? compareValue : -compareValue;
        });
    };

    // Adicione esta função para alternar a ordenação
    const handleSort = (campo) => {
        if (orderBy === campo) {
            setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderBy(campo);
            setOrderDirection('asc');
        }
    };

    return (
        <div>
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

            <Drawer anchor="left" open={openDrawer} onClose={toggleDrawer}>
                <List>
                    {menuItems.map((item, index) => (
                        <ListItem button key={index} onClick={() => { navigate(item.path); toggleDrawer(); }}>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                    <ListItem 
                        button 
                        onClick={handleLogout} 
                        style={{ 
                            marginTop: 'auto', 
                            backgroundColor: '#ffebee'
                        }}
                    >
                        <ListItemText 
                            primary="Sair" 
                            primaryTypographyProps={{ 
                                style: { color: '#d32f2f' }
                            }} 
                        />
                    </ListItem>
                </List>
            </Drawer>

            <Container>
                <Paper style={{ padding: '20px', marginTop: '20px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5">
                            Gerenciamento de Disciplinas
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setFormData({ Nome: '', codigo: '', Periodo: '' });
                                setEditingDisciplina(null);
                                setOpenDialog(true);
                            }}
                        >
                            Nova Disciplina
                        </Button>
                    </Box>

                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 2, 
                            mb: 3, 
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            gap: 2,
                            flexWrap: 'wrap'
                        }}
                    >
                        <TextField
                            name="busca"
                            value={filtros.busca}
                            onChange={handleFiltroChange}
                            placeholder="Filtrar por nome, código ou período"
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={filtros.status}
                                onChange={handleFiltroChange}
                                label="Status"
                            >
                                <MenuItem value="todos">Todos</MenuItem>
                                <MenuItem value="ativos">Ativos</MenuItem>
                                <MenuItem value="inativos">Inativos</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell onClick={() => handleSort('nome')}>
                                        Nome {orderBy === 'nome' && (orderDirection === 'asc' ? '↑' : '↓')}
                                    </TableCell>
                                    <TableCell onClick={() => handleSort('codigo')}>
                                        Código {orderBy === 'codigo' && (orderDirection === 'asc' ? '↑' : '↓')}
                                    </TableCell>
                                    <TableCell onClick={() => handleSort('periodo')}>
                                        Período {orderBy === 'periodo' && (orderDirection === 'asc' ? '↑' : '↓')}
                                    </TableCell>
                                    <TableCell onClick={() => handleSort('turmas')}>
                                        Turmas {orderBy === 'turmas' && (orderDirection === 'asc' ? '↑' : '↓')}
                                    </TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {disciplinasFiltradas.length > 0 ? (
                                    ordenarDisciplinas(disciplinasFiltradas).map((disciplina) => (
                                        <TableRow 
                                            key={disciplina.idDisciplina}
                                            sx={{
                                                backgroundColor: disciplina.Status === 0 ? 'rgba(0, 0, 0, 0.1)' : 'inherit',
                                                opacity: disciplina.Status === 0 ? 0.7 : 1
                                            }}
                                        >
                                            <TableCell>{disciplina.Nome}</TableCell>
                                            <TableCell>{disciplina.codigo}</TableCell>
                                            <TableCell>{disciplina.Periodo}</TableCell>
                                            <TableCell>{disciplina.numTurmas || 0} turma(s)</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={disciplina.Status === 1 ? "Ativa" : "Inativa"}
                                                    color={disciplina.Status === 1 ? "success" : "default"}
                                                    sx={{ cursor: 'default' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEdit(disciplina)}>
                                                    <EditIcon />
                                                </IconButton>
                                                {disciplina.Status === 1 && (
                                                    <IconButton 
                                                        onClick={() => handleToggleAtivo(disciplina)}
                                                        color="error"
                                                        title="Inativar disciplina"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="subtitle1" style={{ padding: '20px' }}>
                                                Nenhuma disciplina encontrada com os filtros aplicados.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>{editingDisciplina ? 'Editar Disciplina' : 'Adicionar Nova Disciplina'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="Nome"
                        label="Nome da Disciplina"
                        type="text"
                        fullWidth
                        value={formData.Nome}
                        onChange={handleInputChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="codigo"
                        label="Código da Disciplina"
                        type="text"
                        fullWidth
                        value={formData.codigo}
                        onChange={handleInputChange}
                        required
                        helperText="Ex: MAT001, FIS002, etc. (máx. 12 caracteres)"
                        inputProps={{
                            maxLength: 12
                        }}
                    />
                    <TextField
                        margin="dense"
                        name="Periodo"
                        label="Período"
                        type="text"
                        fullWidth
                        value={formData.Periodo}
                        onChange={handleInputChange}
                        required
                        helperText="Ex: 1º, 2º, etc."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} color="primary">
                        {editingDisciplina ? 'Atualizar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default CadastrarDisciplina;

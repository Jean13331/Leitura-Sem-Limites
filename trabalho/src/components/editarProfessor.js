import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Box, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControlLabel, Switch, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const EditarProfessor = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [professor, setProfessor] = useState({ Nome: '', Email: '', Telefone: '' });
    const [openDialog, setOpenDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const navigate = useNavigate();
    const professorEmail = localStorage.getItem('professorEmail');
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [professores, setProfessores] = useState([]);
    const [filtros, setFiltros] = useState({
        busca: '',
        status: 'todos'
    });
    const [editingProfessor, setEditingProfessor] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [orderBy, setOrderBy] = useState('Nome');
    const [orderDirection, setOrderDirection] = useState('asc');

    const toggleDrawer = () => {
        setOpenDrawer(!openDrawer);
    };

    const menuItems = [
        { text: 'Home', path: '/home-professor' },
        { text: 'Cadastrar Turma', path: '/cadastrar-turma' },
        { text: 'Cadastrar Sala', path: '/cadastrar-sala' },
        { text: 'Cadastrar Disciplina', path: '/cadastrar-disciplina' },
        { text: 'Reativar Itens', path: '/reativar' },
        { text: 'Professor', path: '/editar-professor' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('professorEmail');
        navigate('/login');
    };

    useEffect(() => {
        const fetchProfessor = async () => {
            if (!professorEmail) {
                console.log('Email do professor não encontrado no localStorage'); // Debug
                navigate('/login');
                return;
            }

            try {
                console.log('Buscando professor com email:', professorEmail); // Debug
                
                const response = await axios.get(`http://localhost:3001/professor`, {
                    params: { email: professorEmail }
                });

                console.log('Resposta do servidor:', response.data); // Debug

                if (response.data.success && response.data.data) {
                    setProfessor({
                        idProfessor: response.data.data.idProfessor,
                        Nome: response.data.data.Nome,
                        Email: response.data.data.Email,
                        Telefone: response.data.data.Telefone,
                        ativo: response.data.data.ativo
                    });
                } else {
                    setSnackbarMessage('Não foi possível carregar as informações do professor.');
                    setSnackbarSeverity('error');
                    setOpenSnackbar(true);
                }
            } catch (error) {
                console.error('Erro ao buscar informações do professor:', error);
                setSnackbarMessage(
                    error.response?.data?.message || 
                    'Erro ao carregar informações do professor.'
                );
                setSnackbarSeverity('error');
                setOpenSnackbar(true);

                if (error.response?.status === 404) {
                    console.log('Professor não encontrado, redirecionando para login'); // Debug
                    navigate('/login');
                }
            }
        };

        fetchProfessor();
    }, [professorEmail, navigate]);

    useEffect(() => {
        fetchProfessores();
    }, []);

    const fetchProfessores = async () => {
        try {
            console.log('Buscando professores...'); // Debug
            const response = await axios.get('http://localhost:3001/professores');
            console.log('Resposta:', response.data); // Debug
            
            if (response.data.success) {
                setProfessores(response.data.data);
            } else {
                console.error('Erro na resposta:', response.data);
                setSnackbarMessage('Erro ao carregar lista de professores');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error('Erro ao buscar professores:', error);
            setSnackbarMessage('Erro ao carregar lista de professores');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const professoresFiltrados = professores.filter(professor => {
        const termoBusca = filtros.busca.toLowerCase();
        const matchBusca = 
            professor.Nome?.toLowerCase().includes(termoBusca) ||
            professor.Email?.toLowerCase().includes(termoBusca) ||
            professor.Telefone?.toLowerCase().includes(termoBusca);
        
        const matchStatus = filtros.status === 'todos' ? true :
            (filtros.status === 'ativos' ? professor.Status === 1 : professor.Status === 0);
        
        return matchBusca && matchStatus;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfessor(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:3001/professor', professor);
            setSnackbarMessage('Informações atualizadas com sucesso!');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (error) {
            console.error('Erro ao atualizar informações:', error);
            setSnackbarMessage('Erro ao atualizar informações.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3001/professor/${professor.idProfessor}`);
            setSnackbarMessage('Conta excluída com sucesso!');
            setSnackbarSeverity('success');
            setTimeout(() => {
                handleLogout();
            }, 2000);
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            setSnackbarMessage('Erro ao excluir conta.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
        setOpenDialog(false);
    };

    const handleToggleStatus = async (prof) => {
        try {
            const response = await axios.put(
                `http://localhost:3001/professor-status/${prof.idProfessor}`,
                { Status: prof.Status === 0 ? 1 : 0 }
            );

            if (response.data.success) {
                setSnackbarMessage(response.data.message);
                setSnackbarSeverity('success');
                fetchProfessores(); // Atualiza a lista de professores
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Erro ao alterar status do professor:', error);
            setSnackbarMessage(
                error.response?.data?.message || 
                'Erro ao alterar status do professor'
            );
            setSnackbarSeverity('error');
        } finally {
            setOpenSnackbar(true);
        }
    };

    const handleConfirmStatusChange = () => {
        setOpenStatusDialog(true);
    };

    // Adicionar verificação de status antes de permitir certas ações
    const isActionAllowed = () => {
        return professor.ativo;
    };

    const handleEdit = (prof) => {
        setEditingProfessor(prof);
        setOpenEditDialog(true);
    };

    const handleSaveEdit = async () => {
        if (!editingProfessor) return;

        try {
            const response = await axios.put(
                `http://localhost:3001/professor/${editingProfessor.idProfessor}`,
                {
                    Nome: editingProfessor.Nome,
                    Email: editingProfessor.Email,
                    Telefone: editingProfessor.Telefone
                }
            );

            if (response.data.success) {
                setSnackbarMessage('Professor atualizado com sucesso!');
                setSnackbarSeverity('success');
                fetchProfessores(); // Atualiza a lista
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Erro ao atualizar professor:', error);
            setSnackbarMessage(
                error.response?.data?.message || 
                'Erro ao atualizar professor'
            );
            setSnackbarSeverity('error');
        } finally {
            setOpenSnackbar(true);
            setOpenEditDialog(false);
            setEditingProfessor(null);
        }
    };

    const ordenarProfessores = (professores) => {
        return [...professores].sort((a, b) => {
            let compareValue;
            
            switch (orderBy) {
                case 'Nome':
                    compareValue = a.Nome.localeCompare(b.Nome);
                    break;
                case 'Email':
                    compareValue = a.Email.localeCompare(b.Email);
                    break;
                case 'Telefone':
                    compareValue = a.Telefone.localeCompare(b.Telefone);
                    break;
                case 'numDisciplinas':
                    compareValue = a.numDisciplinas - b.numDisciplinas;
                    break;
                case 'numTurmas':
                    compareValue = a.numTurmas - b.numTurmas;
                    break;
                default:
                    compareValue = 0;
            }
            
            return orderDirection === 'asc' ? compareValue : -compareValue;
        });
    };

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
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {professorEmail ? `Bem-vindo, ${professorEmail}` : 'Professor'}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer anchor="left" open={openDrawer} onClose={toggleDrawer}>
                <List>
                    {menuItems.map((item, index) => (
                        <ListItem 
                            button 
                            key={index} 
                            onClick={() => {
                                toggleDrawer();
                                navigate(item.path);
                            }}
                        >
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                    <Box flexGrow={1} />
                    <ListItem 
                        button 
                        onClick={handleLogout} 
                        style={{ 
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

            <Box sx={{ padding: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Gerenciamento de Professores
                </Typography>

                {/* Filtros */}
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 2, 
                        mb: 3, 
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}
                >
                    <TextField
                        name="busca"
                        value={filtros.busca}
                        onChange={handleFiltroChange}
                        placeholder="Pesquisar por nome, email ou telefone"
                        size="small"
                        sx={{ minWidth: 300 }}
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

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setEditingProfessor({
                                Nome: '',
                                Email: '',
                                Telefone: ''
                            });
                            setOpenEditDialog(true);
                        }}
                    >
                        Novo Professor
                    </Button>
                </Paper>

                {/* Tabela de Professores */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <div 
                                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                        onClick={() => handleSort('Nome')}
                                    >
                                        Nome
                                        {orderBy === 'Nome' && (
                                            <span style={{ marginLeft: '5px' }}>
                                                {orderDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div 
                                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                        onClick={() => handleSort('Email')}
                                    >
                                        Email
                                        {orderBy === 'Email' && (
                                            <span style={{ marginLeft: '5px' }}>
                                                {orderDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div 
                                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                        onClick={() => handleSort('Telefone')}
                                    >
                                        Telefone
                                        {orderBy === 'Telefone' && (
                                            <span style={{ marginLeft: '5px' }}>
                                                {orderDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {professoresFiltrados.length > 0 ? (
                                professoresFiltrados.map((professor) => (
                                    <TableRow 
                                        key={professor.idProfessor}
                                        sx={{ 
                                            backgroundColor: professor.Status === 0 ? '#f5f5f5' : 'inherit',
                                            '&:hover': { backgroundColor: '#f5f5f5' }
                                        }}
                                    >
                                        <TableCell>{professor.Nome}</TableCell>
                                        <TableCell>{professor.Email}</TableCell>
                                        <TableCell>{professor.Telefone}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={professor.Status === 1 ? "Ativo" : "Inativo"}
                                                color={professor.Status === 1 ? "success" : "default"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(professor)}>
                                                <EditIcon />
                                            </IconButton>
                                            {professor.Status === 1 && (
                                                <IconButton 
                                                    onClick={() => handleToggleStatus(professor)}
                                                    color="error"
                                                    title="Inativar professor"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="subtitle1" style={{ padding: '20px' }}>
                                            Nenhum professor encontrado com os filtros aplicados.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmar exclusão de conta"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>
                        Confirmar Exclusão
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openStatusDialog}
                onClose={() => setOpenStatusDialog(false)}
            >
                <DialogTitle>
                    {professor.ativo ? 'Inativar Conta' : 'Ativar Conta'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {professor.ativo 
                            ? 'Tem certeza que deseja inativar sua conta? Você não poderá criar ou gerenciar turmas enquanto estiver inativo.'
                            : 'Deseja reativar sua conta?'
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenStatusDialog(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={() => {
                            handleToggleStatus();
                            setOpenStatusDialog(false);
                        }}
                        color={professor.ativo ? "error" : "success"}
                        autoFocus
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Editar Professor</DialogTitle>
                <DialogContent>
                    {editingProfessor && (
                        <>
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Nome"
                                name="Nome"
                                value={editingProfessor.Nome}
                                onChange={(e) => setEditingProfessor({
                                    ...editingProfessor,
                                    Nome: e.target.value
                                })}
                                required
                                error={!editingProfessor.Nome}
                                helperText={!editingProfessor.Nome ? "Nome é obrigatório" : ""}
                            />
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Email"
                                name="Email"
                                value={editingProfessor.Email}
                                onChange={(e) => setEditingProfessor({
                                    ...editingProfessor,
                                    Email: e.target.value
                                })}
                                required
                                error={!editingProfessor.Email}
                                helperText={!editingProfessor.Email ? "Email é obrigatório" : ""}
                                type="email"
                            />
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Telefone"
                                name="Telefone"
                                value={editingProfessor.Telefone}
                                onChange={(e) => setEditingProfessor({
                                    ...editingProfessor,
                                    Telefone: e.target.value
                                })}
                                required
                                error={!editingProfessor.Telefone}
                                helperText={!editingProfessor.Telefone ? "Telefone é obrigatório" : ""}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
                    <Button 
                        onClick={handleSaveEdit} 
                        color="primary"
                        disabled={!editingProfessor?.Nome || !editingProfessor?.Email || !editingProfessor?.Telefone}
                    >
                        Salvar
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

export default EditarProfessor;

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
    Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CadastrarDisciplina = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [disciplinas, setDisciplinas] = useState([]);
    const [formData, setFormData] = useState({ Nome: '' });
    const [editingDisciplina, setEditingDisciplina] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
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
        { text: 'Professor', path: '/editar-professor' },
    ];

    useEffect(() => {
        fetchDisciplinas();
    }, []);

    const fetchDisciplinas = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/disciplinas-professor?email=${professorEmail}`);
            console.log('Resposta do servidor:', response.data); // Log para depuração
            setDisciplinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar disciplinas:', error);
            setSnackbarMessage('Erro ao carregar disciplinas. Por favor, tente novamente.');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editingDisciplina) {
                response = await axios.put(`http://localhost:3001/disciplinas/${editingDisciplina.idDisciplina}`, formData);
            } else {
                response = await axios.post('http://localhost:3001/disciplinas', { ...formData, professorEmail });
            }
            
            if (response.data.success) {
                setSnackbarMessage(editingDisciplina ? 'Disciplina atualizada com sucesso!' : 'Disciplina cadastrada com sucesso!');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setOpenDialog(false);
                setEditingDisciplina(null);
                setFormData({ Nome: '' });
                fetchDisciplinas();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Erro ao salvar disciplina:', error);
            setSnackbarMessage(error.response?.data?.message || 'Erro ao salvar disciplina. Por favor, tente novamente.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleEdit = (disciplina) => {
        console.log('Editando disciplina:', disciplina);
        setEditingDisciplina(disciplina);
        setFormData({ Nome: disciplina.Nome });
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
                    <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
                        Adicionar Nova Disciplina
                    </Button>

                    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Turmas</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {disciplinas.map((disciplina) => (
                                    <TableRow key={disciplina.idDisciplina}>
                                        <TableCell>{disciplina.Nome}</TableCell>
                                        <TableCell>{disciplina.Turmas || 'Nenhuma turma'}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(disciplina)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(disciplina.idDisciplina)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
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

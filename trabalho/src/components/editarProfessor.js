import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Box, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, Card, CardContent } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditarProfessor = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [professor, setProfessor] = useState({ Nome: '', Email: '', Telefone: '' });
    const [openDialog, setOpenDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const navigate = useNavigate();
    const professorEmail = localStorage.getItem('professorEmail');

    const toggleDrawer = () => {
        setOpenDrawer(!openDrawer);
    };

    const menuItems = [
        { text: 'Home', path: '/home-professor' },
        { text: 'Cadastrar Turma', path: '/cadastrar-turma' },
        { text: 'Cadastrar Sala', path: '/cadastrar-sala' },
        { text: 'Cadastrar Disciplina', path: '/cadastrar-disciplina' },
        { text: 'Editar Perfil', path: '/editar-professor' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('professorEmail');
        navigate('/login');
    };

    useEffect(() => {
        const fetchProfessor = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/professor?email=${professorEmail}`);
                setProfessor(response.data);
            } catch (error) {
                console.error('Erro ao buscar informações do professor:', error);
                setSnackbarMessage('Erro ao carregar informações do professor.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            }
        };

        fetchProfessor();
    }, [professorEmail]);

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
            setOpenSnackbar(true);
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
                    Editar Perfil
                </Typography>

                <Card style={{ marginBottom: '20px' }}>
                    <CardContent>
                        <Typography variant="h5" component="div">
                            Informações do Professor
                        </Typography>
                        <Typography variant="body1">
                            Nome: {professor.Nome}
                        </Typography>
                        <Typography variant="body1">
                            Email: {professor.Email}
                        </Typography>
                        <Typography variant="body1">
                            Telefone: {professor.Telefone}
                        </Typography>
                    </CardContent>
                </Card>

                <Typography variant="h5" gutterBottom>
                    Editar Informações do Professor
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Nome"
                        name="Nome"
                        value={professor.Nome}
                        onChange={handleInputChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        name="Email"
                        value={professor.Email}
                        onChange={handleInputChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Telefone"
                        name="Telefone"
                        value={professor.Telefone}
                        onChange={handleInputChange}
                        margin="normal"
                    />
                    <Box sx={{ mt: 2 }}>
                        <Button type="submit" variant="contained" color="primary">
                            Salvar Alterações
                        </Button>
                        <Button 
                            variant="contained" 
                            color="error" 
                            onClick={() => setOpenDialog(true)}
                            sx={{ ml: 2 }}
                        >
                            Excluir Conta
                        </Button>
                    </Box>
                </form>
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

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default EditarProfessor;

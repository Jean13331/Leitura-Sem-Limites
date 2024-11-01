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
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();
    const professorEmail = localStorage.getItem('professorEmail');
    const [openStatusDialog, setOpenStatusDialog] = useState(false);

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

    const handleToggleStatus = async () => {
        if (!professor.idProfessor) {
            console.error('ID do professor não encontrado:', professor); // Debug
            setSnackbarMessage('ID do professor não encontrado');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }

        try {
            console.log('Enviando requisição com:', { 
                id: professor.idProfessor, 
                ativo: !professor.ativo 
            }); // Debug
            
            const response = await axios.put(
                `http://localhost:3001/inativar-professor/${professor.idProfessor}`,
                { ativo: !professor.ativo }
            );

            if (response.data.success) {
                setProfessor(prev => ({
                    ...prev,
                    ativo: response.data.ativo
                }));
                setSnackbarMessage(response.data.message);
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setOpenStatusDialog(false);
            }
        } catch (error) {
            console.error('Erro ao alterar status do professor:', error);
            setSnackbarMessage(
                error.response?.data?.message || 
                'Erro ao alterar status do professor'
            );
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            setOpenStatusDialog(false);
        }
    };

    const handleConfirmStatusChange = () => {
        setOpenStatusDialog(true);
    };

    // Adicionar verificação de status antes de permitir certas ações
    const isActionAllowed = () => {
        return professor.ativo;
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
                        <Typography 
                            variant="body1" 
                            color={professor.ativo ? "success.main" : "error.main"}
                            style={{ marginTop: '10px' }}
                        >
                            Status: {professor.ativo ? 'Ativo' : 'Inativo'}
                        </Typography>
                        <Button
                            variant="contained"
                            color={professor.ativo ? "error" : "success"}
                            onClick={handleConfirmStatusChange}
                            style={{ marginTop: '10px' }}
                        >
                            {professor.ativo ? 'Inativar Conta' : 'Ativar Conta'}
                        </Button>
                        {!professor.ativo && (
                            <Typography 
                                variant="body2" 
                                color="error" 
                                style={{ marginTop: '10px' }}
                            >
                                Atenção: Com a conta inativa, você não poderá criar novas turmas 
                                ou fazer alterações no sistema.
                            </Typography>
                        )}
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
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={!isActionAllowed()}
                        >
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

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default EditarProfessor;

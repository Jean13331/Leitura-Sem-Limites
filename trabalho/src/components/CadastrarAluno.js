import React, { useState } from 'react';
import {
    Box,
    CssBaseline,
    Container,
    Typography,
    Paper,
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Button,
    TableSortLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AlunosComponent from './tables/AlunosComponent';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

const CadastrarAluno = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [orderBy, setOrderBy] = useState('Nome');
    const [order, setOrder] = useState('asc');
    const navigate = useNavigate();
    const professorEmail = localStorage.getItem('professorEmail');

    // Verifica se o usuário está logado
    React.useEffect(() => {
        // Verifica se existe o email do professor no localStorage
        if (!professorEmail) {
            navigate('/login');
            return;
        }
    }, [navigate, professorEmail]);

    const toggleDrawer = () => {
        setOpenDrawer(!openDrawer);
    };

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

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    return (
        <div style={{ display: 'flex' }}>
            <CssBaseline />
            
            {/* AppBar */}
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={toggleDrawer}
                        sx={{ marginRight: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ flexGrow: 1 }}
                    >
                        {professorEmail}
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Menu Lateral */}
            <Drawer
                anchor="left"
                open={openDrawer}
                onClose={toggleDrawer}
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Toolbar /> {/* Espaço para a AppBar */}
                <List>
                    {menuItems.map((item) => (
                        <ListItem 
                            button 
                            key={item.text}
                            onClick={() => {
                                navigate(item.path);
                                toggleDrawer();
                            }}
                        >
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                    <ListItem button onClick={handleLogout}>
                        <ListItemText primary="Sair" />
                    </ListItem>
                </List>
            </Drawer>

            {/* Conteúdo Principal */}
            <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', pt: 8 }}>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ mb: 3 }}>
                            {/* Título */}
                            <Typography variant="h5" component="h2" gutterBottom>
                                Gerenciamento de Alunos
                            </Typography>

                            {/* Botão de Cadastro e Filtros */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                {/* Botão Cadastrar */}
                                <Box>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AddIcon />}
                                        onClick={() => setOpenModal(true)}
                                    >
                                        Cadastrar Aluno
                                    </Button>
                                </Box>

                                {/* Barra de pesquisa e filtro */}
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Pesquisar por nome, email, telefone..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        InputProps={{
                                            startAdornment: (
                                                <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                                            ),
                                        }}
                                        size="small"
                                    />
                                    
                                    <FormControl sx={{ minWidth: 120 }} size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            onChange={handleStatusFilterChange}
                                            label="Status"
                                        >
                                            <MenuItem value="all">Todas</MenuItem>
                                            <MenuItem value="1">Ativas</MenuItem>
                                            <MenuItem value="0">Inativas</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            {successMessage && (
                                <Typography 
                                    color="error" 
                                    sx={{ 
                                        mt: 2,
                                        p: 1,
                                        bgcolor: 'error.light',
                                        borderRadius: 1
                                    }}
                                >
                                    {successMessage}
                                </Typography>
                            )}
                        </Box>
                        
                        <AlunosComponent
                            setSuccessMessage={setSuccessMessage}
                            searchTerm={searchTerm}
                            statusFilter={statusFilter}
                            orderBy={orderBy}
                            order={order}
                            setOrderBy={setOrderBy}
                            setOrder={setOrder}
                            openModal={openModal}
                            setOpenModal={setOpenModal}
                            onSort={handleSort}
                        />
                    </Paper>
                </Container>
            </Box>
        </div>
    );
};

export default CadastrarAluno;

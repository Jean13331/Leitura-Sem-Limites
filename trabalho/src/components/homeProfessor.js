import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, TextField, InputAdornment, FormControl, Select, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';

const ProfessorPage = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [turmas, setTurmas] = useState([]);
    const navigate = useNavigate();
    const professorEmail = localStorage.getItem('professorEmail');
    const [filtros, setFiltros] = useState({
        nomeTurma: '',
        professor: '',
        disciplina: '',
        status: 'ativos' // Por padrão, mostrar apenas turmas ativas
    });

    const toggleDrawer = () => {
        setOpenDrawer(!openDrawer);
    };

    const menuItems = [
        { text: 'Home', path: '/home-professor' },
        { text: 'Cadastrar Turma', path: '/cadastrar-turma' },
        { text: 'Cadastrar Sala', path: '/cadastrar-sala' },
        { text: 'Cadastrar Disciplina', path: '/cadastrar-disciplina' },
        { text: 'Professor', path: '/editar-professor' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('professorEmail');
        navigate('/login');
    };

    useEffect(() => {
        const fetchTurmas = async () => {
            try {
                const response = await axios.get('http://localhost:3001/turmas');
                setTurmas(response.data);
            } catch (error) {
                console.error('Erro ao buscar turmas:', error);
            }
        };

        fetchTurmas();
    }, []);

    // Função para filtrar turmas
    const turmasFiltradas = turmas.filter(turma => {
        const matchNomeTurma = turma.nomeTurma?.toLowerCase().includes(filtros.nomeTurma.toLowerCase());
        const matchProfessor = turma.nomeProfessor?.toLowerCase().includes(filtros.professor.toLowerCase());
        const matchDisciplina = turma.nomeDisciplina?.toLowerCase().includes(filtros.disciplina.toLowerCase());
        const matchStatus = filtros.status === 'todos' ? true :
            (filtros.status === 'ativos' ? turma.ativo : !turma.ativo);
        
        return matchNomeTurma && matchProfessor && matchDisciplina && matchStatus;
    });

    // Função para atualizar os filtros
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div>
            <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
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

            <div style={{ padding: '20px' }}>
                <h1>Bem-vindo à página do Professor!</h1>
                
                {/* Seção de filtros */}
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
                            <MenuItem value="todos">Todas</MenuItem>
                            <MenuItem value="ativos">Ativas</MenuItem>
                            <MenuItem value="inativos">Inativas</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <h2>Turmas:</h2>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Nome da Turma</strong></TableCell>
                                <TableCell><strong>Professor</strong></TableCell>
                                <TableCell><strong>Contato</strong></TableCell>
                                <TableCell><strong>Disciplina</strong></TableCell>
                                <TableCell><strong>Sala</strong></TableCell>
                                <TableCell><strong>Informações da Sala</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Total de Alunos</strong></TableCell>
                                <TableCell><strong>Alunos</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {turmasFiltradas.length > 0 ? (
                                turmasFiltradas.map((turma, index) => (
                                    <TableRow 
                                        key={index}
                                        sx={{
                                            backgroundColor: !turma.ativo ? 'rgba(0, 0, 0, 0.1)' : 'inherit',
                                            opacity: !turma.ativo ? 0.7 : 1
                                        }}
                                    >
                                        <TableCell>{turma.nomeTurma}</TableCell>
                                        <TableCell>{turma.nomeProfessor}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                Email: {turma.emailProfessor}<br/>
                                                Tel: {turma.telefoneProfessor}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{turma.nomeDisciplina}</TableCell>
                                        <TableCell>{turma.nomeSala}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                Capacidade: {turma.capacidadeSala}<br/>
                                                Localização: {turma.localizacaoSala}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                color={turma.ativo ? 'success.main' : 'error.main'}
                                            >
                                                {turma.ativo ? 'Ativa' : 'Inativa'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{turma.totalAlunos || 0}</TableCell>
                                        <TableCell>
                                            {turma.alunos && typeof turma.alunos === 'string' ? 
                                                turma.alunos.split(',').map((aluno, idx) => {
                                                    const [, info] = aluno.split(':');
                                                    return (
                                                        <React.Fragment key={idx}>
                                                            {info ? info.trim() : aluno.trim()}
                                                            {idx < turma.alunos.split(',').length - 1 && <br />}
                                                        </React.Fragment>
                                                    );
                                                }) 
                                                : 'Nenhum aluno'
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="subtitle1" style={{ padding: '20px' }}>
                                            Nenhuma turma encontrada com os filtros aplicados.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
};

export default ProfessorPage;

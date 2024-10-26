import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfessorPage = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [turmas, setTurmas] = useState([]);
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
                <h2>Turmas Existentes:</h2>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Nome da Turma</strong></TableCell>
                                <TableCell><strong>Professor</strong></TableCell>
                                <TableCell><strong>Disciplina</strong></TableCell>
                                <TableCell><strong>Sala</strong></TableCell>
                                <TableCell><strong>Alunos</strong></TableCell>
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
                                        {turma.alunos && typeof turma.alunos === 'string' ? 
                                            turma.alunos.split(',').map((aluno, idx) => {
                                                const [, nomeAluno] = aluno.split(':');
                                                return (
                                                    <React.Fragment key={idx}>
                                                        {nomeAluno ? nomeAluno.trim() : aluno.trim()}
                                                        {idx < turma.alunos.split(',').length - 1 && <br />}
                                                    </React.Fragment>
                                                );
                                            }) 
                                            : 'Nenhum aluno'
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
};

export default ProfessorPage;

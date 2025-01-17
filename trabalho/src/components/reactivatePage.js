import React, { useState, useEffect } from 'react';
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
    FormControl,
    Select,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Box,
    Pagination,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import RestoreIcon from '@mui/icons-material/Restore';
import SearchIcon from '@mui/icons-material/Search';

const ReactivatePage = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState('asc');

    const menuItems = [
        { text: 'Home', path: '/home-professor' },
        { text: 'Cadastrar Turma', path: '/cadastrar-turma' },
        { text: 'Cadastrar Sala', path: '/cadastrar-sala' },
        { text: 'Cadastrar Disciplina', path: '/cadastrar-disciplina' },
        { text: 'Reativar Itens', path: '/reativar' },
        { text: 'Professor', path: '/editar-professor' },
    ];

    const toggleDrawer = () => {
        setOpenDrawer(!openDrawer);
    };

    const handleOptionChange = async (event) => {
        setSelectedOption(event.target.value);
        setLoading(true);
        setTableData([]);
        
        try {
            let response;
            const option = event.target.value;
            const statusQuery = '?status=0';
            
            switch (option) {
                case 'turmas':
                    response = await fetch(`http://localhost:3001/turmas${statusQuery}`);
                    break;
                case 'salas':
                    response = await fetch(`http://localhost:3001/salas${statusQuery}`);
                    break;
                case 'disciplinas':
                    response = await fetch(`http://localhost:3001/disciplinas${statusQuery}`);
                    break;
                case 'professores':
                    response = await fetch(`http://localhost:3001/professores${statusQuery}`);
                    break;
                case 'alunos':
                    response = await fetch(`http://localhost:3001/alunos${statusQuery}`);
                    break;
                default:
                    setTableData([]);
                    setLoading(false);
                    return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Dados recebidos:', data);
            setTableData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setSuccessMessage('Erro ao carregar dados: ' + error.message);
            setTableData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async (item) => {
        try {
            const endpoint = `http://localhost:3001/${selectedOption}/${getItemId(item)}/reactivate`;
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao reativar item');
            }

            handleOptionChange({ target: { value: selectedOption } });
            setSuccessMessage(`${getItemName(selectedOption)} reativado(a) com sucesso!`);

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Erro ao reativar:', error);
            setSuccessMessage('Erro ao reativar: ' + error.message);
        }
    };

    const getItemId = (item) => {
        switch (selectedOption) {
            case 'turmas': return item.idTurma;
            case 'salas': return item.idSala;
            case 'disciplinas': return item.idDisciplina;
            case 'professores': return item.idProfessor;
            case 'alunos': return item.idAluno;
            default: return null;
        }
    };

    const getItemName = (option) => {
        switch (option) {
            case 'turmas': return 'Turma';
            case 'salas': return 'Sala';
            case 'disciplinas': return 'Disciplina';
            case 'professores': return 'Professor';
            case 'alunos': return 'Aluno';
            default: return '';
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filterData = (data) => {
        if (!searchTerm) return data;
        
        const searchTermLower = searchTerm.toLowerCase();
        
        return data.filter(item => {
            switch (selectedOption) {
                case 'turmas':
                    return (
                        item.Nome?.toLowerCase().includes(searchTermLower) ||
                        item.nomeProfessor?.toLowerCase().includes(searchTermLower) ||
                        item.nomeDisciplina?.toLowerCase().includes(searchTermLower) ||
                        item.nomeSala?.toLowerCase().includes(searchTermLower) ||
                        item.Dia_semana?.toLowerCase().includes(searchTermLower) ||
                        item.Horario_inicio?.includes(searchTerm) ||
                        item.Horario_termino?.includes(searchTerm)
                    );
                case 'salas':
                    return (
                        item.Nome?.toLowerCase().includes(searchTermLower) ||
                        item.Localizacao?.toLowerCase().includes(searchTermLower) ||
                        item.Capacidade?.toString().includes(searchTerm)
                    );
                case 'disciplinas':
                    return (
                        item.Nome?.toLowerCase().includes(searchTermLower) ||
                        item.Codigo?.toLowerCase().includes(searchTermLower) ||
                        item.Periodo?.toString().includes(searchTerm)
                    );
                case 'professores':
                    return (
                        item.Nome?.toLowerCase().includes(searchTermLower) ||
                        item.Email?.toLowerCase().includes(searchTermLower) ||
                        item.Telefone?.includes(searchTerm) ||
                        item.Titulacao?.toLowerCase().includes(searchTermLower)
                    );
                case 'alunos':
                    return (
                        item.Nome?.toLowerCase().includes(searchTermLower) ||
                        item.Email?.toLowerCase().includes(searchTermLower) ||
                        item.Telefone?.includes(searchTerm) ||
                        item.Data_Nascimento?.includes(searchTerm)
                    );
                default:
                    return false;
            }
        });
    };

    const getSearchPlaceholder = () => {
        switch (selectedOption) {
            case 'turmas':
                return "Pesquisar por nome, professor, disciplina, sala, dia, horário...";
            case 'salas':
                return "Pesquisar por nome, localização, capacidade...";
            case 'disciplinas':
                return "Pesquisar por nome, código, período...";
            case 'professores':
                return "Pesquisar por nome, email, telefone, titulação...";
            case 'alunos':
                return "Pesquisar por nome, email, telefone, data de nascimento...";
            default:
                return "Pesquisar...";
        }
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortData = (data) => {
        if (!orderBy) return data;

        return [...data].sort((a, b) => {
            let aValue = a[orderBy];
            let bValue = b[orderBy];

            if (!aValue) aValue = '';
            if (!bValue) bValue = '';

            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            if (order === 'desc') {
                return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
            } else {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            }
        });
    };

    const renderTableHeaders = () => {
        const createSortHandler = (property) => () => {
            handleSort(property);
        };

        switch (selectedOption) {
            case 'turmas':
                return (
                    <TableRow>
                        <TableCell onClick={createSortHandler('Nome')} style={{ cursor: 'pointer' }}>
                            Nome {orderBy === 'Nome' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('nomeProfessor')} style={{ cursor: 'pointer' }}>
                            Professor {orderBy === 'nomeProfessor' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('nomeDisciplina')} style={{ cursor: 'pointer' }}>
                            Disciplina {orderBy === 'nomeDisciplina' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('nomeSala')} style={{ cursor: 'pointer' }}>
                            Sala {orderBy === 'nomeSala' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('Dia_semana')} style={{ cursor: 'pointer' }}>
                            Dia/Horário {orderBy === 'Dia_semana' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell>Ações</TableCell>
                    </TableRow>
                );
            case 'salas':
                return (
                    <TableRow>
                        <TableCell onClick={createSortHandler('Nome')} style={{ cursor: 'pointer' }}>
                            Nome {orderBy === 'Nome' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('Capacidade')} style={{ cursor: 'pointer' }}>
                            Capacidade {orderBy === 'Capacidade' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('Localizacao')} style={{ cursor: 'pointer' }}>
                            Localização {orderBy === 'Localizacao' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell>Ações</TableCell>
                    </TableRow>
                );
            case 'disciplinas':
                return (
                    <TableRow>
                        <TableCell onClick={createSortHandler('Nome')} style={{ cursor: 'pointer' }}>
                            Nome {orderBy === 'Nome' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('Codigo')} style={{ cursor: 'pointer' }}>
                            Código {orderBy === 'Codigo' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('Periodo')} style={{ cursor: 'pointer' }}>
                            Período {orderBy === 'Periodo' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell>Ações</TableCell>
                    </TableRow>
                );
            case 'professores':
                return (
                    <TableRow>
                        <TableCell onClick={createSortHandler('nomeProfessor')} style={{ cursor: 'pointer' }}>
                            Nome {orderBy === 'nomeProfessor' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('Email')} style={{ cursor: 'pointer' }}>
                            Email {orderBy === 'Email' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('Telefone')} style={{ cursor: 'pointer' }}>
                            Telefone {orderBy === 'Telefone' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('Titulacao')} style={{ cursor: 'pointer' }}>
                            Titulação {orderBy === 'Titulacao' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell>Ações</TableCell>
                    </TableRow>
                );
            case 'alunos':
                return (
                    <TableRow>
                        <TableCell onClick={createSortHandler('Nome')} style={{ cursor: 'pointer' }}>
                            Nome {orderBy === 'Nome' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('Email')} style={{ cursor: 'pointer' }}>
                            Email {orderBy === 'Email' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('Telefone')} style={{ cursor: 'pointer' }}>
                            Telefone {orderBy === 'Telefone' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={createSortHandler('Data_Nascimento')} style={{ cursor: 'pointer' }}>
                            Data de Nascimento {orderBy === 'Data_Nascimento' && (order === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell>Ações</TableCell>
                    </TableRow>
                );
            default:
                return null;
        }
    };

    const renderTableRows = (data) => {
        if (!data || data.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} align="center">
                        Nenhum item inativo encontrado
                    </TableCell>
                </TableRow>
            );
        }

        return data.map((item) => {
            switch (selectedOption) {
                case 'turmas':
                    return (
                        <TableRow key={item.idTurma}>
                            <TableCell>{item.Nome}</TableCell>
                            <TableCell>{item.nomeProfessor}</TableCell>
                            <TableCell>{item.nomeDisciplina}</TableCell>
                            <TableCell>{item.nomeSala}</TableCell>
                            <TableCell>{`${item.Dia_semana} ${item.Horario_inicio}-${item.Horario_termino}`}</TableCell>
                            <TableCell>
                                <IconButton 
                                    onClick={() => handleReactivate(item)}
                                    color="primary"
                                    title="Reativar"
                                >
                                    <RestoreIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    );
                case 'salas':
                    return (
                        <TableRow key={item.idSala}>
                            <TableCell>{item.Nome}</TableCell>
                            <TableCell>{item.Capacidade}</TableCell>
                            <TableCell>{item.Localizacao}</TableCell>
                            <TableCell>
                                <IconButton 
                                    onClick={() => handleReactivate(item)}
                                    color="primary"
                                    title="Reativar"
                                >
                                    <RestoreIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    );
                case 'disciplinas':
                    return (
                        <TableRow key={item.idDisciplina}>
                            <TableCell>{item.Nome}</TableCell>
                            <TableCell>{item.Codigo}</TableCell>
                            <TableCell>{item.Periodo}</TableCell>
                            <TableCell>
                                <IconButton 
                                    onClick={() => handleReactivate(item)}
                                    color="primary"
                                    title="Reativar"
                                >
                                    <RestoreIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    );
                case 'professores':
                    return (
                        <TableRow key={item.idProfessor}>
                            <TableCell>{item.Nome}</TableCell>
                            <TableCell>{item.Email}</TableCell>
                            <TableCell>{item.Telefone}</TableCell>
                            <TableCell>{item.Titulacao}</TableCell>
                            <TableCell>
                                <IconButton 
                                    onClick={() => handleReactivate(item)}
                                    color="primary"
                                    title="Reativar"
                                >
                                    <RestoreIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    );
                case 'alunos':
                    return (
                        <TableRow key={item.idAluno}>
                            <TableCell>{item.Nome}</TableCell>
                            <TableCell>{item.Email}</TableCell>
                            <TableCell>{item.Telefone}</TableCell>
                            <TableCell>{item.Data_Nascimento}</TableCell>
                            <TableCell>
                                <IconButton 
                                    onClick={() => handleReactivate(item)}
                                    color="primary"
                                    title="Reativar"
                                >
                                    <RestoreIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    );
                default:
                    return null;
            }
        });
    };

    const handleMenuItemClick = (path) => {
        navigate(path);
        setOpenDrawer(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('professorEmail');
        navigate('/login');
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const paginateData = (data) => {
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return data.slice(startIndex, endIndex);
    };

    return (
        <div>
            <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
                <Toolbar>
                    <IconButton 
                        edge="start" 
                        color="inherit" 
                        onClick={toggleDrawer}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6">
                        Reativar Itens Inativos
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer 
                anchor="left" 
                open={openDrawer} 
                onClose={toggleDrawer}
            >
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

            <Container>
                <Paper style={{ padding: '20px', marginTop: '20px' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl sx={{ minWidth: 200 }}>
                            <Select
                                value={selectedOption}
                                onChange={handleOptionChange}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    Selecione uma opção
                                </MenuItem>
                                <MenuItem value="turmas">Turmas Inativas</MenuItem>
                                <MenuItem value="salas">Salas Inativas</MenuItem>
                                <MenuItem value="disciplinas">Disciplinas Inativas</MenuItem>
                                <MenuItem value="professores">Professores Inativos</MenuItem>
                                <MenuItem value="alunos">Alunos Inativos</MenuItem>
                            </Select>
                        </FormControl>

                        {selectedOption && (
                            <TextField
                                fullWidth
                                placeholder={getSearchPlaceholder()}
                                value={searchTerm}
                                onChange={handleSearch}
                                InputProps={{
                                    startAdornment: (
                                        <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                                    ),
                                }}
                            />
                        )}
                    </Stack>

                    {selectedOption && (
                        <>
                            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                                <Table>
                                    <TableHead>
                                        {renderTableHeaders()}
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    Carregando...
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            renderTableRows(paginateData(sortData(filterData(tableData))))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {tableData.length > 0 && (
                                <Box 
                                    display="flex" 
                                    justifyContent="center" 
                                    padding={2}
                                >
                                    <Pagination
                                        count={Math.ceil(filterData(tableData).length / rowsPerPage)}
                                        page={page}
                                        onChange={handlePageChange}
                                        color="primary"
                                        showFirstButton
                                        showLastButton
                                    />
                                </Box>
                            )}
                        </>
                    )}

                    {successMessage && (
                        <Typography 
                            color="success" 
                            align="center" 
                            style={{ 
                                marginTop: '10px',
                                padding: '10px',
                                backgroundColor: '#e8f5e9',
                                borderRadius: '4px'
                            }}
                        >
                            {successMessage}
                        </Typography>
                    )}
                </Paper>
            </Container>
        </div>
    );
};

export default ReactivatePage; 
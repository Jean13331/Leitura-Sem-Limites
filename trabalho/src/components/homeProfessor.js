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
    Box,
    TextField,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Pagination,
    Chip,
    InputLabel,
    Grid,
    Checkbox,
    CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import TurmasComponent from './tables/TurmasComponent';
import SalasComponent from './tables/SalasComponent';
import DisciplinasComponent from './tables/DisciplinasComponent';
import ProfessoresComponent from './tables/ProfessoresComponent';
import AlunosComponent from './tables/AlunosComponent';

const ProfessorPage = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const navigate = useNavigate();
    const professorEmail = localStorage.getItem('professorEmail');
    const [searchTerm, setSearchTerm] = useState('');
    const [tableData, setTableData] = useState([]);

    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [salas, setSalas] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [professorId, setProfessorId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [orderBy, setOrderBy] = useState('nome');
    const [order, setOrder] = useState('asc');
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [searchAlunoTerm, setSearchAlunoTerm] = useState('');
    const [alunosSearchResults, setAlunosSearchResults] = useState([]);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [selectedTurma, setSelectedTurma] = useState(null);
    const [turmaAlunos, setTurmaAlunos] = useState([]);
    const [todosAlunos, setTodosAlunos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openAlunoModal, setOpenAlunoModal] = useState(false);

    const menuItems = [
        { text: 'Home', path: '/home-professor' },
        { text: 'Cadastrar Turma', path: '/cadastrar-turma' },
        { text: 'Cadastrar Sala', path: '/cadastrar-sala' },
        { text: 'Cadastrar Disciplina', path: '/cadastrar-disciplina' },
        { text: 'Reativar Itens', path: '/reativar' },
        { text: 'Professor', path: '/editar-professor' },
        { text: 'Cadastrar Aluno', path: '/cadastrar-aluno' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('professorEmail');
        navigate('/login');
    };

    const toggleDrawer = () => {
        setOpenDrawer(!openDrawer);
    };

    const handleOptionChange = async (event) => {
        const option = event.target.value;
        setSelectedOption(option);
        setLoading(true);
        setTableData([]);

        try {
            let response;
            switch (option) {
                case 'professores':
                    response = await fetch('http://localhost:3001/professores');
                    break;
                // ... outros casos ...
            }

            if (!response.ok) {
                throw new Error('Erro ao carregar dados');
            }

            const data = await response.json();
            console.log('Dados carregados:', data); // Debug
            setTableData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro:', error);
            setSuccessMessage('Erro ao carregar dados: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filterData = (data) => {
        if (!Array.isArray(data)) {
            console.error('Data não é um array:', data);
            return [];
        }

        return data.filter(item => {
            const matchesSearch = searchTerm.toLowerCase().split(' ').every(term => {
                switch (selectedOption) {
                    case 'disciplinas':
                        return (
                            item.Nome?.toLowerCase().includes(term) ||
                            item.codigo?.toLowerCase().includes(term) ||
                            item.Periodo?.toLowerCase().includes(term)
                        );
                    case 'professores':
                        return (
                            item.Nome?.toLowerCase().includes(term) ||
                            item.Email?.toLowerCase().includes(term) ||
                            item.Telefone?.toLowerCase().includes(term)
                        );
                    // ... outros casos ...
                    default:
                        return true;
                }
            });

            const matchesStatus = statusFilter === 'todos' 
                ? true 
                : statusFilter === 'ativos' 
                    ? item.Status === 1 
                    : item.Status === 0;

            return matchesSearch && matchesStatus;
        });
    };

    const handleEdit = async (item) => {
        switch (selectedOption) {
            case 'disciplinas':
                setFormData({
                    idDisciplina: item.idDisciplina,
                    Nome: item.Nome,
                    codigo: item.codigo,
                    Periodo: item.Periodo,
                    Status: item.Status.toString()
                });
                break;
            case 'turmas':
                setSelectedTurma(item);
                setFormData({
                    ...item,
                    professor_id: item.Professor_idProfessor,
                    disciplina_id: item.Disciplina_idDisciplina,
                    sala_id: item.Sala_idSala
                });
                await carregarAlunosTurma(item.idTurma);
                break;
            // ... outros casos ...
        }
        setOpenModal(true);
    };

    const handleAdd = () => {
        switch (selectedOption) {
            case 'disciplinas':
                setFormData({
                    Nome: '',
                    codigo: '',
                    Periodo: '',
                    Status: '1'
                });
                break;
            case 'turmas':
                setFormData({
                    Nome: '',
                    professor_id: '',
                    disciplina_id: '',
                    sala_id: '',
                    Dia_semana: '',
                    Horario_inicio: '',
                    Horario_termino: '',
                    Ano: new Date().getFullYear(),
                    Semestre: 1,
                    Status: '1'
                });
                setTurmaAlunos([]);
                break;
            // ... outros casos ...
        }
        setSearchAlunoTerm('');
        setAlunosSearchResults([]);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFormData({});
    };

    const handleFormChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleSave = async () => {
        try {
            switch (selectedOption) {
                case 'disciplinas':
    // Validação específica para disciplinas
    if (!formData.Nome || !formData.codigo || !formData.Periodo) {
        setSuccessMessage('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    // Define a URL para criação/edição
    const disciplinaUrl = formData.idDisciplina 
        ? `http://localhost:3001/home-professor/disciplinas/${formData.idDisciplina}` // Para edição (PUT)
        : 'http://localhost:3001/disciplinas'; // Para criação (POST)

    const disciplinaData = {
        Nome: formData.Nome,
        codigo: formData.codigo,
        Periodo: formData.Periodo,
        Status: formData.Status || 1, // Status padrão como 1 (ativo)
    };

    console.log('URL chamada:', disciplinaUrl);
    console.log('Dados enviados:', disciplinaData);

    try {
        const response = await fetch(disciplinaUrl, {
            method: formData.idDisciplina ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(disciplinaData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro ao salvar disciplina:', errorData);
            throw new Error(errorData.message || 'Erro ao salvar disciplina');
        }

        const result = await response.json();
        setSuccessMessage(result.message || 'Disciplina salva com sucesso');
        handleCloseModal();

        // Recarregar lista de disciplinas
        const disciplinasResponse = await fetch('http://localhost:3001/home-professor/disciplinas');
        const disciplinasData = await disciplinasResponse.json();
        setTableData(disciplinasData);
    } catch (error) {
        console.error('Erro ao salvar disciplina:', error);
        setSuccessMessage('Erro ao salvar a disciplina. Tente novamente.');
    }
    break;



                // ... outros casos ...
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            setSuccessMessage(`Erro ao salvar: ${error.message}`);
        }
    };

    const handleSort = (column) => {
        const isAsc = orderBy === column && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(column);
        handleOptionChange({ target: { value: selectedOption } });
    };

    const sortData = (data) => {
        if (!orderBy || !data) return data;

        return [...data].sort((a, b) => {
            let valueA, valueB;

            switch (selectedOption) {
                case 'professores':
                    switch (orderBy) {
                        case 'Nome':
                            valueA = a.Nome?.toLowerCase() || '';
                            valueB = b.Nome?.toLowerCase() || '';
                            break;
                        case 'Email':
                            valueA = a.Email?.toLowerCase() || '';
                            valueB = b.Email?.toLowerCase() || '';
                            break;
                        default:
                            return 0;
                    }
                    break;
                // ... outros casos
            }

            if (valueA < valueB) return order === 'asc' ? -1 : 1;
            if (valueA > valueB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const renderTableHeader = () => {
        switch (selectedOption) {
            case 'turmas':
                return (
                    <TableRow>
                        <TableCell 
                            sx={{ 
                                fontWeight: 'bold', 
                                backgroundColor: '#f5f5f5',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleSort('nome')}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Turma
                                {orderBy === 'nome' && (
                                    <span style={{ marginLeft: '5px' }}>
                                        {order === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Professor</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Disciplina</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Ano</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Semestre</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Horário</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Sala</TableCell>
                        <TableCell 
                            sx={{ 
                                fontWeight: 'bold', 
                                backgroundColor: '#f5f5f5',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleSort('qtdAlunos')}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Alunos
                                {orderBy === 'qtdAlunos' && (
                                    <span style={{ marginLeft: '5px' }}>
                                        {order === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Ações</TableCell>
                    </TableRow>
                );
            case 'salas':
                return (
                    <TableRow>
                        <TableCell 
                            sx={{ 
                                fontWeight: 'bold', 
                                backgroundColor: '#f5f5f5',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleSort('nome')}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Nome
                                {orderBy === 'nome' && (
                                    <span style={{ marginLeft: '5px' }}>
                                        {order === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Localização</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Capacidade</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Ações</TableCell>
                    </TableRow>
                );
            case 'disciplinas':
                return (
                    <TableRow>
                        <TableCell 
                            sx={{ 
                                fontWeight: 'bold', 
                                backgroundColor: '#f5f5f5',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleSort('nome')}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Nome
                                {orderBy === 'nome' && (
                                    <span style={{ marginLeft: '5px' }}>
                                        {order === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Código</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Período</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Ações</TableCell>
                    </TableRow>
                );
            case 'professores':
                return (
                    <TableRow>
                        <TableCell 
                            sx={{ 
                                fontWeight: 'bold', 
                                backgroundColor: '#f5f5f5',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleSort('nome')}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Nome
                                {orderBy === 'nome' && (
                                    <span style={{ marginLeft: '5px' }}>
                                        {order === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Telefone</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Ações</TableCell>
                    </TableRow>
                );
        }
    };

    const renderTableRows = (data) => {
        switch (selectedOption) {
            case 'turmas':
                return data.map((turma) => (
                    <TableRow 
                        key={turma.idTurma}
                        sx={{ 
                            '&:hover': { 
                                backgroundColor: '#f8f8f8',
                                cursor: 'pointer'
                            }
                        }}
                    >
                        <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {turma.Nome}
                            </Typography>
                        </TableCell>
                        <TableCell>{turma.nomeProfessor || '-'}</TableCell>
                        <TableCell>{turma.nomeDisciplina || '-'}</TableCell>
                        <TableCell>
                            <Chip
                                label={turma.Ano}
                                size="small"
                                sx={{ backgroundColor: '#e3f2fd' }}
                            />
                        </TableCell>
                        <TableCell>
                            <Chip
                                label={`${turma.Semestre}º`}
                                size="small"
                                sx={{ backgroundColor: '#e3f2fd' }}
                            />
                        </TableCell>
                        <TableCell>
                            {turma.Dia_semana && turma.Horario_inicio && turma.Horario_termino ? (
                                <Box>
                                    <Typography variant="body2" color="textSecondary">
                                        {turma.Dia_semana}
                                    </Typography>
                                    <Typography variant="body2">
                                        {`${turma.Horario_inicio} - ${turma.Horario_termino}`}
                                    </Typography>
                                </Box>
                            ) : '-'}
                        </TableCell>
                        <TableCell>{turma.nomeSala || '-'}</TableCell>
                        <TableCell>
                            <Chip
                                label={turma.qtdAlunos || '0'}
                                size="small"
                                color="primary"
                                sx={{ minWidth: '40px' }}
                            />
                        </TableCell>
                        <TableCell>
                            <Chip 
                                label={turma.Status === 1 ? 'Ativa' : 'Inativa'}
                                color={turma.Status === 1 ? 'success' : 'error'}
                                size="small"
                                sx={{ minWidth: '80px' }}
                            />
                        </TableCell>
                        <TableCell>
                            <Stack direction="row" spacing={1}>
                                <IconButton onClick={() => handleOpenViewModal(turma)}>
                                    <VisibilityIcon />
                                </IconButton>
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(turma);
                                    }}
                                    sx={{ color: 'info.main' }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleInactivate(turma.idTurma);
                                    }}
                                    sx={{ color: 'error.main' }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </TableCell>
                    </TableRow>
                ));
            case 'salas':
                return data.map((sala) => (
                    <TableRow 
                        key={sala.idSala}
                        sx={{ 
                            '&:hover': { 
                                backgroundColor: '#f8f8f8',
                                cursor: 'pointer'
                            }
                        }}
                    >
                        <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {sala.Nome}
                            </Typography>
                        </TableCell>
                        <TableCell>{sala.Localizacao || '-'}</TableCell>
                        <TableCell>
                            <Chip
                                label={sala.Capacidade}
                                size="small"
                                color="primary"
                                sx={{ minWidth: '40px' }}
                            />
                        </TableCell>
                        <TableCell>
                            <Chip 
                                label={sala.Status === 1 ? 'Ativa' : 'Inativa'}
                                color={sala.Status === 1 ? 'success' : 'error'}
                                size="small"
                                sx={{ minWidth: '80px' }}
                            />
                        </TableCell>
                        <TableCell>
                            <Stack direction="row" spacing={1}>
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(sala);
                                    }}
                                    sx={{ color: 'info.main' }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(sala);
                                    }}
                                    sx={{ color: 'error.main' }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </TableCell>
                    </TableRow>
                ));
            case 'disciplinas':
                return data.map((disciplina) => (
                    <TableRow 
                        key={disciplina.idDisciplina}
                        sx={{ 
                            '&:hover': { 
                                backgroundColor: '#f8f8f8',
                                cursor: 'pointer'
                            }
                        }}
                    >
                        <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {disciplina.Nome}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Chip
                                label={disciplina.Codigo}
                                size="small"
                                sx={{ backgroundColor: '#e3f2fd' }}
                            />
                        </TableCell>
                        <TableCell>{disciplina.Periodo}º Período</TableCell>
                        <TableCell>
                            <Chip 
                                label={disciplina.Status === 1 ? 'Ativa' : 'Inativa'}
                                color={disciplina.Status === 1 ? 'success' : 'error'}
                                size="small"
                                sx={{ minWidth: '80px' }}
                            />
                        </TableCell>
                        <TableCell>
                            <Stack direction="row" spacing={1}>
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(disciplina);
                                    }}
                                    sx={{ color: 'info.main' }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(disciplina);
                                    }}
                                    sx={{ color: 'error.main' }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </TableCell>
                    </TableRow>
                ));
            case 'professores':
                return data.map((professor) => (
                    <TableRow 
                        key={professor.idProfessor}
                        sx={{ 
                            '&:hover': { 
                                backgroundColor: '#f8f8f8',
                                cursor: 'pointer'
                            }
                        }}
                    >
                        <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {professor.Nome}
                            </Typography>
                        </TableCell>
                        <TableCell>{professor.Email}</TableCell>
                        <TableCell>{professor.Telefone || '-'}</TableCell>
                        <TableCell>
                            <Chip 
                                label={professor.Status === 1 ? 'Ativo' : 'Inativo'}
                                color={professor.Status === 1 ? 'success' : 'error'}
                                size="small"
                                sx={{ minWidth: '80px' }}
                            />
                        </TableCell>
                        <TableCell>
                            <Stack direction="row" spacing={1}>
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(professor);
                                    }}
                                    sx={{ color: 'info.main' }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(professor);
                                    }}
                                    sx={{ color: 'error.main' }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </TableCell>
                    </TableRow>
                ));
        }
    };

    const loadSelectData = async () => {
        try {
            if (selectedOption === 'turmas') {
                const [profResponse, discResponse, salaResponse] = await Promise.all([
                    fetch('http://localhost:3001/professores'),
                    fetch('http://localhost:3001/disciplinas'),
                    fetch('http://localhost:3001/salas')
                ]);
                
                const profsData = await profResponse.json();
                const discsData = await discResponse.json();
                const salasData = await salaResponse.json();
                
                setProfessores(Array.isArray(profsData) ? profsData : []);
                setDisciplinas(Array.isArray(discsData) ? discsData : []);
                setSalas(Array.isArray(salasData) ? salasData : []);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setProfessores([]);
            setDisciplinas([]);
            setSalas([]);
        }
    };

    const searchAlunos = async (term) => {
        try {
            if (term.length < 3) return; // Só busca se tiver 3 ou mais caracteres
            
            const response = await fetch(`http://localhost:3001/alunos/search?term=${encodeURIComponent(term)}`);
            if (!response.ok) throw new Error('Erro ao buscar alunos');
            
            const data = await response.json();
            setAlunosSearchResults(data);
        } catch (error) {
            console.error('Erro ao buscar alunos:', error);
            setAlunosSearchResults([]);
        }
    };

    const carregarTodosAlunos = async () => {
        try {
            const response = await fetch('http://localhost:3001/alunos/ativos');
            if (!response.ok) throw new Error('Erro ao carregar alunos');
            const data = await response.json();
            setTodosAlunos(data);
            setAlunosSearchResults(data); // Inicialmente mostra todos os alunos
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            setTodosAlunos([]);
            setAlunosSearchResults([]);
        }
    };

    const handleSearchAluno = async (event) => {
        const searchTerm = event.target.value;
        setSearchAlunoTerm(searchTerm);

        if (!formData.idTurma) return;

        try {
            // Se o termo de busca estiver vazio, busca todos os alunos disponíveis
            const response = await fetch(
                `http://localhost:3001/alunos/buscar?termo=${searchTerm || ''}&turmaId=${formData.idTurma}`
            );
            
            if (!response.ok) {
                throw new Error('Erro ao buscar alunos');
            }
            
            const data = await response.json();
            setAlunosSearchResults(data);
        } catch (error) {
            console.error('Erro na busca de alunos:', error);
            setAlunosSearchResults([]);
        }
    };

    const handleRemoveAluno = async (alunoId) => {
        if (!alunoId || !formData.idTurma) {
            console.error('ID do aluno ou da turma não definido');
            setSuccessMessage('Erro: Dados inválidos para remover aluno');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:3001/alunos/${alunoId}/turma/${formData.idTurma}`,
                { method: 'DELETE' }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao remover aluno');
            }

            // Atualiza a lista de alunos após remover
            setTurmaAlunos(prev => prev.filter(aluno => aluno.idAluno !== alunoId));
            setSuccessMessage('Aluno removido com sucesso!');
        } catch (error) {
            console.error('Erro:', error);
            setSuccessMessage(error.message);
        }
    };

    const renderFormFields = () => {
        switch (selectedOption) {
            case 'disciplinas':
                return (
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            label="Nome"
                            name="Nome"
                            value={formData.Nome || ''}
                            onChange={handleFormChange}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Código"
                            name="codigo"
                            value={formData.codigo || ''}
                            onChange={handleFormChange}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Período"
                            name="Periodo"
                            value={formData.Periodo || ''}
                            onChange={handleFormChange}
                            required
                        />
                        <FormControl fullWidth>
                            <Select
                                value={formData.Status || '1'}
                                onChange={handleFormChange}
                                name="Status"
                                displayEmpty
                                label="Status"
                            >
                                <MenuItem value="1">Ativa</MenuItem>
                                <MenuItem value="0">Inativa</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                );
            // ... outros casos ...
        }
    };

    const handleStatusFilterChange = async (event) => {
        const newStatus = event.target.value;
        setStatusFilter(newStatus);
        
        try {
            let response;
            const statusQuery = newStatus === 'all' ? '' : `?status=${newStatus}`;
            
            switch (selectedOption) {
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
                    return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                setTableData(data);
            } else {
                console.error('Dados recebidos não são um array:', data);
                setTableData([]);
            }
        } catch (error) {
            console.error('Erro ao filtrar dados:', error);
            setSuccessMessage('Erro ao filtrar dados: ' + error.message);
            setTableData([]);
        }
    };

    const handleInactivate = async (turmaId) => {
        if (!window.confirm('Tem certeza que deseja inativar esta turma?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/inativar-turma/${turmaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 0 })
            });

            if (!response.ok) {
                throw new Error('Erro ao inativar turma');
            }

            const result = await response.json();
            setSuccessMessage(result.message || 'Turma inativada com sucesso');
            
            // Recarrega a lista de turmas
            handleOptionChange({ target: { value: 'turmas' } });
        } catch (error) {
            console.error('Erro ao inativar turma:', error);
            setSuccessMessage(`Erro ao inativar turma: ${error.message}`);
        }
    };

    const handleDelete = async (item) => {

        try {
            let endpoint;
            let itemId;

            switch (selectedOption) {
                case 'salas':
                    endpoint = `http://localhost:3001/inativar-sala/${item.idSala}`;
                    itemId = item.idSala;
                    break;
                case 'disciplinas':
                    endpoint = `http://localhost:3001/inativar-disciplina/${item.idDisciplina}`;
                    itemId = item.idDisciplina;
                    break;
                case 'turmas':
                    endpoint = `http://localhost:3001/inativar-turma/${item.idTurma}`;
                    itemId = item.idTurma;
                    break;
                case 'professores':
                    endpoint = `http://localhost:3001/inativar-professor/${item.idProfessor}`;
                    itemId = item.idProfessor;
                    break;
                default:
                    throw new Error('Opção inválida');
            }

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                setSuccessMessage(data.message || 'Item inativado com sucesso!');
                // Atualiza a lista após inativar
                handleOptionChange({ target: { value: selectedOption } });
            } else {
                throw new Error(data.message || 'Erro ao inativar item');
            }
        } catch (error) {
            console.error('Erro ao inativar:', error);
            setSuccessMessage('Erro ao inativar: ' + error.message);
        }
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const paginateData = (data) => {
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const handleViewTurma = async (turma) => {
        setSelectedTurma(turma);
        setOpenViewModal(true);
        await fetchTurmaAlunos(turma.idTurma);
    };

    const fetchTurmaAlunos = async (turmaId) => {
        try {
            const response = await fetch(`http://localhost:3001/turmas/${turmaId}/alunos`);
            if (!response.ok) {
                throw new Error('Erro ao buscar alunos da turma');
            }
            const data = await response.json();
            setTurmaAlunos(data);
        } catch (error) {
            console.error('Erro ao buscar alunos:', error);
            setTurmaAlunos([]);
        }
    };

    useEffect(() => {
        if (openModal && selectedOption === 'turmas') {
            carregarTodosAlunos();
        }
    }, [openModal, selectedOption]);

    useEffect(() => {
        const fetchProfessorId = async () => {
            try {
                const response = await fetch(`http://localhost:3001/professor-by-email?email=${professorEmail}`);
                const data = await response.json();
                if (data.success) {
                    setProfessorId(data.professor.idProfessor);
                    localStorage.setItem('professorId', data.professor.idProfessor);
                }
            } catch (error) {
                console.error('Erro ao buscar ID do professor:', error);
            }
        };

        if (professorEmail) {
            fetchProfessorId();
        }
    }, [professorEmail]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedOption, statusFilter]);

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
                return "Pesquisar por nome, email, telefone...";
            default:
                return "Pesquisar...";
        }
    };

    const handleView = async (turma) => {
        setSelectedTurma(turma);
        setOpenViewModal(true);
        
        try {
            // Aqui você pode adicionar uma chamada para buscar os alunos da turma
            const response = await fetch(`http://localhost:3001/turmas/${turma.idTurma}/alunos`);
            if (!response.ok) throw new Error('Erro ao buscar alunos da turma');
            const alunos = await response.json();
            setTurmaAlunos(alunos);
        } catch (error) {
            console.error('Erro ao buscar alunos:', error);
            setTurmaAlunos([]);
        }
    };

    const getPaginatedData = () => {
        try {
            const filteredData = filterData(tableData || []);
            if (!Array.isArray(filteredData)) {
                console.error('Dados filtrados não são um array:', filteredData);
                return [];
            }
            const startIndex = (page - 1) * rowsPerPage;
            const endIndex = startIndex + rowsPerPage;
            return filteredData.slice(startIndex, endIndex);
        } catch (error) {
            console.error('Erro ao paginar dados:', error);
            return [];
        }
    };

    const paginatedData = getPaginatedData();

    // Função para carregar alunos disponíveis
    const carregarAlunos = async () => {
        try {
            const response = await fetch('http://localhost:3001/alunos/ativos');
            if (!response.ok) throw new Error('Erro ao carregar alunos');
            const data = await response.json();
            setTodosAlunos(data);
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
        }
    };

    // Adicione este useEffect para carregar os alunos quando o componente montar
    useEffect(() => {
        carregarAlunos();
    }, []);

    const handleAlunoSelect = (aluno) => {
        // Verifica se o aluno já está selecionado
        const isSelected = turmaAlunos.some(a => a.idAluno === aluno.idAluno);
        
        if (isSelected) {
            // Remove o aluno se já estiver selecionado
            setTurmaAlunos(prev => prev.filter(a => a.idAluno !== aluno.idAluno));
        } else {
            // Adiciona o aluno se não estiver selecionado
            setTurmaAlunos(prev => [...prev, aluno]);
        }
    };

    const carregarAlunosTurma = async (turmaId) => {
        try {
            const response = await fetch(`http://localhost:3001/turmas/${turmaId}/alunos`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao buscar alunos da turma');
            }
            
            const alunosData = await response.json();
            setTurmaAlunos(alunosData);
        } catch (error) {
            console.error('Erro ao carregar alunos da turma:', error);
            setSuccessMessage('Erro ao carregar alunos da turma');
        }
    };

    // Adicione esta função para carregar os dados iniciais
    useEffect(() => {
        const carregarDadosIniciais = async () => {
            try {
                const response = await fetch('http://localhost:3001/disciplinas');
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    setTableData(data);
                } else {
                    console.error('Dados recebidos não são um array:', data);
                    setTableData([]);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setTableData([]);
            }
        };

        if (selectedOption === 'disciplinas') {
            carregarDadosIniciais();
        }
    }, [selectedOption]);

    // Adicione esta função para limpar o formulário
    const limparFormulario = () => {
        setFormData({});
        setSearchAlunoTerm('');
        setAlunosSearchResults([]);
    };

    // Adicione esta função para abrir o modal de visualização
    const handleOpenViewModal = async (turma) => {
        setSelectedTurma(turma);
        setOpenViewModal(true);
        setSearchAlunoTerm(''); // Limpa o termo de busca
        setAlunosSearchResults([]); // Limpa os resultados anteriores
        await carregarAlunosTurma(turma.idTurma);
    };

    // Adicione esta função para atualizar o estado do formulário
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Adicione este useEffect para carregar os dados da disciplina ao editar
    useEffect(() => {
        if (openModal && formData.idDisciplina) {
            console.log('Dados do formulário:', formData); // Debug
        }
    }, [openModal, formData]);

    // Função para renderizar o componente correto baseado na seleção
    const renderSelectedComponent = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            );
        }

        switch (selectedOption) {
            case 'turmas':
                return (
                    <TurmasComponent 
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        orderBy={orderBy}
                        order={order}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        handleSort={handleSort}
                        setSuccessMessage={setSuccessMessage}
                        professores={professores}
                        disciplinas={disciplinas}
                        salas={salas}
                        handleOptionChange={handleOptionChange}
                    />
                );
            case 'salas':
                return (
                    <SalasComponent 
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        orderBy={orderBy}
                        order={order}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        handleSort={handleSort}
                        setSuccessMessage={setSuccessMessage}
                        handleOptionChange={handleOptionChange}
                    />
                );
            case 'disciplinas':
                return (
                    <DisciplinasComponent 
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        orderBy={orderBy}
                        order={order}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        handleSort={handleSort}
                        setSuccessMessage={setSuccessMessage}
                        handleOptionChange={handleOptionChange}
                    />
                );
            case 'professores':
                return (
                    <>
                        <Stack direction="row" justifyContent="flex-start" sx={{ mb: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => handleAdd()}
                            >
                                Cadastrar Professor
                            </Button>
                        </Stack>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nome</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Telefone</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center">Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableData.length > 0 ? (
                                        tableData.map((professor) => (
                                            <TableRow key={professor.idProfessor}>
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
                                                <TableCell align="center">
                                                    <IconButton 
                                                        color="primary" 
                                                        onClick={() => handleEdit(professor)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        color="error"
                                                        onClick={() => handleDelete(professor)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography>Nenhum professor encontrado</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                );
            case 'alunos':
                return (
                    <AlunosComponent 
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        orderBy={orderBy}
                        order={order}
                        setOrder={setOrder}
                        setOrderBy={setOrderBy}
                        setSuccessMessage={setSuccessMessage}
                        openModal={openAlunoModal}
                        setOpenModal={setOpenAlunoModal}
                        handleOptionChange={handleOptionChange}
                        fetchAlunos={carregarAlunos}
                    />
                );
            default:
                return null;
        }
    };

    // Adicione esta função para lidar com a adição de alunos
    const handleAddAluno = () => {
        setOpenAlunoModal(true);
    };

    // Adicione este useEffect para carregar os dados quando a opção for selecionada
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedOption) return;
            
            setLoading(true);
            try {
                let response;
                switch (selectedOption) {
                    case 'professores':
                        response = await fetch('http://localhost:3001/professores');
                        break;
                    // ... outros casos ...
                    default:
                        return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log(`Dados de ${selectedOption}:`, data); // Debug
                setTableData(data);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setSuccessMessage(`Erro ao carregar ${selectedOption}: ${error.message}`);
                setTableData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedOption]);

    return (
        <div>
            <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit"     onClick={toggleDrawer}>
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

            <Container>
                <Paper style={{ padding: '20px', marginTop: '20px' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Selecione uma opção</InputLabel>
                            <Select
                                value={selectedOption}
                                onChange={handleOptionChange}
                                label="Selecione uma opção"
                            >
                                <MenuItem value="turmas">Turmas</MenuItem>
                                <MenuItem value="salas">Salas</MenuItem>
                                <MenuItem value="disciplinas">Disciplinas</MenuItem>
                                <MenuItem value="professores">Professores</MenuItem>
                                <MenuItem value="alunos">Alunos</MenuItem>
                            </Select>
                        </FormControl>
                        
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

                        {selectedOption && (
                            <FormControl sx={{ minWidth: 120 }}>
                                <Select
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    displayEmpty
                                    size="small"
                                >
                                    <MenuItem value="all">Todas</MenuItem>
                                    <MenuItem value="1">Ativas</MenuItem>
                                    <MenuItem value="0">Inativas</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </Stack>

                    {selectedOption === 'alunos' && (
                        <Stack direction="row" justifyContent="flex-start" sx={{ mb: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddAluno}
                            >
                                Cadastrar Aluno
                            </Button>
                        </Stack>
                    )}

                    {/* Renderiza o componente selecionado */}
                    {renderSelectedComponent()}

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

            <Dialog 
                open={openViewModal} 
                onClose={() => setOpenViewModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Detalhes da Turma
                </DialogTitle>
                <DialogContent>
                    {selectedTurma && (
                        <Box sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        {selectedTurma.Nome}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Professor</Typography>
                                    <Typography>{selectedTurma.nomeProfessor || 'Não definido'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Disciplina</Typography>
                                    <Typography>{selectedTurma.nomeDisciplina || 'Não definida'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Sala</Typography>
                                    <Typography>{selectedTurma.nomeSala || 'Não definida'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Horário</Typography>
                                    <Typography>
                                        {selectedTurma.Dia_semana && selectedTurma.Horario_inicio && selectedTurma.Horario_termino
                                            ? `${selectedTurma.Dia_semana} ${selectedTurma.Horario_inicio}-${selectedTurma.Horario_termino}`
                                            : 'Não definido'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Período</Typography>
                                    <Typography>{`${selectedTurma.Ano} - ${selectedTurma.Semestre}º Semestre`}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Total de Alunos</Typography>
                                    <Typography>{selectedTurma.qtdAlunos || 0}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                                        Alunos Matriculados
                                    </Typography>
                                    <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                                        {turmaAlunos.length > 0 ? (
                                            <List>
                                                {turmaAlunos.map((aluno) => (
                                                    <ListItem key={aluno.idAluno}>
                                                        <ListItemText
                                                            primary={aluno.Nome}
                                                            secondary={`Email: ${aluno.Email} - Tel: ${aluno.Telefone || 'Não informado'}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography color="textSecondary" align="center">
                                                Nenhum aluno matriculado nesta turma
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewModal(false)}>
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ProfessorPage;

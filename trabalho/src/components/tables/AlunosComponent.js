import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Alert,
    Snackbar,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    Box,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TableSortLabel,
    Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import InputMask from 'react-input-mask';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

const AlunosComponent = ({ 
    setSuccessMessage, 
    searchTerm, 
    statusFilter,
    orderBy,
    order,
    setOrderBy,
    setOrder,
    openModal,
    setOpenModal,
    handleOptionChange
}) => {
    const [alunos, setAlunos] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openTurmasDialog, setOpenTurmasDialog] = useState(false);
    const [turmasAluno, setTurmasAluno] = useState([]);
    const [selectedAlunoNome, setSelectedAlunoNome] = useState('');
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [formData, setFormData] = useState({
        Nome: '',
        Email: '',
        Telefone: '',
        Data_Nascimento: '',
        Senha: '',
        Status: 1
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        fetchAlunos();
    }, [statusFilter, orderBy, order]);

    useEffect(() => {
        if (openModal) {
            handleOpenDialog();
        }
    }, [openModal]);

    const fetchAlunos = async () => {
        try {
            let url = 'http://localhost:3001/alunos';
            
            const params = new URLSearchParams();
            if (statusFilter && statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            if (orderBy) {
                params.append('orderBy', orderBy);
                params.append('order', order);
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await axios.get(url);
            let filteredAlunos = response.data;

            if (searchTerm) {
                filteredAlunos = filteredAlunos.filter(aluno =>
                    aluno.Nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    aluno.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (aluno.Telefone && aluno.Telefone.includes(searchTerm))
                );
            }

            setAlunos(filteredAlunos);
        } catch (error) {
            console.error('Erro ao buscar alunos:', error);
            setSuccessMessage('Erro ao carregar alunos');
        }
    };

    useEffect(() => {
        fetchAlunos();
    }, [searchTerm]);

    const handleOpenDialog = (aluno = null) => {
        if (aluno) {
            setFormData({
                Nome: aluno.Nome,
                Email: aluno.Email,
                Telefone: aluno.Telefone || '',
                Data_Nascimento: aluno.Data_Nascimento?.split('T')[0] || '',
                Senha: aluno.Senha || '',
                Status: aluno.Status
            });
            setSelectedAluno(aluno);
        } else {
            setFormData({
                Nome: '',
                Email: '',
                Telefone: '',
                Data_Nascimento: '',
                Senha: '',
                Status: 1
            });
            setSelectedAluno(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedAluno(null);
        setOpenModal(false);
    };

    const handleSubmit = async () => {
        try {
            if (!formData.Nome || !formData.Email || !formData.Data_Nascimento || !formData.Senha) {
                setSnackbarMessage('Por favor, preencha todos os campos obrigatórios');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                return;
            }

            const dadosParaEnviar = {
                ...formData,
                Status: 1
            };

            if (selectedAluno) {
                await axios.put(`http://localhost:3001/alunos/${selectedAluno.idAluno}`, dadosParaEnviar);
                setSnackbarMessage('Aluno atualizado com sucesso!');
            } else {
                await axios.post('http://localhost:3001/alunos', dadosParaEnviar);
                setSnackbarMessage('Aluno cadastrado com sucesso!');
            }
            
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            fetchAlunos();
            handleCloseDialog();

            if (typeof handleOptionChange === 'function') {
                handleOptionChange({ target: { value: 'alunos' } });
            }
        } catch (error) {
            console.error('Erro ao salvar aluno:', error);
            setSnackbarMessage(error.response?.data?.message || 'Erro ao salvar aluno');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleInactivate = async (id) => {
        if (window.confirm('Tem certeza que deseja inativar este aluno?')) {
            try {
                await axios.put(`http://localhost:3001/alunos/${id}`, {
                    Status: 0
                });
                setSnackbarMessage('Aluno inativado com sucesso!');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                fetchAlunos();
            } catch (error) {
                console.error('Erro ao inativar aluno:', error);
                setSnackbarMessage('Erro ao inativar aluno');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            }
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleOpenTurmasDialog = async (aluno) => {
        try {
            // Buscar detalhes do aluno
            const alunoResponse = await axios.get(`http://localhost:3001/alunos/${aluno.idAluno}`);
            const alunoDetalhes = alunoResponse.data;
            
            // Buscar turmas do aluno
            const turmasResponse = await axios.get(`http://localhost:3001/alunos/${aluno.idAluno}/turmas`);
            
            setTurmasAluno(turmasResponse.data);
            setSelectedAluno(alunoDetalhes);
            setSelectedAlunoNome(alunoDetalhes.Nome);
            setOpenTurmasDialog(true);
        } catch (error) {
            console.error('Erro ao buscar informações do aluno:', error);
            setSnackbarMessage('Erro ao buscar informações do aluno');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        setOrder(newOrder);
        setOrderBy(property);
    };

    const sortedAlunos = React.useMemo(() => {
        if (!Array.isArray(alunos)) return [];
        
        return [...alunos].sort((a, b) => {
            if (orderBy === 'Nome') {
                return order === 'asc'
                    ? a.Nome.localeCompare(b.Nome)
                    : b.Nome.localeCompare(a.Nome);
            }
            if (orderBy === 'Data_Nascimento') {
                const dateA = new Date(a.Data_Nascimento);
                const dateB = new Date(b.Data_Nascimento);
                return order === 'asc' ? dateA - dateB : dateB - dateA;
            }
            return 0;
        });
    }, [alunos, orderBy, order]);

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'Nome'}
                                    direction={orderBy === 'Nome' ? order : 'asc'}
                                    onClick={() => handleSort('Nome')}
                                >
                                    Nome
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Telefone</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'Data_Nascimento'}
                                    direction={orderBy === 'Data_Nascimento' ? order : 'asc'}
                                    onClick={() => handleSort('Data_Nascimento')}
                                >
                                    Data de Nascimento
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Turmas</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedAlunos.map((aluno) => (
                            <TableRow key={aluno.idAluno}>
                                <TableCell>{aluno.Nome}</TableCell>
                                <TableCell>{aluno.Email}</TableCell>
                                <TableCell>{aluno.Telefone || 'Não informado'}</TableCell>
                                <TableCell>
                                    {aluno.Data_Nascimento 
                                        ? new Date(aluno.Data_Nascimento).toLocaleDateString('pt-BR')
                                        : 'Não informada'}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={aluno.qtdTurmas || '0'}
                                        size="small"
                                        color={aluno.qtdTurmas > 0 ? "primary" : "default"}
                                        sx={{ minWidth: '40px' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={aluno.Status === 1 ? 'Ativo' : 'Inativo'}
                                        color={aluno.Status === 1 ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton onClick={() => handleOpenTurmasDialog(aluno)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenDialog(aluno)}>
                                            <EditIcon />
                                        </IconButton>
                                        {aluno.Status === 1 && (
                                            <IconButton onClick={() => handleInactivate(aluno.idAluno)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog || openModal} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedAluno ? 'Editar Aluno' : 'Novo Aluno'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <TextField
                            label="Nome"
                            fullWidth
                            value={formData.Nome}
                            onChange={(e) => setFormData({ ...formData, Nome: e.target.value })}
                            required
                            error={!formData.Nome}
                            helperText={!formData.Nome ? 'Nome é obrigatório' : ''}
                            inputProps={{ maxLength: 45 }}
                        />
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={formData.Email}
                            onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                            required
                            error={!formData.Email}
                            helperText={!formData.Email ? 'Email é obrigatório' : ''}
                            inputProps={{ maxLength: 45 }}
                        />
                        <InputMask
                            mask="(99) 99999-9999"
                            value={formData.Telefone}
                            onChange={(e) => setFormData({ ...formData, Telefone: e.target.value })}
                        >
                            {(inputProps) => (
                                <TextField
                                    {...inputProps}
                                    label="Telefone"
                                    fullWidth
                                    placeholder="(00) 00000-0000"
                                />
                            )}
                        </InputMask>
                        <TextField
                            label="Data de Nascimento"
                            type="date"
                            fullWidth
                            value={formData.Data_Nascimento}
                            onChange={(e) => setFormData({ ...formData, Data_Nascimento: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            required
                            error={!formData.Data_Nascimento}
                            helperText={!formData.Data_Nascimento ? 'Data de nascimento é obrigatória' : ''}
                        />
                        <TextField
                            label="Senha"
                            type="password"
                            fullWidth
                            value={formData.Senha}
                            onChange={(e) => setFormData({ ...formData, Senha: e.target.value })}
                            required
                            error={!formData.Senha}
                            helperText={!formData.Senha ? 'Senha é obrigatória' : ''}
                            inputProps={{ maxLength: 45 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        disabled={!formData.Nome || !formData.Email || !formData.Data_Nascimento || !formData.Senha}
                    >
                        {selectedAluno ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog 
                open={openTurmasDialog} 
                onClose={() => setOpenTurmasDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Informações do Aluno
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            Dados Pessoais
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2">Nome:</Typography>
                                <Typography>{selectedAluno?.Nome}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2">Data de Nascimento:</Typography>
                                <Typography>
                                    {selectedAluno?.Data_Nascimento 
                                        ? new Date(selectedAluno.Data_Nascimento).toLocaleDateString('pt-BR')
                                        : 'Não informada'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2">Email:</Typography>
                                <Typography>{selectedAluno?.Email}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2">Telefone:</Typography>
                                <Typography>{selectedAluno?.Telefone || 'Não informado'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2">Status:</Typography>
                                <Chip 
                                    label={selectedAluno?.Status === 1 ? "Ativo" : "Inativo"}
                                    color={selectedAluno?.Status === 1 ? "success" : "error"}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                    
                    {/* Lista de Turmas */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                        Turmas Matriculadas
                    </Typography>
                    {/* ... resto do código para exibir as turmas ... */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTurmasDialog(false)} variant="contained">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AlunosComponent;
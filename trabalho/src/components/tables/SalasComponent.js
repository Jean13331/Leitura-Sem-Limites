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
    Stack,
    Typography,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VisibilityIcon from '@mui/icons-material/Visibility';

const SalasComponent = ({
    searchTerm,
    statusFilter,
    orderBy,
    order,
    page,
    rowsPerPage,
    handleSort,
    setSuccessMessage
}) => {
    const [salas, setSalas] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedSala, setSelectedSala] = useState(null);
    const [formData, setFormData] = useState({});
    const [viewModal, setViewModal] = useState(false);
    const [viewSala, setViewSala] = useState(null);

    useEffect(() => {
        fetchSalas();
    }, [statusFilter, orderBy, order]);

    const fetchSalas = async () => {
        try {
            const response = await fetch(`http://localhost:3001/salas?status=${statusFilter}&orderBy=${orderBy}&order=${order}`);
            if (!response.ok) throw new Error('Erro ao buscar salas');
            const data = await response.json();
            setSalas(data);
        } catch (error) {
            console.error('Erro:', error);
            setSuccessMessage('Erro ao carregar salas');
        }
    };

    const handleAdd = () => {
        setSelectedSala(null);
        setFormData({
            Nome: '',
            Localizacao: '',
            Capacidade: '',
            Status: 1
        });
        setOpenModal(true);
    };

    const handleEdit = (sala) => {
        setSelectedSala(sala);
        setFormData({
            ...sala
        });
        setOpenModal(true);
    };

    const handleSave = async () => {
        try {
            const url = selectedSala
                ? `http://localhost:3001/salas/${selectedSala.idSala}`
                : 'http://localhost:3001/salas';

            const response = await fetch(url, {
                method: selectedSala ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Erro ao salvar sala');

            setSuccessMessage('Sala salva com sucesso');
            setOpenModal(false);
            fetchSalas();
        } catch (error) {
            console.error('Erro:', error);
            setSuccessMessage('Erro ao salvar sala');
        }
    };

    const handleDelete = async (sala) => {
        if (!window.confirm('Deseja realmente inativar esta sala?')) return;

        try {
            const response = await fetch(`http://localhost:3001/inativar-sala/${sala.idSala}`, {
                method: 'PUT'
            });

            if (!response.ok) throw new Error('Erro ao inativar sala');

            setSuccessMessage('Sala inativada com sucesso');
            fetchSalas();
        } catch (error) {
            console.error('Erro:', error);
            setSuccessMessage('Erro ao inativar sala');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleView = async (sala) => {
        try {
            const response = await fetch(`http://localhost:3001/salas/${sala.idSala}`);
            if (!response.ok) throw new Error('Erro ao buscar detalhes da sala');
            const salaDetalhes = await response.json();
            setViewSala(salaDetalhes);
            setViewModal(true);
        } catch (error) {
            console.error('Erro ao carregar detalhes da sala:', error);
            setSuccessMessage({
                type: 'error',
                text: 'Erro ao carregar detalhes da sala'
            });
        }
    };

    const filteredSalas = salas.filter(sala => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            sala.Nome?.toLowerCase().includes(searchLower) ||
            sala.Localizacao?.toLowerCase().includes(searchLower) ||
            sala.Capacidade?.toString().includes(searchTerm)
        );
    });

    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                >
                    Adicionar Sala
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell 
                                onClick={() => handleSort('nome')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Nome
                                    {orderBy === 'nome' && (
                                        order === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 1 }} /> 
                                                       : <ArrowDownwardIcon fontSize="small" sx={{ ml: 1 }} />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Localização</TableCell>
                            <TableCell 
                                onClick={() => handleSort('capacidade')}
                                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Capacidade
                                    {orderBy === 'capacidade' && (
                                        order === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 1 }} /> 
                                                       : <ArrowDownwardIcon fontSize="small" sx={{ ml: 1 }} />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredSalas.map((sala) => (
                            <TableRow key={sala.idSala}>
                                <TableCell>{sala.Nome}</TableCell>
                                <TableCell>{sala.Localizacao}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={sala.Capacidade}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={sala.Status === 1 ? 'Ativa' : 'Inativa'}
                                        color={sala.Status === 1 ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleView(sala)}
                                            color="info"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleEdit(sala)}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleDelete(sala)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedSala ? 'Editar Sala' : 'Adicionar Sala'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nome"
                                    name="Nome"
                                    value={formData.Nome || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Localização"
                                    name="Localizacao"
                                    value={formData.Localizacao || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Capacidade"
                                    name="Capacidade"
                                    type="number"
                                    value={formData.Capacidade || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">Salvar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={viewModal} onClose={() => setViewModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Detalhes da Sala
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Nome
                                </Typography>
                                <Typography variant="body1">
                                    {viewSala?.Nome}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Localização
                                </Typography>
                                <Typography variant="body1">
                                    {viewSala?.Localizacao}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Capacidade
                                </Typography>
                                <Chip 
                                    label={`${viewSala?.Capacidade} alunos`}
                                    color="primary"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Status
                                </Typography>
                                <Chip 
                                    label={viewSala?.Status === 1 ? 'Ativa' : 'Inativa'}
                                    color={viewSala?.Status === 1 ? 'success' : 'error'}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Turmas Associadas
                                </Typography>
                                {viewSala?.turmas && viewSala.turmas.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {viewSala.turmas.map((turma, index) => (
                                            <Paper key={index} sx={{ p: 1.5, bgcolor: 'background.default' }}>
                                                <Typography variant="subtitle2">
                                                    {turma.nome}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Disciplina: {turma.disciplina}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Professor: {turma.professor}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {turma.dia} • {turma.horario}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        Nenhuma turma associada a esta sala
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewModal(false)}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SalasComponent; 
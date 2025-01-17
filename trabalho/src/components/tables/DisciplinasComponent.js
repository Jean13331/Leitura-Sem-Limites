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
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const DisciplinasComponent = ({
    searchTerm,
    statusFilter,
    orderBy,
    order,
    page,
    rowsPerPage,
    handleSort,
    setSuccessMessage
}) => {
    const [disciplinas, setDisciplinas] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedDisciplina, setSelectedDisciplina] = useState(null);
    const [formData, setFormData] = useState({});
    const [professores, setProfessores] = useState([]);
    const [selectedProfessores, setSelectedProfessores] = useState([]);
    const [professorSearchTerm, setProfessorSearchTerm] = useState('');
    const [viewModal, setViewModal] = useState(false);
    const [viewDisciplina, setViewDisciplina] = useState(null);

    useEffect(() => {
        fetchDisciplinas();
        fetchProfessores();
    }, [statusFilter, orderBy, order]);

    const fetchDisciplinas = async () => {
        try {
            console.log('Fetching disciplinas with params:', {
                status: statusFilter,
                orderBy,
                order
            });
    
            const url = `http://localhost:3001/disciplinas?status=${statusFilter || ''}&orderBy=${orderBy || 'nome'}&order=${order || 'asc'}`;
            console.log('Fetch URL:', url);
    
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response text:', errorText);
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            setDisciplinas(data || []);
        } catch (error) {
            console.error('Erro completo na requisição de disciplinas:', error);
            setSuccessMessage(`Erro ao carregar dados: ${error.message}`);
        }
    };
    
    const fetchProfessores = async () => {
        try {
            console.log('Fetching professores');
    
            const response = await fetch('http://localhost:3001/professores/ativos', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response text:', errorText);
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Received professores:', data);
            setProfessores(data || []);
        } catch (error) {
            console.error('Erro completo na requisição de professores:', error);
            setSuccessMessage(`Erro ao carregar dados: ${error.message}`);
        }
    };
    

    const handleAdd = () => {
        setSelectedDisciplina(null);
        setFormData({
            Nome: '',
            codigo: '',
            Periodo: '',
            Status: 1
        });
        setSelectedProfessores([]);
        setOpenModal(true);
    };

    const handleEdit = async (disciplina) => {
        try {
            const response = await fetch(`http://localhost:3001/disciplinas/${disciplina.idDisciplina}`);
            if (!response.ok) throw new Error('Erro ao buscar detalhes da disciplina');
            
            const disciplinaDetalhes = await response.json();
            
            setSelectedDisciplina(disciplinaDetalhes);
            setFormData({
                Nome: disciplinaDetalhes.Nome,
                codigo: disciplinaDetalhes.codigo,
                Periodo: disciplinaDetalhes.Periodo,
                Status: disciplinaDetalhes.Status
            });
            
            setSelectedProfessores(disciplinaDetalhes.professores || []);
            setOpenModal(true);
        } catch (error) {
            console.error('Erro ao carregar detalhes da disciplina:', error);
            setSuccessMessage('Erro ao carregar detalhes da disciplina');
        }
    };

    const handleSave = async () => {
        try {
            const url = selectedDisciplina
                ? `http://localhost:3001/disciplinas/${selectedDisciplina.idDisciplina}`
                : 'http://localhost:3001/disciplinas';

            const dataToSend = {
                ...formData,
                professores: selectedProfessores
            };

            console.log('Data to send:', dataToSend);

            const response = await fetch(url, {
                method: selectedDisciplina ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const responseData = await response.json();
            console.log('JSON retornado pela API:', responseData);


            if(dataToSend.professores.length > 0) {
                dataToSend.professores.forEach(async (professorId) => {
                    await fetch(`http://localhost:3001/disciplinas/${responseData.data.idDisciplina}/professores/${professorId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ }),
                    });
                });
            }

            if (!response.ok) throw new Error('Erro ao salvar disciplina');

            setSuccessMessage('Disciplina salva com sucesso');
            setOpenModal(false);
            fetchDisciplinas();
        } catch (error) {
            console.error('Erro:', error);
            setSuccessMessage('Erro ao salvar disciplina');
        }
    };

    const handleDelete = async (disciplina) => {
        if (!window.confirm('Deseja realmente inativar esta disciplina?')) return;

        try {
            const response = await fetch(`http://localhost:3001/inativar-disciplina/${disciplina.idDisciplina}`, {
                method: 'PUT'
            });

            if (!response.ok) throw new Error('Erro ao inativar disciplina');

            setSuccessMessage('Disciplina inativada com sucesso');
            fetchDisciplinas();
        } catch (error) {
            console.error('Erro:', error);
            setSuccessMessage('Erro ao inativar disciplina');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredDisciplinas = disciplinas.filter(disciplina => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            disciplina.Nome?.toLowerCase().includes(searchLower) ||
            disciplina.codigo?.toLowerCase().includes(searchLower) ||
            disciplina.Periodo?.toString().includes(searchTerm)
        );
    });

    const filteredProfessores = professores.filter(professor => {
        if (!professorSearchTerm) return true;
        
        const searchLower = professorSearchTerm.toLowerCase();
        return (
            professor.Nome?.toLowerCase().includes(searchLower) ||
            professor.Email?.toLowerCase().includes(searchLower) ||
            professor.Titulacao?.toLowerCase().includes(searchLower)
        );
    });

    const handleView = async (disciplina) => {
        try {
            const response = await fetch(`http://localhost:3001/disciplinas/${disciplina.idDisciplina}`);
            if (!response.ok) throw new Error('Erro ao buscar detalhes da disciplina');
            
            const disciplinaDetalhes = await response.json();
            setViewDisciplina(disciplinaDetalhes);
            setViewModal(true);
        } catch (error) {
            console.error('Erro ao carregar detalhes da disciplina:', error);
            setSuccessMessage('Erro ao carregar detalhes da disciplina');
        }
    };

    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                >
                    Adicionar Disciplina
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} 
                                    onClick={() => handleSort('nome')}>
                                    Nome
                                    {orderBy === 'nome' && (
                                        order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell>Código</TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                    onClick={() => handleSort('periodo')}>
                                    Período
                                    {orderBy === 'periodo' && (
                                        order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDisciplinas.map((disciplina) => (
                            <TableRow key={disciplina.idDisciplina}>
                                <TableCell>{disciplina.Nome}</TableCell>
                                <TableCell>{disciplina.codigo}</TableCell>
                                <TableCell>{disciplina.Periodo}º Período</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={disciplina.Status === 1 ? 'Ativa' : 'Inativa'}
                                        color={disciplina.Status === 1 ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleView(disciplina)}
                                            color="info"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleEdit(disciplina)}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleDelete(disciplina)}
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
                    {selectedDisciplina ? 'Editar Disciplina' : 'Adicionar Disciplina'}
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
                                    label="Código"
                                    name="codigo"
                                    value={formData.codigo || ''}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 12) {
                                            handleInputChange(e);
                                        }
                                    }}
                                    required
                                    inputProps={{ 
                                        maxLength: 12,
                                        pattern: '[A-Za-z0-9]*'
                                    }}
                                    helperText={`${formData.codigo?.length || 0}/12 caracteres`}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Período"
                                    name="Periodo"
                                    type="number"
                                    value={formData.Periodo || ''}
                                    onChange={handleInputChange}
                                    required
                                    inputProps={{ min: 1, max: 10 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Professores
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Buscar professor"
                                    value={professorSearchTerm}
                                    onChange={(e) => setProfessorSearchTerm(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
    {filteredProfessores.map((professor) => (
        <Box key={professor.idProfessor} sx={{ mb: 1 }}>
            <Chip
                label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant="body2">
                            {professor.Nome} ({professor.Titulacao})
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {professor.Email}
                        </Typography>
                    </Box>
                }
                onClick={() => {
                    const isSelected = selectedProfessores.includes(professor.idProfessor);
                    setSelectedProfessores(prev =>
                        isSelected
                            ? prev.filter(id => id !== professor.idProfessor)
                            : [...prev, professor.idProfessor]
                    );
                }}
                color={selectedProfessores.includes(professor.idProfessor) ? "primary" : "default"}
                sx={{
                    m: 0.5,
                    height: 'auto',
                    backgroundColor: selectedProfessores.includes(professor.idProfessor)
                        ? '#1976d2' // Azul personalizado
                        : '#e0e0e0', // Cinza padrão
                    color: selectedProfessores.includes(professor.idProfessor)
                        ? '#ffffff' // Texto branco
                        : '#000000', // Texto preto
                    '& .MuiChip-label': {
                        display: 'block',
                        whiteSpace: 'normal',
                        py: 1,
                    },
                }}
            />
        </Box>
    ))}
</Paper>

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
                    Detalhes da Disciplina
                </DialogTitle>
                <DialogContent> 
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Nome
                                </Typography>
                                <Typography variant="body1">
                                    {viewDisciplina?.Nome}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Código
                                </Typography>
                                <Typography variant="body1">
                                    {viewDisciplina?.Codigo}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Período
                                </Typography>
                                <Typography variant="body1">
                                    {viewDisciplina?.Periodo}º Período
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Status
                                </Typography>
                                <Chip 
                                    label={viewDisciplina?.Status === 1 ? 'Ativa' : 'Inativa'}
                                    color={viewDisciplina?.Status === 1 ? 'success' : 'error'}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Professores Associados
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {professores
                                        .filter(prof => viewDisciplina?.professores?.includes(prof.idProfessor))
                                        .map(professor => (
                                            <Chip
                                                key={professor.idProfessor}
                                                label={
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                        <Typography variant="body2">
                                                            {professor.Nome} ({professor.Titulacao})
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                            {professor.Email}
                                                        </Typography>
                                                    </Box>
                                                }
                                                sx={{ 
                                                    height: 'auto',
                                                    '& .MuiChip-label': {
                                                        display: 'block',
                                                        whiteSpace: 'normal',
                                                        py: 1
                                                    }
                                                }}
                                            />
                                        ))}
                                </Box>
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

export default DisciplinasComponent; 
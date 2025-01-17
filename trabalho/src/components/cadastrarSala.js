import React, { useState, useEffect } from 'react';
import { TextField, Button, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, Select, MenuItem, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const CadastrarSala = () => {
  const [capacidade, setCapacidade] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [nome, setNome] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [salas, setSalas] = useState([]);
  const [salasFiltradas, setSalasFiltradas] = useState([]);
  const [salaParaEditar, setSalaParaEditar] = useState('');
  const [novaCapacidade, setNovaCapacidade] = useState('');
  const [novaLocalizacao, setNovaLocalizacao] = useState('');
  const [salaParaExcluir, setSalaParaExcluir] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const professorEmail = localStorage.getItem('professorEmail');
  const [filtros, setFiltros] = useState({
    nome: '',
    localizacao: '',
    capacidade: '',
    status: 'todos'
  });
  const [novoNome, setNovoNome] = useState('');
  const [orderBy, setOrderBy] = useState('nome');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchSalas();
  }, []);

  useEffect(() => {
    const salasFiltradas = salas.filter(sala => {
      const matchNome = sala.Nome?.toLowerCase().includes(filtros.nome.toLowerCase());
      const matchLocalizacao = sala.Localizacao?.toLowerCase().includes(filtros.localizacao.toLowerCase());
      const matchCapacidade = filtros.capacidade === '' || 
        sala.Capacidade >= parseInt(filtros.capacidade);
      const matchStatus = filtros.status === 'todos' ? true :
        (filtros.status === 'ativos' ? sala.Status === 1 : sala.Status === 0);
      
      return matchNome && matchLocalizacao && matchCapacidade && matchStatus;
    });
    
    setSalasFiltradas(salasFiltradas);
  }, [filtros, salas]);

  const fetchSalas = async () => {
    try {
      const response = await axios.get('http://localhost:3001/salas');
      console.log('Resposta do servidor (salas):', response.data);
      setSalas(response.data);
    } catch (error) {
      console.error('Erro ao buscar salas:', error);
      setMessage('Erro ao carregar salas. Por favor, tente novamente.');
      setOpenSnackbar(true);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/salas', {
        Nome: novoNome,
        Capacidade: novaCapacidade,
        Localizacao: novaLocalizacao
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Sala cadastrada com sucesso!',
          severity: 'success'
        });
        handleCloseEditDialog();
        fetchSalas(); // Atualiza a lista de salas
      } else {
        throw new Error(response.data.message || 'Erro ao cadastrar sala');
      }
    } catch (error) {
      console.error('Erro ao cadastrar sala:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao conectar com o servidor',
        severity: 'error'
      });
    }
  };

  const handleEdit = async () => {
    try {
      const response = await axios.put(`http://localhost:3001/salas/${salaParaEditar.idSala}`, {
        Nome: novoNome,
        Capacidade: novaCapacidade,
        Localizacao: novaLocalizacao
      });

      if (response.data.success) {
        setMessage('Sala atualizada com sucesso!');
        setOpenSnackbar(true);
        handleCloseEditDialog();
        fetchSalas(); // Recarrega a lista de salas
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar sala');
      }
    } catch (error) {
      console.error('Erro ao editar sala:', error);
      setMessage('Erro ao atualizar sala. Por favor, tente novamente.');
      setOpenSnackbar(true);
    }
  };

  const handleEditClick = (sala) => {
    setSalaParaEditar(sala);
    setNovoNome(sala.Nome);
    setNovaCapacidade(sala.Capacidade);
    setNovaLocalizacao(sala.Localizacao);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSalaParaEditar('');
    setNovaCapacidade('');
    setNovaLocalizacao('');
  };

  const handleExcluir = async () => {
    try {
      const response = await fetch(`http://localhost:3001/excluir-sala/${salaParaExcluir}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setOpenSnackbar(true);
        fetchSalas();
      } else {
        // Aqui tratamos especificamente o caso de sala em uso
        if (response.status === 400) {
          setMessage('Não é possível excluir a sala, pois ela está sendo usada por uma ou mais turmas.');
        } else {
          setMessage(data.message || 'Erro ao excluir sala.');
        }
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessage('Erro ao conectar ao servidor. Por favor, tente novamente mais tarde.');
      setOpenSnackbar(true);
    }
    setOpenConfirmDialog(false);
  };

  const handleOpenConfirmDialog = (nomeSala) => {
    setSalaParaExcluir(nomeSala);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

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

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleAtivo = async (sala) => {
    try {
      if (window.confirm('Tem certeza que deseja inativar esta sala?')) {
        const response = await axios.put(`http://localhost:3001/sala-status/${sala.idSala}`, {
          Status: 0  // Sempre inativa
        });

        if (response.data.success) {
          setSnackbar({
            open: true,
            message: 'Sala inativada com sucesso!',
            severity: 'success'
          });
          fetchSalas();
        } else {
          throw new Error(response.data.message);
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erro ao inativar sala',
        severity: 'error'
      });
    }
  };

  const ordenarSalas = (salas) => {
    return [...salas].sort((a, b) => {
      let compareValue;
      
      if (orderBy === 'nome') {
        compareValue = a.Nome.localeCompare(b.Nome);
      } else if (orderBy === 'capacidade') {
        compareValue = a.Capacidade - b.Capacidade;
      }
      
      return orderDirection === 'asc' ? compareValue : -compareValue;
    });
  };

  const handleSort = (campo) => {
    if (orderBy === campo) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(campo);
      setOrderDirection('asc');
    }
  };

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
            <ListItem button key={index} onClick={() => { toggleDrawer(); navigate(item.path); }}>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          <ListItem 
            button 
            onClick={handleLogout} 
            style={{ 
              marginTop: 'auto', 
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

      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
        {/* Barra de pesquisa */}
        <TextField
          sx={{ flex: 1 }}
          label="Buscar por nome ou localização"
          value={filtros.nome}
          onChange={(e) => setFiltros(prev => ({ ...prev, nome: e.target.value }))}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Filtro de Status */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filtros.status}
            onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
            label="Status"
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="ativos">Ativos</MenuItem>
            <MenuItem value="inativos">Inativos</MenuItem>
          </Select>
        </FormControl>

        {/* Botão Nova Sala */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setNovoNome('');
            setNovaCapacidade('');
            setNovaLocalizacao('');
            setSalaParaEditar('');
            setEditDialogOpen(true);
          }}
        >
          Nova Sala
        </Button>
      </Box>

      {/* Tabela de Salas */}
      <TableContainer component={Paper} sx={{ mx: 2, mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                     onClick={() => handleSort('nome')}>
                  Nome
                  {orderBy === 'nome' && (
                    <span>{orderDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                     onClick={() => handleSort('capacidade')}>
                  Capacidade
                  {orderBy === 'capacidade' && (
                    <span>{orderDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </Box>
              </TableCell>
              <TableCell>Localização</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordenarSalas(salasFiltradas).map((sala) => (
              <TableRow 
                key={sala.idSala}
                sx={{
                  backgroundColor: sala.Status === 0 ? 'rgba(0, 0, 0, 0.1)' : 'inherit',
                  opacity: sala.Status === 0 ? 0.7 : 1
                }}
              >
                <TableCell>{sala.Nome}</TableCell>
                <TableCell>{sala.Capacidade}</TableCell>
                <TableCell>{sala.Localizacao}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={sala.Status === 1 ? "Ativa" : "Inativa"}
                    color={sala.Status === 1 ? "success" : "default"}
                    onClick={() => handleToggleAtivo(sala)}
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleEditClick(sala)}>
                    <EditIcon />
                  </IconButton>
                  {sala.Status === 1 && (
                    <IconButton 
                      onClick={() => handleToggleAtivo(sala)}
                      color="error"
                      title="Inativar sala"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Cadastro/Edição */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {salaParaEditar ? 'Editar Sala' : 'Nova Sala'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nome da Sala *"
              fullWidth
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              required
            />
            <TextField
              label="Capacidade *"
              type="number"
              fullWidth
              value={novaCapacidade}
              onChange={(e) => setNovaCapacidade(e.target.value)}
              required
            />
            <TextField
              label="Localização *"
              fullWidth
              value={novaLocalizacao}
              onChange={(e) => setNovaLocalizacao(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button 
            onClick={salaParaEditar ? handleEdit : handleSubmit} 
            variant="contained" 
            color="primary"
          >
            {salaParaEditar ? 'Salvar' : 'Cadastrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar com severidade */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CadastrarSala;

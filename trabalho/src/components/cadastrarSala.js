import React, { useState, useEffect } from 'react';
import { TextField, Button, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const CadastrarSala = () => {
  const [capacidade, setCapacidade] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [nome, setNome] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [salas, setSalas] = useState([]);
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

  useEffect(() => {
    fetchSalas();
  }, []);

  const fetchSalas = async () => {
    try {
      const response = await fetch('http://localhost:3001/salas-gerenciamento');
      if (response.ok) {
        const data = await response.json();
        setSalas(data);
      } else {
        console.error('Erro ao buscar salas');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/cadastrar-sala', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, capacidade, localizacao }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setOpenSnackbar(true);
        setNome('');
        setCapacidade('');
        setLocalizacao('');
        fetchSalas(); // Atualiza a lista de salas
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Erro ao cadastrar sala');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Erro ao cadastrar sala:', error);
      setMessage('Erro ao conectar com o servidor');
      setOpenSnackbar(true);
    }
  };

  const handleEditClick = (sala) => {
    setSalaParaEditar(sala.Nome);
    setNovoNome(sala.Nome);
    setNovaCapacidade(sala.Capacidade.toString());
    setNovaLocalizacao(sala.Localizacao);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSalaParaEditar('');
    setNovaCapacidade('');
    setNovaLocalizacao('');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/editar-sala/${salaParaEditar}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nome: novoNome,
          capacidade: parseInt(novaCapacidade), 
          localizacao: novaLocalizacao 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setOpenSnackbar(true);
        handleCloseEditDialog();
        fetchSalas();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Erro ao editar sala.');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessage('Erro ao conectar ao servidor.');
      setOpenSnackbar(true);
    }
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
    { text: 'Professor', path: '/editar-professor' }
  ];

  // Função para filtrar as salas
  const salasFiltradas = salas.filter(sala => {
    const matchNome = sala.Nome?.toLowerCase().includes(filtros.nome.toLowerCase());
    const matchLocalizacao = sala.Localizacao?.toLowerCase().includes(filtros.localizacao.toLowerCase());
    const matchCapacidade = filtros.capacidade === '' || 
      sala.Capacidade?.toString().includes(filtros.capacidade);
    const matchStatus = filtros.status === 'todos' ? true :
      (filtros.status === 'ativos' ? sala.ativo : !sala.ativo);
    
    return matchNome && matchLocalizacao && matchCapacidade && matchStatus;
  });

  // Função para atualizar os filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleAtivo = async (sala) => {
    try {
      const response = await fetch(`http://localhost:3001/inativar-sala/${sala.idSala}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ativo: !sala.ativo 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setOpenSnackbar(true);
        fetchSalas();
      } else {
        throw new Error('Erro ao alterar status da sala');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessage('Erro ao alterar status da sala');
      setOpenSnackbar(true);
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

      <div style={{ padding: '20px' }}>
        <h1>Gerenciamento de Salas</h1>
        
        {/* Adicionar seção de filtros */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '20px',
          backgroundColor: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <TextField
            name="nome"
            value={filtros.nome}
            onChange={handleFiltroChange}
            placeholder="Filtrar por nome"
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
            name="localizacao"
            value={filtros.localizacao}
            onChange={handleFiltroChange}
            placeholder="Filtrar por localização"
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
            name="capacidade"
            value={filtros.capacidade}
            onChange={handleFiltroChange}
            placeholder="Filtrar por capacidade"
            size="small"
            type="number"
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
              inputProps={{ 'aria-label': 'Status' }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="ativos">Ativos</MenuItem>
              <MenuItem value="inativos">Inativos</MenuItem>
            </Select>
          </FormControl>
        </div>

        <h2>Salas Cadastradas</h2>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Capacidade</TableCell>
                <TableCell>Localização</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salasFiltradas.length > 0 ? (
                salasFiltradas.map((sala, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      backgroundColor: !sala.ativo ? 'rgba(0, 0, 0, 0.1)' : 'inherit',
                      opacity: !sala.ativo ? 0.7 : 1
                    }}
                  >
                    <TableCell>{sala.Nome}</TableCell>
                    <TableCell>{sala.Capacidade}</TableCell>
                    <TableCell>{sala.Localizacao}</TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={sala.ativo}
                            onChange={() => handleToggleAtivo(sala)}
                            color="primary"
                          />
                        }
                        label={sala.ativo ? "Ativa" : "Inativa"}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(sala)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="subtitle1" style={{ padding: '20px' }}>
                      Nenhuma sala encontrada com os filtros aplicados.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <h2>Cadastrar Nova Sala</h2>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nome"
            variant="outlined"
            fullWidth
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Capacidade"
            variant="outlined"
            type="number"
            fullWidth
            value={capacidade}
            onChange={(e) => setCapacidade(e.target.value)}
            required
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Localização"
            variant="outlined"
            fullWidth
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            required
            style={{ marginBottom: '20px' }}
          />
          <Button variant="contained" type="submit">
            Cadastrar
          </Button>
        </form>

        {/* Diálogo de edição */}
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
          <DialogTitle>Editar Sala</DialogTitle>
          <DialogContent>
            <TextField
              label="Nome da Sala"
              fullWidth
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              label="Nova Capacidade"
              type="number"
              fullWidth
              value={novaCapacidade}
              onChange={(e) => setNovaCapacidade(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              label="Nova Localização"
              fullWidth
              value={novaLocalizacao}
              onChange={(e) => setNovaLocalizacao(e.target.value)}
              required
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancelar</Button>
            <Button onClick={handleEdit} variant="contained" color="primary">
              Salvar Alterações
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={openSnackbar}
          onClose={handleCloseSnackbar}
          message={message}
          autoHideDuration={4000}
        />

        <Dialog
          open={openConfirmDialog}
          onClose={handleCloseConfirmDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirmar exclusão"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Tem certeza que deseja excluir a sala {salaParaExcluir}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
            <Button onClick={handleExcluir} autoFocus>
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default CadastrarSala;

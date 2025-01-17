import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper,
  Snackbar,
  IconButton
} from '@mui/material';
import { Close as CloseIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ptBR from 'date-fns/locale/pt-BR';
import InputMask from 'react-input-mask';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: 'aluno',
    nome: '',
    dataNascimento: null,
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    titulacao: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cpfError, setCpfError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'cpf') {
      const cleanCPF = value.replace(/[^\d]/g, '');
      if (cleanCPF.length === 11) {
        if (!validateCPF(value)) {
          setCpfError('CPF inválido');
        } else {
          setCpfError('');
        }
      } else {
        setCpfError('');
      }
    }
  };

  const handleDateChange = (date) => {
    setFormData(prevState => ({
      ...prevState,
      dataNascimento: date
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (formData.role === 'professor') {
      if (!validateCPF(formData.cpf)) {
        setErrorMessage('CPF inválido');
        setOpenSnackbar(true);
        return;
      }
    }

    // Formatar a data antes de enviar
    const formDataToSend = {
      ...formData,
      dataNascimento: formData.dataNascimento ? 
        formData.dataNascimento.toISOString().split('T')[0] : null
    };

    // Validação básica
    if (formData.senha !== formData.confirmarSenha) {
      setErrorMessage('As senhas não coincidem.');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/register?role=' + formData.role, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        // Registro bem-sucedido
        navigate('/login'); // Redireciona para a página de login
      } else {
        // Erro no registro
        setErrorMessage(data.message || 'Erro ao registrar. Tente novamente.');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setErrorMessage('Erro de conexão. Tente novamente mais tarde.');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container component="main" maxWidth="sm">
        <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Registro de {formData.role === 'aluno' ? 'Aluno' : 'Professor'}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">Tipo de Usuário</InputLabel>
                  <Select
                    labelId="role-label"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Tipo de Usuário"
                  >
                    <MenuItem value="aluno">Aluno</MenuItem>
                    <MenuItem value="professor">Professor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="nome"
                  label="Nome Completo"
                  value={formData.nome}
                  onChange={handleChange}
                />
              </Grid>
              {formData.role === 'aluno' && (
                <Grid item xs={12}>
                  <DatePicker
                    label="Data de Nascimento"
                    value={formData.dataNascimento}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              {formData.role === 'professor' && (
                <>
                  <Grid item xs={12}>
                    <InputMask
                      mask="(99) 99999-9999"
                      value={formData.telefone}
                      onChange={handleChange}
                    >
                      {(inputProps) => (
                        <TextField
                          {...inputProps}
                          required
                          fullWidth
                          name="telefone"
                          label="Telefone"
                        />
                      )}
                    </InputMask>
                  </Grid>
                  <Grid item xs={12}>
                    <InputMask
                      mask="999.999.999-99"
                      value={formData.cpf}
                      onChange={handleChange}
                    >
                      {(inputProps) => (
                        <TextField
                          {...inputProps}
                          required
                          fullWidth
                          name="cpf"
                          label="CPF"
                          error={!!cpfError}
                          helperText={cpfError}
                        />
                      )}
                    </InputMask>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel id="titulacao-label">Titulação</InputLabel>
                      <Select
                        labelId="titulacao-label"
                        name="titulacao"
                        value={formData.titulacao}
                        onChange={handleChange}
                        label="Titulação"
                      >
                        <MenuItem value="graduacao">Graduação</MenuItem>
                        <MenuItem value="especializacao">Especialização</MenuItem>
                        <MenuItem value="mestrado">Mestrado</MenuItem>
                        <MenuItem value="doutorado">Doutorado</MenuItem>
                        <MenuItem value="posdoutorado">Pós-Doutorado</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="senha"
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmarSenha"
                  label="Confirmar Senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Registrar
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/login')}
            >
              Já tem uma conta? Faça login
            </Button>
          </Box>
        </Paper>
      </Container>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={errorMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </LocalizationProvider>
  );
};

export default Register;

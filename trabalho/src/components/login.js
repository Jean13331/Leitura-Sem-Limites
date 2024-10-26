import React, { useState } from 'react';
import { TextField, Button, InputAdornment, IconButton, Snackbar } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState(''); // Alterado para email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos!');
      setOpenSnackbar(true);
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const result = await response.json();
      if (response.ok && result.success) {
        localStorage.setItem('professorEmail', email);
        navigate(result.role === 'aluno' ? '/home-aluno' : '/home-professor');
      } else {
        setErrorMessage(result.message || 'Erro no servidor.');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Erro de login:', error);
      setErrorMessage('Erro ao conectar ao servidor.');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className="login-container">
      <h1 className="app-title">Leitura Sem Limites</h1>
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          <div className="form-group">
            <TextField
              label="Email" // Alterado para "Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Alterado para setEmail
              required
            />
          </div>
          <div className="form-group">
            <TextField
              label="Senha"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <Button 
            variant="contained" 
            className="login-button" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Entrar'}
          </Button>
        </form>
        <div className="register-section">
          <p>Não tem uma conta?</p>
          <Button 
            variant="outlined" 
            className="register-button" 
            onClick={() => navigate('/register')}
            disabled={isLoading}
          >
            Criar conta
          </Button>
        </div>
      </div>
      <Snackbar
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        message={errorMessage}
        autoHideDuration={4000}
      />
    </div>
  );
};

export default Login;

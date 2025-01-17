import React, { useState, useEffect, useRef } from 'react';
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
    Box,
    MenuItem,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    TableSortLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InputMask from 'react-input-mask';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verifica CPFs com todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
};

const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return 'A senha deve ter pelo menos 8 caracteres';
    if (!hasUpperCase) return 'A senha deve ter pelo menos uma letra maiúscula';
    if (!hasLowerCase) return 'A senha deve ter pelo menos uma letra minúscula';
    if (!hasNumbers) return 'A senha deve ter pelo menos um número';
    if (!hasSpecialChar) return 'A senha deve ter pelo menos um caractere especial';
    
    return '';
};

const MaskedTextField = ({ mask, value, onChange, label, name, required, error, helperText }) => {
    return (
        <TextField
            fullWidth
            label={label}
            name={name}
            required={required}
            error={error}
            helperText={helperText}
            value={value || ''}
            onChange={onChange}
            InputProps={{
                inputComponent: ({ inputRef, ...props }) => (
                    <InputMask
                        {...props}
                        mask={mask}
                        value={value || ''}
                        onChange={onChange}
                    >
                        {(inputProps) => (
                            <input {...inputProps} ref={inputRef} />
                        )}
                    </InputMask>
                ),
            }}
        />
    );
};

const ProfessoresComponent = ({ 
    professores,
    searchTerm, 
    statusFilter, 
    orderBy, 
    order, 
    page, 
    rowsPerPage,
    handleSort,
    loading
}) => {
    console.log('ProfessoresComponent - dados recebidos:', professores); // Debug

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    const filteredProfessores = professores.filter(professor => {
        const matchesSearch = !searchTerm || 
            professor.Nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            professor.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            professor.Telefone?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'todos' 
            ? true 
            : statusFilter === 'ativos' 
                ? professor.Status === 1 
                : professor.Status === 0;

        return matchesSearch && matchesStatus;
    });

    // Paginação
    const startIndex = (page - 1) * rowsPerPage;
    const paginatedProfessores = filteredProfessores.slice(startIndex, startIndex + rowsPerPage);

    return (
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
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedProfessores.length > 0 ? (
                        paginatedProfessores.map((professor) => (
                            <TableRow 
                                key={professor.idProfessor}
                                sx={{ 
                                    opacity: professor.Status === 1 ? 1 : 0.5 
                                }}
                            >
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
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                <Typography>Nenhum professor encontrado</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ProfessoresComponent; 
import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';

const Sidebar = ({ onNavigate, isOpen, toggleDrawer, handleLogout }) => {
    const menuItems = [
        { text: 'Home', path: '/home-professor' },
        { text: 'Cadastrar Turma', path: '/cadastrar-turma' },
        { text: 'Cadastrar Sala', path: '/cadastrar-sala' },
        { text: 'Cadastrar Disciplina', path: '/cadastrar-disciplina' },
        { text: 'Reativar Itens', path: '/reativar' },
        { text: 'Professor', path: '/editar-professor' },
        { text: 'Cadastrar Aluno', path: '/cadastrar-aluno' },
    ];

    return (
        <Drawer anchor="left" open={isOpen} onClose={toggleDrawer}>
            <List>
                {menuItems.map((item, index) => (
                    <ListItem button key={index} onClick={() => { onNavigate(item.path); toggleDrawer(); }}>
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
    );
};

export default Sidebar;  // Certifique-se de que esta linha existe

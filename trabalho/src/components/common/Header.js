import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Header = ({ professorEmail, toggleDrawer }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={toggleDrawer}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    Sistema Acadêmico
                </Typography>
                <Typography variant="subtitle1">
                    {professorEmail}
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default Header;

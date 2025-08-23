import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  InputBase,
  alpha,
  styled,
} from '@mui/material';
import {
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MoopsLogo from './MoopsLogo';
import HealthCheck from './HealthCheck';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <AppBar position="static">
      <Toolbar>
        <Box
          onClick={() => navigate('/')}
          sx={{ 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease-in-out',
            },
          }}
        >
          <MoopsLogo size="medium" showText={true} />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box component="form" onSubmit={handleSearch} sx={{ display: 'inline-block' }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search books..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Search>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Health Check Component */}
        <Box sx={{ mr: 2 }}>
          <HealthCheck />
        </Box>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/home')}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              Home
            </Button>
            <IconButton
              color="inherit"
              onClick={() => navigate('/dashboard')}
              title="Dashboard"
            >
              <DashboardIcon />
            </IconButton>
            
            {user && (user as any).isAdmin && (
              <IconButton
                color="inherit"
                onClick={() => navigate('/admin')}
                title="Admin Panel"
              >
                <AdminPanelSettings />
              </IconButton>
            )}
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {user.avatar ? (
                <Avatar src={user.avatar} alt={user.displayName} sx={{ width: 32, height: 32 }} />
              ) : (
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.displayName.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button 
              color="inherit" 
              variant="outlined" 
              onClick={() => navigate('/register')}
              sx={{ borderColor: 'white' }}
            >
              Register
            </Button>
          </Box>
        )}

        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          id="primary-search-account-menu"
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { navigate('/home'); handleMenuClose(); }}>
            Home
          </MenuItem>
          <MenuItem onClick={() => { navigate(`/profile/${user?.username}`); handleMenuClose(); }}>
            Profile
          </MenuItem>
          <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
            Dashboard
          </MenuItem>
          {user && (user as any).isAdmin && (
            <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
              Admin Panel
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

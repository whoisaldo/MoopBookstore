import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { BookProvider } from './contexts/BookContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import BookDetail from './pages/BookDetail';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#D4A574', // Warm brown like Pompompurin's beret
      light: '#E8C4A0',
      dark: '#B8956B',
      contrastText: '#FFF8E7',
    },
    secondary: {
      main: '#F5E6D3', // Cream like Pompompurin's body
      light: '#FFF8E7',
      dark: '#E8D5B7',
      contrastText: '#8B4513',
    },
    background: {
      default: '#FFF8E7', // Very light cream
      paper: '#FFFAF0', // Slightly warmer cream
    },
    text: {
      primary: '#5D4037', // Warm brown for text
      secondary: '#8D6E63', // Lighter brown
    },
    warning: {
      main: '#FF8A65', // Soft coral/orange
    },
    info: {
      main: '#FFAB91', // Warm peach
    },
    success: {
      main: '#A5D6A7', // Soft green (keeping this neutral)
    },
  },
  typography: {
    fontFamily: '"Comic Neue", "Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#5D4037',
    },
    h2: {
      fontWeight: 600,
      color: '#5D4037',
    },
    h3: {
      fontWeight: 600,
      color: '#6D4C41',
    },
    h4: {
      fontWeight: 500,
      color: '#6D4C41',
    },
    h5: {
      fontWeight: 500,
      color: '#6D4C41',
    },
    h6: {
      fontWeight: 500,
      color: '#6D4C41',
    },
  },
  shape: {
    borderRadius: 16, // Rounded corners for cute look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          padding: '10px 24px',
          boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(212, 165, 116, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(212, 165, 116, 0.15)',
          backgroundColor: '#FFFAF0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#FFFAF0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#D4A574',
          boxShadow: '0 2px 12px rgba(212, 165, 116, 0.3)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BookProvider>
          <Router>
            <div className="App">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/search" element={<Search />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/book/:id" element={<BookDetail />} />
              </Routes>
            </div>
          </Router>
        </BookProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

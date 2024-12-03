import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  CssBaseline,
  ThemeProvider,
  createTheme,
  Button
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Profile from './components/Profile';
import Login from './components/Login';
import Signup from './components/Signup';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function NavigationBar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          React Web App
        </Typography>
        <Button color="inherit" component={Link} to="/">Home</Button>
        {currentUser ? (
          <>
            <Button color="inherit" component={Link} to="/profile">Profile</Button>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CssBaseline />
          <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavigationBar />

            <Box component="main" sx={{ flex: 1 }}>
              <Routes>
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={
                  <Container sx={{ mt: 4 }}>
                    <Typography variant="h4" gutterBottom>
                      Welcome to Your React Web App
                    </Typography>
                    <Typography variant="body1" paragraph>
                      This is a modern React application with user authentication and profiles. 
                      Sign up or log in to access your profile!
                    </Typography>
                  </Container>
                } />
              </Routes>
            </Box>

            <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200] }}>
              <Container maxWidth="sm">
                <Typography variant="body2" color="text.secondary" align="center">
                  {new Date().getFullYear()} Your React Web App. All rights reserved.
                </Typography>
              </Container>
            </Box>
          </Box>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

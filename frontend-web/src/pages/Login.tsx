import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Link as MuiLink,
  Chip,
  Divider,
} from '@mui/material';
import { ShieldOutlined, LockOutlined, AccountCircleOutlined } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/authSlice';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('admin@Nirikshan.test');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@Nirikshan.test');
    setPassword('Admin@123');
  };

  const fillDemoInspector = () => {
    setEmail('inspector@Nirikshan.test');
    setPassword('Inspect@123');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0F172A',
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(15, 23, 42, 0.95) 0px, transparent 50%)',
        p: 2,
      }}
    >
      <Paper
        sx={{
          p: { xs: 3, sm: 4.5 },
          width: '100%',
          maxWidth: 440,
          borderRadius: 3.5,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid #1E293B',
          bgcolor: '#FFFFFF',
        }}
      >
        <Stack alignItems="center" spacing={1} sx={{ mb: 3.5 }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)',
            }}
          >
            <ShieldOutlined fontSize="large" />
          </Box>
          <Typography variant="h5" align="center" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Legal Metrix Scanner
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Legal Metrology (Packaged Commodities) Rules, 2011 Verification Platform
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              size="medium"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="medium"
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                bgcolor: '#0F172A',
                py: 1.4,
                fontWeight: 700,
                fontSize: '0.9375rem',
                borderRadius: 2,
                '&:hover': { bgcolor: '#1E293B' },
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Quick Demo Login Helpers
          </Typography>
        </Divider>

        <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 2 }}>
          <Chip
            icon={<AccountCircleOutlined />}
            label="Admin Login"
            onClick={fillDemoAdmin}
            variant="outlined"
            clickable
            sx={{ fontWeight: 700, borderColor: '#CBD5E1' }}
          />
          <Chip
            icon={<LockOutlined />}
            label="Inspector Login"
            onClick={fillDemoInspector}
            variant="outlined"
            clickable
            sx={{ fontWeight: 700, borderColor: '#CBD5E1' }}
          />
        </Stack>

        <Typography variant="body2" align="center" color="text.secondary">
          Don't have an account?{' '}
          <MuiLink component={Link} to="/register" sx={{ color: '#0EA5E9', fontWeight: 700 }}>
            Register New Account
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;

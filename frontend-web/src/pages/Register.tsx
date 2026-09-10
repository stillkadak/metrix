import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  MenuItem,
  Link as MuiLink,
} from '@mui/material';
import { ShieldOutlined } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

const ROLES = [
  { value: 'inspector', label: 'Field Inspector' },
  { value: 'authority', label: 'Metrology Authority' },
  { value: 'manufacturer', label: 'Manufacturer Compliance Admin' },
];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'inspector', department: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.register(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
          maxWidth: 460,
          borderRadius: 3.5,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid #1E293B',
          bgcolor: '#FFFFFF',
        }}
      >
        <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#0F172A',
              color: '#FFFFFF',
            }}
          >
            <ShieldOutlined fontSize="large" />
          </Box>
          <Typography variant="h5" align="center" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Register Account
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Join the Legal Metrology Compliance Inspection Network
          </Typography>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>Account created successfully! Redirecting to login...</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField fullWidth label="Full Name" value={form.full_name} onChange={update('full_name')} required size="small" />
            <TextField fullWidth label="Official Email" type="email" value={form.email} onChange={update('email')} required size="small" />
            <TextField fullWidth label="Password" type="password" value={form.password} onChange={update('password')} required size="small" />
            <TextField select fullWidth label="Inspection Role" value={form.role} onChange={update('role')} size="small">
              {ROLES.map((r) => (
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="Department / Unit" value={form.department} onChange={update('department')} size="small" />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                bgcolor: '#0F172A',
                py: 1.2,
                fontWeight: 700,
                fontSize: '0.875rem',
                borderRadius: 2,
                mt: 1,
                '&:hover': { bgcolor: '#1E293B' },
              }}
            >
              {loading ? 'Registering...' : 'Create Account'}
            </Button>
          </Stack>
        </form>

        <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 3 }}>
          Already have an account?{' '}
          <MuiLink component={Link} to="/login" sx={{ color: '#0EA5E9', fontWeight: 700 }}>
            Sign In
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;

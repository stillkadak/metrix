import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import {
  PersonOutlined,
  ShieldOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';
import { useAppSelector } from '../store/hooks';
import { initials } from '../utils/helpers';

const SettingsPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <PersonOutlined sx={{ color: '#0F172A' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Inspector Profile
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2.5 }} />

            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {initials(user?.full_name || 'Inspector')}
                </Avatar>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {user?.full_name || 'Demo Inspector'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'user@nirikshan.test'}
                  </Typography>
                  <Chip
                    size="small"
                    label={(user?.role || 'inspector').toUpperCase()}
                    sx={{
                      mt: 0.5,
                      fontWeight: 800,
                      fontSize: '0.625rem',
                      bgcolor: '#F1F5F9',
                      color: '#0F172A',
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Department / Unit</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {user?.department || 'Legal Metrology Enforcement Division'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* System & Rule Specs Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <ShieldOutlined sx={{ color: '#0F172A' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Compliance Rule Specifications
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2.5 }} />

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#475569' }}>Standard Specification</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Packaged Commodities Rules, 2011
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#475569' }}>Rule Engine Engine Version</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  v1.2.0 (Active)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#475569' }}>PDF Report Service</Typography>
                <Chip
                  size="small"
                  icon={<CheckCircleOutlined />}
                  label="ReportLab Vector Engine"
                  sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, fontSize: '0.6875rem' }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#475569' }}>OCR Fallback Mode</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Tesseract + Demo Deterministic Engine
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;

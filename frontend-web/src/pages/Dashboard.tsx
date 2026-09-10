import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUpOutlined,
  CheckCircleOutlined,
  ErrorOutlineOutlined,
  DocumentScannerOutlined,
  AddCircleOutline,
  VisibilityOutlined,
  PictureAsPdfOutlined,
  ArrowForwardOutlined,
  AssessmentOutlined,
  HistoryOutlined,
  ReportProblemOutlined,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { analytics as analyticsApi, scans as scansApi } from '../services/api';
import StatsCard from '../components/dashboard/StatsCard';
import TrendChart from '../components/dashboard/TrendChart';
import Loading from '../components/common/Loading';
import { Scan } from '../store/scanSlice';
import { formatDate } from '../utils/helpers';

interface SummaryData {
  total_scans: number;
  scans_today: number;
  compliance_rate: number;
  total_violations: number;
  violations_by_severity: { name: string; value: number }[];
  trend: { date: string; count: number }[];
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#DC2626',
  major: '#EA580C',
  minor: '#64748B',
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SummaryData | null>(null);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      analyticsApi.summary(),
      scansApi.list({ limit: 6 }),
    ])
      .then(([statsRes, scansRes]) => {
        if (mounted) {
          setStats(statsRes.data);
          setRecentScans(scansRes.data);
        }
      })
      .catch(() => {
        if (mounted) setError('Could not load dashboard data. Is the backend running?');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <Loading label="Loading dashboard compliance data..." />;

  const statCards = [
    {
      title: 'Total Scans',
      value: stats?.total_scans ?? 0,
      icon: <DocumentScannerOutlined />,
      color: '#0F172A',
      hint: 'Audit logs',
    },
    {
      title: 'Compliance Rate',
      value: `${stats?.compliance_rate ?? 0}%`,
      icon: <CheckCircleOutlined />,
      color: '#16A34A',
      hint: 'Passed verification',
    },
    {
      title: 'Violations Found',
      value: stats?.total_violations ?? 0,
      icon: <ErrorOutlineOutlined />,
      color: '#DC2626',
      hint: 'Non-compliances',
    },
    {
      title: 'Scans Today',
      value: stats?.scans_today ?? 0,
      icon: <TrendingUpOutlined />,
      color: '#0EA5E9',
      hint: 'Today volume',
    },
  ];

  const severityData = (stats?.violations_by_severity ?? []).map((s) => ({
    name: s.name.toUpperCase(),
    value: s.value,
    color: SEVERITY_COLOR[s.name?.toLowerCase()] ?? '#64748B',
  }));

  return (
    <Box>
      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Primary Header CTA */}
      <Paper sx={{ p: 3, mb: 3.5, border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#FFFFFF' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              Legal Metrology Compliance Hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time Legal Metrology (Packaged Commodities) Rules 2011 inspection metrics and scan logs.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddCircleOutline />}
            onClick={() => navigate('/scan/new')}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 700,
              px: 3,
              py: 1.2,
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.15)',
              whiteSpace: 'nowrap',
            }}
          >
            Start New Scan
          </Button>
        </Stack>
      </Paper>

      {/* Executive Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Main Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        <Grid item xs={12} md={8}>
          <TrendChart title="30-Day Scan Audit Activity Trend" data={stats?.trend ?? []} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              Violations by Severity
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Breakdown of detected label rule failures.
            </Typography>

            {severityData.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                No violations recorded yet.
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {severityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Scans Table */}
      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden', mb: 3.5 }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Recent Scan Audits
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Latest package verification records processed by the team.
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowForwardOutlined />}
            onClick={() => navigate('/scans')}
            sx={{ fontWeight: 700, color: '#0F172A' }}
          >
            View History
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell>Scan Ref</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Compliance Status</TableCell>
                <TableCell align="center">Score</TableCell>
                <TableCell align="center">Violations</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentScans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No scans performed yet. Click "Start New Scan" to begin.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                recentScans.map((scan) => (
                  <TableRow key={scan.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#0F172A' }}>
                        {scan.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {formatDate(scan.scan_date || scan.created_at)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        icon={scan.is_compliant ? <CheckCircleOutlined /> : <ErrorOutlineOutlined />}
                        label={scan.is_compliant ? 'Compliant' : 'Non-Compliant'}
                        sx={{
                          fontWeight: 700,
                          bgcolor: scan.is_compliant ? '#F0FDF4' : '#FEF2F2',
                          color: scan.is_compliant ? '#16A34A' : '#DC2626',
                          border: '1px solid',
                          borderColor: scan.is_compliant ? '#86EFAC' : '#FCA5A5',
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: scan.is_compliant ? '#16A34A' : '#DC2626' }}>
                        {scan.compliance_score != null ? `${Math.round(scan.compliance_score)}%` : '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: (scan.violations?.length || 0) > 0 ? '#DC2626' : '#16A34A' }}>
                        {scan.violations?.length || 0}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View Scan Audit Details">
                          <IconButton size="small" onClick={() => navigate(`/scans/${scan.id}`)} sx={{ color: '#0F172A' }}>
                            <VisibilityOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF Report">
                          <IconButton
                            size="small"
                            component="a"
                            href={scansApi.getPdfUrl(scan.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: '#0EA5E9' }}
                          >
                            <PictureAsPdfOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Quick Action Shortcuts Grid */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            onClick={() => navigate('/scan/new')}
            sx={{
              p: 2.5,
              border: '1px solid #E2E8F0',
              borderRadius: 2.5,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <AddCircleOutline sx={{ fontSize: 32, color: '#0F172A' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>New Scan</Typography>
                <Typography variant="caption" color="text.secondary">Upload label photo</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            onClick={() => navigate('/scans')}
            sx={{
              p: 2.5,
              border: '1px solid #E2E8F0',
              borderRadius: 2.5,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <HistoryOutlined sx={{ fontSize: 32, color: '#0EA5E9' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Scan History</Typography>
                <Typography variant="caption" color="text.secondary">Browse all audits</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            onClick={() => navigate('/reports')}
            sx={{
              p: 2.5,
              border: '1px solid #E2E8F0',
              borderRadius: 2.5,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <AssessmentOutlined sx={{ fontSize: 32, color: '#16A34A' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Reports</Typography>
                <Typography variant="caption" color="text.secondary">PDF audit reports</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            onClick={() => navigate('/violations')}
            sx={{
              p: 2.5,
              border: '1px solid #E2E8F0',
              borderRadius: 2.5,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <ReportProblemOutlined sx={{ fontSize: 32, color: '#DC2626' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Violations</Typography>
                <Typography variant="caption" color="text.secondary">Inspect rule failures</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

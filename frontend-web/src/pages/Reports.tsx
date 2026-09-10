import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  PictureAsPdfOutlined,
  CheckCircleOutlined,
  ErrorOutlineOutlined,
} from '@mui/icons-material';
import { reports as reportsApi, scans as scansApi } from '../services/api';
import { Scan } from '../store/scanSlice';
import { formatDate } from '../utils/helpers';

interface ReportSummary {
  period_days: number;
  total_scans: number;
  compliant_scans: number;
  compliance_rate: number;
  total_violations: number;
  violations_by_severity: { severity: string; count: number }[];
}

const Reports: React.FC = () => {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      reportsApi.summary(days),
      scansApi.list({ limit: 10 }),
    ])
      .then(([summaryRes, scansRes]) => {
        if (mounted) {
          setSummary(summaryRes.data);
          setRecentScans(scansRes.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching reports data:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [days]);

  return (
    <Box>
      {/* Time Period Selector Bar */}
      <Paper sx={{ p: 2.5, mb: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Executive Compliance Report Generator
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select time range for aggregated Legal Metrology compliance metrics.
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Time Horizon</InputLabel>
            <Select
              value={days}
              label="Time Horizon"
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <MenuItem value={7}>Last 7 Days</MenuItem>
              <MenuItem value={30}>Last 30 Days</MenuItem>
              <MenuItem value={90}>Last 90 Days</MenuItem>
              <MenuItem value={365}>Last 1 Year</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Summary Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Total Audited Scans
            </Typography>
            {loading ? (
              <Skeleton width={80} height={40} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                {summary?.total_scans ?? 0}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              In last {days} days
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Compliance Rate
            </Typography>
            {loading ? (
              <Skeleton width={80} height={40} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#16A34A', mt: 0.5 }}>
                {summary?.compliance_rate ?? 0}%
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {summary?.compliant_scans ?? 0} compliant packages
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Total Violations Detected
            </Typography>
            {loading ? (
              <Skeleton width={80} height={40} />
            ) : (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: (summary?.total_violations ?? 0) > 0 ? '#DC2626' : '#16A34A',
                  mt: 0.5,
                }}
              >
                {summary?.total_violations ?? 0}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Regulatory non-compliances
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Active Rules Engine
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
              12 Rules
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Legal Metrology Rules 2011
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Available Individual Audit Reports */}
      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Downloadable PDF Scan Reports
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Official vector PDF audit sheets generated by server-side ReportLab engine.
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell>Audit Ref ID</TableCell>
                <TableCell>Scan Date</TableCell>
                <TableCell>Compliance Status</TableCell>
                <TableCell align="center">Score</TableCell>
                <TableCell align="right">PDF Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={50} /></TableCell>
                    <TableCell align="right"><Skeleton width={100} /></TableCell>
                  </TableRow>
                ))
              ) : recentScans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No scan reports generated yet. Perform a scan to create reports.
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

                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PictureAsPdfOutlined />}
                        component="a"
                        href={scansApi.getPdfUrl(scan.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          borderColor: '#CBD5E1',
                          color: '#0F172A',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        Download PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Reports;

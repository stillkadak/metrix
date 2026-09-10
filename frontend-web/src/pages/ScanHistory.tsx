import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Stack,
  Skeleton,
  Tooltip,
  Pagination,
  Alert,
} from '@mui/material';
import {
  VisibilityOutlined,
  PictureAsPdfOutlined,
  FilterListOutlined,
  SearchOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  ErrorOutlineOutlined,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { scans as scansApi } from '../services/api';
import { Scan } from '../store/scanSlice';
import { formatDate } from '../utils/helpers';

const ScanHistory: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [scansList, setScansList] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const search = searchParams.get('search') || '';
  const complianceFilter = searchParams.get('is_compliant') || 'all';
  const severityFilter = searchParams.get('severity') || 'all';
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const fetchScans = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
      };

      if (search) params.search = search;
      if (complianceFilter === 'compliant') params.is_compliant = true;
      if (complianceFilter === 'non_compliant') params.is_compliant = false;
      if (severityFilter !== 'all') params.severity = severityFilter;

      const response = await scansApi.list(params);
      setScansList(response.data);
    } catch (err: any) {
      setError('Could not load scan history records. Please check API server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [search, complianceFilter, severityFilter, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      searchParams.set('search', val);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
    setPage(1);
  };

  const handleComplianceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val !== 'all') {
      searchParams.set('is_compliant', val);
    } else {
      searchParams.delete('is_compliant');
    }
    setSearchParams(searchParams);
    setPage(1);
  };

  const handleSeverityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val !== 'all') {
      searchParams.set('severity', val);
    } else {
      searchParams.delete('severity');
    }
    setSearchParams(searchParams);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
      {/* Filter Toolbar */}
      <Paper sx={{ p: 2.5, mb: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>
            {/* Search TextField */}
            <TextField
              size="small"
              placeholder="Search by Scan ID or OCR text..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchOutlined sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} />,
              }}
              sx={{ minWidth: 260, bgcolor: '#FFFFFF' }}
            />

            {/* Compliance Select */}
            <TextField
              select
              size="small"
              label="Compliance"
              value={complianceFilter}
              onChange={handleComplianceChange}
              sx={{ minWidth: 150, bgcolor: '#FFFFFF' }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="compliant">Compliant Only</MenuItem>
              <MenuItem value="non_compliant">Non-Compliant Only</MenuItem>
            </TextField>

            {/* Severity Select */}
            <TextField
              select
              size="small"
              label="Severity"
              value={severityFilter}
              onChange={handleSeverityChange}
              sx={{ minWidth: 150, bgcolor: '#FFFFFF' }}
            >
              <MenuItem value="all">All Severities</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="major">Major</MenuItem>
              <MenuItem value="minor">Minor</MenuItem>
            </TextField>
          </Box>

          {(search || complianceFilter !== 'all' || severityFilter !== 'all') && (
            <Button
              size="small"
              startIcon={<ClearOutlined />}
              onClick={handleResetFilters}
              sx={{ color: '#64748B', whiteSpace: 'nowrap' }}
            >
              Reset Filters
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Main Scans Table */}
      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell>Scan ID & Ref</TableCell>
                <TableCell>Scan Date & Time</TableCell>
                <TableCell>Compliance Status</TableCell>
                <TableCell align="center">Compliance Score</TableCell>
                <TableCell align="center">Violations</TableCell>
                <TableCell>Highest Severity</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton width={40} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} /></TableCell>
                  </TableRow>
                ))
              ) : scansList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <FilterListOutlined sx={{ fontSize: 40, color: '#94A3B8', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      No scan history records found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {search || complianceFilter !== 'all' || severityFilter !== 'all'
                        ? 'Try relaxing your filter criteria or search query.'
                        : 'Perform your first package label scan to record results here.'}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/scan/new')}
                      sx={{ bgcolor: '#0F172A', fontWeight: 700 }}
                    >
                      Start New Scan
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                scansList.map((scan) => {
                  const violationsCount = scan.violations?.length || 0;
                  const highestSev = getHighestSeverity(scan.violations);

                  return (
                    <TableRow key={scan.id} hover sx={{ transition: 'background-color 0.15s ease' }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#0F172A' }}>
                          {scan.id.substring(0, 8)}...
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {scan.processing_time_ms ? `${scan.processing_time_ms} ms` : 'Completed'}
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
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: scan.is_compliant ? '#16A34A' : '#DC2626',
                          }}
                        >
                          {scan.compliance_score != null ? `${Math.round(scan.compliance_score)}%` : '—'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 700, color: violationsCount > 0 ? '#DC2626' : '#16A34A' }}>
                          {violationsCount}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {highestSev ? (
                          <Chip
                            size="small"
                            label={highestSev.toUpperCase()}
                            sx={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              bgcolor: highestSev === 'critical' ? '#FEE2E2' : highestSev === 'major' ? '#FFEDD5' : '#F1F5F9',
                              color: highestSev === 'critical' ? '#991B1B' : highestSev === 'major' ? '#C2410C' : '#475569',
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">None</Typography>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View Scan Audit Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/scans/${scan.id}`)}
                              sx={{ color: '#0F172A' }}
                            >
                              <VisibilityOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Download PDF Compliance Report">
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Footer */}
        {scansList.length > 0 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: '1px solid #E2E8F0' }}>
            <Pagination
              count={Math.ceil(scansList.length / pageSize) || 1}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

function getHighestSeverity(violations: any[] = []): string | null {
  if (!violations || violations.length === 0) return null;
  if (violations.some((v) => v.severity === 'critical')) return 'critical';
  if (violations.some((v) => v.severity === 'major')) return 'major';
  return 'minor';
}

export default ScanHistory;

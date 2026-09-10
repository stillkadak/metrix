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
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Skeleton,
  Grid,
} from '@mui/material';
import {
  CheckCircleOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { violations as violationsApi } from '../services/api';
import { formatDate } from '../utils/helpers';

interface ViolationItem {
  id: string;
  scan_id: string;
  rule_code: string;
  rule_description: string;
  field_name?: string;
  extracted_value?: string;
  expected_value?: string;
  severity: 'critical' | 'major' | 'minor';
  created_at: string;
}

const ViolationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [violationsList, setViolationsList] = useState<ViolationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityTab, setSeverityTab] = useState<string>('all');
  const [selectedViolation, setSelectedViolation] = useState<ViolationItem | null>(null);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (severityTab !== 'all') params.severity = severityTab;
      const response = await violationsApi.list(params);
      setViolationsList(response.data);
    } catch (err) {
      console.error('Failed to fetch violations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [severityTab]);

  return (
    <Box>
      {/* Severity Tabs Header */}
      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 3, mb: 3, px: 2, pt: 1 }}>
        <Tabs
          value={severityTab}
          onChange={(_, val) => setSeverityTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="All Violations" value="all" sx={{ fontWeight: 700 }} />
          <Tab label="Critical Severity" value="critical" sx={{ fontWeight: 700, color: '#DC2626' }} />
          <Tab label="Major Severity" value="major" sx={{ fontWeight: 700, color: '#EA580C' }} />
          <Tab label="Minor Severity" value="minor" sx={{ fontWeight: 700, color: '#475569' }} />
        </Tabs>
      </Paper>

      {/* Main Violations Table */}
      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell>Rule Code</TableCell>
                <TableCell>Violation Description</TableCell>
                <TableCell>Field</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Found Value</TableCell>
                <TableCell>Date Recorded</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton width={200} /></TableCell>
                    <TableCell><Skeleton width={90} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={110} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} /></TableCell>
                  </TableRow>
                ))
              ) : violationsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CheckCircleOutlined sx={{ fontSize: 44, color: '#16A34A', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      No active violations recorded
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All packaging labels checked meet the required Legal Metrology standards.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                violationsList.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#0F172A' }}>
                        {item.rule_code}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {item.rule_description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Required: {item.expected_value || 'Mandatory package declaration'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        {item.field_name || 'N/A'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={item.severity.toUpperCase()}
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.6875rem',
                          bgcolor: item.severity === 'critical' ? '#FEE2E2' : item.severity === 'major' ? '#FFEDD5' : '#F1F5F9',
                          color: item.severity === 'critical' ? '#991B1B' : item.severity === 'major' ? '#C2410C' : '#475569',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: item.extracted_value ? '#0F172A' : '#DC2626', fontWeight: 600 }}>
                        {item.extracted_value || 'Not Found'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.created_at)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedViolation(item)}
                        sx={{ borderColor: '#CBD5E1', color: '#0F172A', fontWeight: 700, fontSize: '0.75rem' }}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detail Dialog Modal */}
      <Dialog open={Boolean(selectedViolation)} onClose={() => setSelectedViolation(null)} maxWidth="sm" fullWidth>
        {selectedViolation && (
          <>
            <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>
              Violation Details: {selectedViolation.rule_code}
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Rule Description</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {selectedViolation.rule_description}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Detected Value</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: selectedViolation.extracted_value ? '#0F172A' : '#DC2626' }}>
                      {selectedViolation.extracted_value || 'Missing / Not Found'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Expected Requirement</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A' }}>
                      {selectedViolation.expected_value || 'Mandatory Declaration'}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ p: 2, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', mb: 0.5 }}>
                    Manufacturer Corrective Action Recommendation
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#78350F' }}>
                    Correct package Artwork/Principal Display Panel to include the missing declaration clearly. Ensure font size meets standard threshold under India Legal Metrology (Packaged Commodities) Rules, 2011 before publishing to market.
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
              <Button onClick={() => setSelectedViolation(null)} color="inherit">
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  const sId = selectedViolation.scan_id;
                  setSelectedViolation(null);
                  navigate(`/scans/${sId}`);
                }}
                sx={{ bgcolor: '#0F172A', fontWeight: 700 }}
              >
                Go to Parent Scan
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ViolationsPage;

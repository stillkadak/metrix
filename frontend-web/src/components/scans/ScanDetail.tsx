import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutlined,
  ErrorOutlineOutlined,
  PictureAsPdfOutlined,
  DocumentScannerOutlined,
} from '@mui/icons-material';
import type { Scan } from '../../store/scanSlice';
import { formatDate } from '../../utils/helpers';
import { scans as scansApi } from '../../services/api';

interface ScanDetailProps {
  scan: Scan;
}

const ScanDetailComponent: React.FC<ScanDetailProps> = ({ scan }) => {
  const imageUrl = scan.image_path
    ? `${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '')}/uploads/${scan.image_path.split(/[/\\]/).pop()}`
    : null;

  const violations = scan.violations || [];
  const isCompliant = scan.is_compliant;

  // Compute field status overview for the rule execution matrix
  const fieldList = [
    { code: 'R001', name: 'MRP Declaration', field: 'mrp', desc: 'Maximum Retail Price must be declared with ₹ or Rs.' },
    { code: 'R003', name: 'Net Quantity', field: 'net_quantity', desc: 'Net quantity must be declared in standard units' },
    { code: 'R005', name: 'Manufacturing Date', field: 'manufacturing_date', desc: 'Date of manufacture in MM/YYYY format' },
    { code: 'R007', name: 'Manufacturer Details', field: 'manufacturer', desc: 'Name and complete address of manufacturer' },
    { code: 'R009', name: 'Country of Origin', field: 'country_of_origin', desc: 'Country of origin for imported goods' },
    { code: 'R010', name: 'Consumer Care Details', field: 'consumer_care', desc: 'Helpline number or customer support email' },
  ];

  return (
    <Grid container spacing={3}>
      {/* Top Banner & Header Summary */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: { xs: 2.5, md: 3 },
            border: '1px solid',
            borderColor: isCompliant ? '#86EFAC' : '#FCA5A5',
            bgcolor: isCompliant ? '#F0FDF4' : '#FEF2F2',
            borderRadius: 3,
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  icon={isCompliant ? <CheckCircleOutlined /> : <ErrorOutlineOutlined />}
                  label={isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT / VIOLATIONS DETECTED'}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.875rem',
                    bgcolor: isCompliant ? '#16A34A' : '#DC2626',
                    color: '#FFFFFF',
                    px: 1,
                  }}
                />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Audit Ref: {scan.id}
                </Typography>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Legal Metrology Audit Findings
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<PictureAsPdfOutlined />}
              component="a"
              href={scansApi.getPdfUrl(scan.id)}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 700,
                px: 2.5,
                py: 1,
                boxShadow: '0 2px 4px rgba(15,23,42,0.15)',
              }}
            >
              Download PDF Report
            </Button>
          </Stack>
        </Paper>
      </Grid>

      {/* Left Column: Image Preview & Raw OCR */}
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 3, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#0F172A' }}>
            Scanned Packaging Label Image
          </Typography>
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt="Scanned package"
              sx={{
                width: '100%',
                maxHeight: 400,
                borderRadius: 2,
                objectFit: 'contain',
                bgcolor: '#000000',
                border: '1px solid #E2E8F0',
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <Box sx={{ p: 4, bgcolor: '#F8FAFC', textAlign: 'center', borderRadius: 2 }}>
              <DocumentScannerOutlined sx={{ fontSize: 40, color: '#94A3B8' }} />
              <Typography variant="body2" color="text.secondary">No preview image available</Typography>
            </Box>
          )}

          <Stack direction="row" spacing={3} sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #E2E8F0' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Scan Timestamp</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatDate(scan.scan_date || scan.created_at)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">Processing Time</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {scan.processing_time_ms ? `${scan.processing_time_ms} ms` : '-'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">OCR Confidence</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {scan.ocr_confidence ? `${Math.round(scan.ocr_confidence * 100)}%` : '-'}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Raw OCR Text Log */}
        {scan.ocr_text && (
          <Paper sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#0F172A' }}>
              Extracted OCR Raw Text
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: '#F8FAFC',
                borderRadius: 2,
                border: '1px solid #E2E8F0',
                maxHeight: 250,
                overflowY: 'auto',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.78125rem',
                  whiteSpace: 'pre-wrap',
                  color: '#334155',
                }}
              >
                {scan.ocr_text}
              </Typography>
            </Box>
          </Paper>
        )}
      </Grid>

      {/* Right Column: Compliance Matrix & Violations */}
      <Grid item xs={12} md={7}>
        {/* Compliance Rule Matrix */}
        <Paper sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#0F172A' }}>
            Legal Metrology (Packaged Commodities) Rule Evaluation Matrix
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell>Code</TableCell>
                  <TableCell>Rule Declaration</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fieldList.map((item) => {
                  const violation = violations.find((v) => v.field_name === item.field || v.rule_code === item.code);
                  const pass = !violation;

                  return (
                    <TableRow key={item.code} hover>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                          {item.code}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.desc}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={pass ? 'PASS' : 'FAIL'}
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.6875rem',
                            bgcolor: pass ? '#F0FDF4' : '#FEF2F2',
                            color: pass ? '#16A34A' : '#DC2626',
                            border: '1px solid',
                            borderColor: pass ? '#86EFAC' : '#FCA5A5',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Detailed Violations Section */}
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#0F172A' }}>
          Detailed Violation Records ({violations.length})
        </Typography>

        {violations.length === 0 ? (
          <Alert severity="success" sx={{ border: '1px solid #86EFAC', borderRadius: 2 }}>
            No legal metrology violations detected on this package label.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {violations.map((v) => (
              <Paper key={v.id} sx={{ p: 2.5, border: '1px solid #FCA5A5', bgcolor: '#FFFFFF', borderRadius: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      {v.rule_code} — {v.rule_description}
                    </Typography>
                    {v.field_name && (
                      <Typography variant="caption" color="text.secondary">
                        Affected Declaration Field: <b>{v.field_name}</b>
                      </Typography>
                    )}
                  </Box>

                  <Chip
                    size="small"
                    label={(v.severity || 'minor').toUpperCase()}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.6875rem',
                      bgcolor: v.severity === 'critical' ? '#FEE2E2' : v.severity === 'major' ? '#FFEDD5' : '#F1F5F9',
                      color: v.severity === 'critical' ? '#991B1B' : v.severity === 'major' ? '#C2410C' : '#475569',
                    }}
                  />
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Extracted / Detected Value</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: v.extracted_value ? '#0F172A' : '#DC2626' }}>
                      {v.extracted_value || 'Not Detected'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Mandatory Legal Requirement</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                      {v.expected_value || 'Required by Legal Metrology Rules, 2011'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        )}
      </Grid>
    </Grid>
  );
};

export default ScanDetailComponent;

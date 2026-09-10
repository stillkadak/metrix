import React from 'react';
import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Scan } from '../../store/scanSlice';
import { formatDate, formatScore, scoreColor } from '../../utils/helpers';

interface ScanListProps {
  scans: Scan[];
}

const ScanList: React.FC<ScanListProps> = ({ scans }) => {
  const navigate = useNavigate();

  if (scans.length === 0) {
    return (
      <Paper sx={{ p: 4, border: '1px solid #DEDACD', textAlign: 'center' }}>
        <Typography color="text.secondary">No scans yet — upload a package image above to get started.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ border: '1px solid #DEDACD' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Compliance Score</TableCell>
            <TableCell>Violations</TableCell>
            <TableCell align="right">OCR Confidence</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scans.map((scan) => (
            <TableRow
              key={scan.id}
              hover
              onClick={() => navigate(`/scans/${scan.id}`)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{formatDate(scan.scan_date)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={scan.is_compliant ? 'Compliant' : 'Non-compliant'}
                  color={scan.is_compliant ? 'success' : 'error'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: scoreColor(scan.compliance_score),
                    }}
                  />
                  {formatScore(scan.compliance_score)}
                </Box>
              </TableCell>
              <TableCell>{scan.violations?.length ?? 0}</TableCell>
              <TableCell align="right">
                {scan.ocr_confidence != null ? `${Math.round(scan.ocr_confidence * 100)}%` : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScanList;

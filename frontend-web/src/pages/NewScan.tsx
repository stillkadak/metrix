import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  LinearProgress,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  CloudUploadOutlined,
  CheckCircleOutlined,
  ErrorOutlineOutlined,
  DescriptionOutlined,
  DownloadOutlined,
  ArrowForwardOutlined,
  RefreshOutlined,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { scans as scansApi } from '../services/api';
import { Scan } from '../store/scanSlice';

const PROCESSING_STEPS = [
  'Uploading image payload...',
  'Running OCR engine text extraction...',
  'Parsing mandatory legal declarations (MRP, Net Qty, Mfg Date)...',
  'Evaluating Legal Metrology (Packaged Commodities) Rules, 2011...',
  'Generating compliance audit report...',
];

const NewScan: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedScan, setCompletedScan] = useState<Scan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setCompletedScan(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.webp'] },
    multiple: false,
  });

  const handleStartScan = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setCurrentStepIndex(0);

    // Animate progress steps
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < PROCESSING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await scansApi.upload(formData);
      clearInterval(stepInterval);
      setCurrentStepIndex(PROCESSING_STEPS.length - 1);
      setCompletedScan(response.data);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.response?.data?.detail || 'Failed to process scan. Please check file format and backend server.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCompletedScan(null);
    setError(null);
    setUploading(false);
  };

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      {!completedScan ? (
        <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid #E2E8F0', borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
            Upload Package Label
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload a clear photo or screenshot of the product packaging showing declarations (MRP, Net Wt, Mfg date, Manufacturer).
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!selectedFile ? (
            <Box
              {...getRootProps()}
              sx={{
                p: 5,
                border: '2px dashed',
                borderColor: isDragActive ? '#0F172A' : '#CBD5E1',
                borderRadius: 2.5,
                bgcolor: isDragActive ? '#F1F5F9' : '#F8FAFC',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#0F172A',
                  bgcolor: '#F1F5F9',
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadOutlined sx={{ fontSize: 48, color: '#64748B', mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                {isDragActive ? 'Drop image file here...' : 'Click to upload or drag & drop'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Supports JPG, PNG, WEBP, BMP (Max 10MB)
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: 2,
                    p: 1,
                    bgcolor: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxHeight: 280,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={previewUrl!}
                    alt="Preview"
                    sx={{ width: '100%', height: 'auto', maxHeight: 260, objectFit: 'contain' }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={7}>
                <Stack spacing={2} sx={{ height: '100%', justifyContent: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                      Selected File
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type}
                    </Typography>
                  </Box>

                  {uploading && (
                    <Box sx={{ my: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {PROCESSING_STEPS[currentStepIndex]}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {Math.round(((currentStepIndex + 1) / PROCESSING_STEPS.length) * 100)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={((currentStepIndex + 1) / PROCESSING_STEPS.length) * 100}
                        sx={{ height: 8, borderRadius: 4, bgcolor: '#E2E8F0' }}
                      />
                    </Box>
                  )}

                  <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                    <Button
                      variant="contained"
                      disabled={uploading}
                      onClick={handleStartScan}
                      startIcon={<DescriptionOutlined />}
                      sx={{ bgcolor: '#0F172A', py: 1.2, px: 3, fontWeight: 700 }}
                    >
                      {uploading ? 'Processing Scan...' : 'Start Compliance Check'}
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={uploading}
                      onClick={handleReset}
                      color="inherit"
                      sx={{ borderColor: '#CBD5E1' }}
                    >
                      Change Image
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          )}
        </Paper>
      ) : (
        /* Completed Scan Result Summary Card */
        <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid #E2E8F0', borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Scan Complete
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Legal Metrology Findings
              </Typography>
            </Box>

            <Chip
              icon={completedScan.is_compliant ? <CheckCircleOutlined /> : <ErrorOutlineOutlined />}
              label={completedScan.is_compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
              sx={{
                px: 1.5,
                py: 2,
                fontWeight: 800,
                fontSize: '0.875rem',
                bgcolor: completedScan.is_compliant ? '#F0FDF4' : '#FEF2F2',
                color: completedScan.is_compliant ? '#16A34A' : '#DC2626',
                border: '1px solid',
                borderColor: completedScan.is_compliant ? '#86EFAC' : '#FCA5A5',
              }}
            />
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Compliance Score
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: completedScan.is_compliant ? '#16A34A' : '#DC2626' }}>
                {completedScan.compliance_score != null ? `${roundScore(completedScan.compliance_score)}%` : '0%'}
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Violations Found
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: completedScan.violations.length === 0 ? '#16A34A' : '#DC2626' }}>
                {completedScan.violations.length}
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Processing Speed
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {completedScan.processing_time_ms ? `${completedScan.processing_time_ms} ms` : '-'}
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                OCR Confidence
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {completedScan.ocr_confidence ? `${Math.round(completedScan.ocr_confidence * 100)}%` : '-'}
              </Typography>
            </Grid>
          </Grid>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
            <Button
              variant="contained"
              startIcon={<ArrowForwardOutlined />}
              onClick={() => navigate(`/scans/${completedScan.id}`)}
              sx={{ bgcolor: '#0F172A', py: 1.2, px: 3, fontWeight: 700 }}
            >
              View Full Audit Breakdown
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadOutlined />}
              component="a"
              href={scansApi.getPdfUrl(completedScan.id)}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ borderColor: '#CBD5E1', color: '#0F172A', fontWeight: 700 }}
            >
              Download PDF Report
            </Button>
            <Button
              variant="text"
              startIcon={<RefreshOutlined />}
              onClick={handleReset}
              sx={{ color: '#64748B' }}
            >
              Scan Another Package
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

function roundScore(score: number): number {
  return Math.round(score * 10) / 10;
}

export default NewScan;

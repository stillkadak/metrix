import React, { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
import { CloudUploadOutlined } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { scans } from '../../services/api';

interface ScanUploadProps {
  onUploadComplete: (scanId: string) => void;
}

const ScanUpload: React.FC<ScanUploadProps> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await scans.upload(formData);
      onUploadComplete(response.data.id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(100);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Package Image
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'transparent',
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadOutlined sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
        <Typography>
          {isDragActive
            ? 'Drop the image here...'
            : 'Drag & drop a package image, or click to select'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Supports JPG, PNG, BMP, TIFF
        </Typography>
      </Box>

      {preview && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Preview:</Typography>
          <img
            src={preview}
            alt="Package preview"
            style={{
              maxWidth: '100%',
              maxHeight: 300,
              objectFit: 'contain',
              marginTop: 8,
            }}
          />
        </Box>
      )}

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">Processing scan...</Typography>
          <LinearProgress value={progress} sx={{ mt: 1 }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default ScanUpload;

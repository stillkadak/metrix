import React, { useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ScanUpload from '../components/scans/ScanUpload';
import ScanList from '../components/scans/ScanList';
import Loading from '../components/common/Loading';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchScans } from '../store/scanSlice';

const Scans: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, status } = useAppSelector((state) => state.scans);

  useEffect(() => {
    dispatch(fetchScans());
  }, [dispatch]);

  const handleUploadComplete = (scanId: string) => {
    dispatch(fetchScans());
    navigate(`/scans/${scanId}`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Scans
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload a package label photo to run OCR and check it against Legal Metrology rules.
      </Typography>

      <Stack spacing={3}>
        <ScanUpload onUploadComplete={handleUploadComplete} />
        {status === 'loading' ? <Loading fullHeight={false} label="Loading scans…" /> : <ScanList scans={items} />}
      </Stack>
    </Box>
  );
};

export default Scans;

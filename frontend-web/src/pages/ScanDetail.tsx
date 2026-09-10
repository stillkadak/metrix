import React, { useEffect } from 'react';
import { Box, Button, Alert } from '@mui/material';
import { ArrowBackOutlined } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import ScanDetail from '../components/scans/ScanDetail';
import Loading from '../components/common/Loading';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchScan, clearCurrentScan } from '../store/scanSlice';

const ScanDetailPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const scan = useAppSelector((state) => state.scans.current);

  useEffect(() => {
    if (scanId) dispatch(fetchScan(scanId));
    return () => {
      dispatch(clearCurrentScan());
    };
  }, [dispatch, scanId]);

  if (!scan || scan.id !== scanId) return <Loading label="Loading scan…" />;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackOutlined />}
        onClick={() => navigate('/scans')}
        sx={{ mb: 2 }}
      >
        Back to Scans
      </Button>
      {!scan.is_compliant && (
        <Alert severity="error" sx={{ mb: 3 }}>
          This label has one or more Legal Metrology violations. Review details below.
        </Alert>
      )}
      <ScanDetail scan={scan} />
    </Box>
  );
};

export default ScanDetailPage;

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  label?: string;
  fullHeight?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ label = 'Loading…', fullHeight = true }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      height: fullHeight ? '60vh' : 'auto',
      py: fullHeight ? 0 : 6,
      width: '100%',
    }}
  >
    <CircularProgress size={36} thickness={4} />
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default Loading;

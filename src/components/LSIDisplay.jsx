import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const LSIDisplay = ({ lsi }) => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="subtitle1" color="text.secondary">
        Langelier Saturation Index: <strong>{lsi.toFixed(2)}</strong>
      </Typography>
      <Paper 
        elevation={0} 
        sx={{ 
          mt: 2, 
          p: 2, 
          backgroundColor: lsi >= -0.3 && lsi <= 0.3 
            ? 'success.light' 
            : 'error.light',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="body1">
          {lsi >= -0.3 && lsi <= 0.3
            ? 'Water is properly balanced'
            : lsi > 0.3
            ? 'Water is oversaturated (tendency to scale)'
            : 'Water is undersaturated (tendency to be corrosive)'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default LSIDisplay; 
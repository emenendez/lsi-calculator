import React from 'react';
import { Box, Slider, Typography, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LSI_CONSTANTS } from '../utils/lsiCalculator';

const ParameterSection = ({ 
  title, 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  unit, 
  chartData,
  currentLSI 
}) => {
  const formatValue = (val) => {
    if (unit === '°F') return `${val}°F`;
    if (unit === 'ppm') return `${val} ppm`;
    return val.toFixed(1);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current value: {formatValue(value)} {unit}
        </Typography>
      </Box>

      <Box sx={{ height: 200, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="value" 
              tickFormatter={formatValue}
              domain={[min, max]}
            />
            <YAxis 
              domain={[-1, 1]}
              tickFormatter={(val) => val.toFixed(1)}
            />
            <Tooltip 
              formatter={(val) => [`LSI: ${val.toFixed(2)}`, 'LSI']}
              labelFormatter={formatValue}
            />
            <Bar 
              dataKey="lsi" 
              fill="#1976d2"
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        valueLabelDisplay="auto"
        valueLabelFormat={formatValue}
        sx={{
          '& .MuiSlider-thumb': {
            height: 24,
            width: 24,
            backgroundColor: '#fff',
            border: '2px solid currentColor',
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow: 'inherit',
            },
            '&:before': {
              display: 'none',
            },
          },
        }}
      />
    </Paper>
  );
};

export default ParameterSection; 
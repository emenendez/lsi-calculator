import React, { useRef, useEffect, useState } from 'react';
import { Box, Slider, Typography, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
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
  const chartRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    if (chartRef.current) {
      const containerWidth = chartRef.current.getBoundingClientRect().width;
      // Subtract left and right margins (40px each)
      setChartWidth(containerWidth - 80);
    }
  }, [chartData]);

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

      <Box ref={chartRef} sx={{ height: 200, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData}
            margin={{ left: 40, right: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
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
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.lsi >= 0 ? '#1976d2' : '#d32f2f'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }}>
        <Box sx={{ 
          width: chartWidth,
          px: 2,
          ml: 12,  // Increased left margin to account for Y-axis width (56px = 7 units in MUI)
          mr: 4,
        }}>
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
        </Box>
      </Box>
    </Paper>
  );
};

export default ParameterSection; 
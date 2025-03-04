import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import ParameterSection from './components/ParameterSection';
import LSIDisplay from './components/LSIDisplay';
import { calculateLSI, generateChartData, LSI_CONSTANTS } from './utils/lsiCalculator';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

const STORAGE_KEY = 'lsi_calculator_params';

const defaultParams = {
  pH: 7.5,
  temperature: 100,
  calcium: 150,
  alkalinity: 100,
  cya: 8,
  tds: 300,
};

function App() {
  const [params, setParams] = useState(() => {
    const savedParams = localStorage.getItem(STORAGE_KEY);
    // Merge saved params with defaults to ensure all parameters exist
    return {
      ...defaultParams,
      ...(savedParams ? JSON.parse(savedParams) : {})
    };
  });

  const currentLSI = calculateLSI(params);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }, [params]);

  const handleParamChange = (param) => (event, newValue) => {
    setParams(prev => ({
      ...prev,
      [param]: newValue
    }));
  };

  const getParamConfig = (param) => {
    const configs = {
      pH: {
        title: 'pH Level',
        unit: '',
        step: 0.1,
        min: LSI_CONSTANTS.MIN_PH,
        max: LSI_CONSTANTS.MAX_PH,
      },
      temperature: {
        title: 'Temperature',
        unit: '°F',
        step: 1,
        min: LSI_CONSTANTS.MIN_TEMP,
        max: LSI_CONSTANTS.MAX_TEMP,
      },
      calcium: {
        title: 'Calcium Hardness',
        unit: 'ppm',
        step: 10,
        min: LSI_CONSTANTS.MIN_CALCIUM,
        max: LSI_CONSTANTS.MAX_CALCIUM,
      },
      alkalinity: {
        title: 'Total Alkalinity',
        unit: 'ppm',
        step: 10,
        min: LSI_CONSTANTS.MIN_ALKALINITY,
        max: LSI_CONSTANTS.MAX_ALKALINITY,
      },
      cya: {
        title: 'Cyanuric Acid',
        unit: 'ppm',
        step: 1,
        min: LSI_CONSTANTS.MIN_CYA,
        max: LSI_CONSTANTS.MAX_CYA,
      },
      tds: {
        title: 'Total Dissolved Solids',
        unit: 'ppm',
        step: 100,
        min: LSI_CONSTANTS.MIN_TDS,
        max: LSI_CONSTANTS.MAX_TDS,
      },
    };
    return configs[param];
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h1" gutterBottom>
            LSI Calculator
          </Typography>
          <LSIDisplay lsi={currentLSI} />
        </Box>

        {Object.keys(params).map((param) => {
          const config = getParamConfig(param);
          const chartData = generateChartData(param, params[param], params);
          
          return (
            <ParameterSection
              key={param}
              title={config.title}
              value={params[param]}
              onChange={handleParamChange(param)}
              min={config.min}
              max={config.max}
              step={config.step}
              unit={config.unit}
              chartData={chartData}
              currentLSI={currentLSI}
            />
          );
        })}

        <Box sx={{ mt: 4 }}>
          <LSIDisplay lsi={currentLSI} />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;

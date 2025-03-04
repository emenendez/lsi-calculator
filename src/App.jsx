import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Slider
} from '@mui/material';
import ParameterSection from './components/ParameterSection';
import LSIDisplay from './components/LSIDisplay';
import { calculateLSI, generateChartData, LSI_CONSTANTS } from './utils/lsiCalculator';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Register service worker
serviceWorkerRegistration.register();

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
  volume: 220,
  targetAlkalinity: 100,
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

        {Object.keys(params)
          .filter(param => ['pH', 'temperature', 'calcium', 'alkalinity', 'cya', 'tds'].includes(param))
          .map((param) => {
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

        <Box sx={{ mt: 4, mb: 4 }}>
          <LSIDisplay lsi={currentLSI} />
        </Box>

        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 3,
            backgroundColor: 'background.paper',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            Alkalinity Increaser Calculator
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Hot Tub Volume (gallons)
              </Typography>
              <Slider
                value={params.volume || 400}
                onChange={handleParamChange('volume')}
                min={100}
                max={1000}
                step={10}
                valueLabelDisplay="on"
                sx={{ width: '100%' }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Target Alkalinity (ppm)
              </Typography>
              <Slider
                value={params.targetAlkalinity || 100}
                onChange={handleParamChange('targetAlkalinity')}
                min={LSI_CONSTANTS.MIN_ALKALINITY}
                max={LSI_CONSTANTS.MAX_ALKALINITY}
                step={10}
                valueLabelDisplay="on"
                sx={{ width: '100%' }}
              />
            </Box>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
              <Typography variant="h6">
                Amount to Add: {Math.floor(((params.targetAlkalinity || 100) - (params.alkalinity || 0))/20 * (params.volume || 400)/200 * 28.3495)} grams
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 3,
            backgroundColor: 'background.paper',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            Ounce to Gram Converter
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Ounces (oz)
              </Typography>
              <Slider
                defaultValue={1}
                min={0}
                max={4}
                step={0.05}
                valueLabelDisplay="on"
                onChange={(e, value) => {
                  const gramValue = document.getElementById('gramValue');
                  if (gramValue) {
                    gramValue.textContent = (value * 28.3495).toFixed(1);
                  }
                }}
                sx={{ width: '100%' }}
              />
            </Box>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
              <Typography variant="h6">
                <span id="gramValue">28.3</span> g
              </Typography>
            </Box>
          </Box>
        </Paper>

      </Container>
    </ThemeProvider>
  );
}

export default App;

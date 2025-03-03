// LSI calculation constants and functions
export const LSI_CONSTANTS = {
  SATURATION_PH: 12.1,
  MIN_TEMP: 80,
  MAX_TEMP: 110,
  MIN_PH: 6.0,
  MAX_PH: 8.4,
  MIN_CALCIUM: 0,
  MAX_CALCIUM: 500,
  MIN_ALKALINITY: 0,
  MAX_ALKALINITY: 200,
  MIN_CYA: 0,
  MAX_CYA: 50,
};

// Temperature factor lookup table (simplified)
const getTemperatureFactor = (temp) => {
  const factors = {
    32: 0.0,
    40: 0.1,
    50: 0.2,
    60: 0.3,
    70: 0.4,
    80: 0.5,
    90: 0.6,
    100: 0.7,
    110: 0.8,
    120: 0.9,
  };
  
  // Find closest temperature in lookup table
  const temps = Object.keys(factors).map(Number);
  const closest = temps.reduce((prev, curr) => 
    Math.abs(curr - temp) < Math.abs(prev - temp) ? curr : prev
  );
  
  return factors[closest];
};

// Calcium factor calculation
const getCalciumFactor = (calcium) => {
  return Math.log10((calcium + 1) / 40);
};

// Alkalinity factor calculation
const getAlkalinityFactor = (alkalinity) => {
  return Math.log10((alkalinity + 1) / 80);
};

// CYA factor calculation (simplified)
const getCYAFactor = (cya) => {
  return -0.1 * (cya / 30); // Simplified approximation
};

// Main LSI calculation function
export const calculateLSI = (params) => {
  const { pH, temperature, calcium, alkalinity, cya } = params;
  
  const tf = getTemperatureFactor(temperature);
  const cf = getCalciumFactor(calcium);
  const af = getAlkalinityFactor(alkalinity);
  const cyaf = getCYAFactor(cya);
  
  return pH + tf + cf + af + cyaf - LSI_CONSTANTS.SATURATION_PH;
};

// Generate data points for charts
export const generateChartData = (param, value, otherParams) => {
  const data = [];
  let min, max, step;
  
  switch (param) {
    case 'pH':
      min = LSI_CONSTANTS.MIN_PH;
      max = LSI_CONSTANTS.MAX_PH;
      step = 0.1;
      break;
    case 'temperature':
      min = LSI_CONSTANTS.MIN_TEMP;
      max = LSI_CONSTANTS.MAX_TEMP;
      step = 1;
      break;
    case 'calcium':
      min = LSI_CONSTANTS.MIN_CALCIUM;
      max = LSI_CONSTANTS.MAX_CALCIUM;
      step = 10;
      break;
    case 'alkalinity':
      min = LSI_CONSTANTS.MIN_ALKALINITY;
      max = LSI_CONSTANTS.MAX_ALKALINITY;
      step = 10;
      break;
    case 'cya':
      min = LSI_CONSTANTS.MIN_CYA;
      max = LSI_CONSTANTS.MAX_CYA;
      step = 1;
      break;
    default:
      return [];
  }
  
  for (let i = min; i <= max; i += step) {
    const params = {
      ...otherParams,
      [param]: i,
    };
    data.push({
      value: i,
      lsi: calculateLSI(params),
    });
  }
  
  return data;
}; 
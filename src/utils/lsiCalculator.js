// LSI calculation constants and functions
export const LSI_CONSTANTS = {
  SATURATION_PH: 9.3, // Base saturation pH before adjustments
  MIN_TEMP: 80,
  MAX_TEMP: 110,
  MIN_PH: 6.0,
  MAX_PH: 8.4,
  MIN_CALCIUM: 0,
  MAX_CALCIUM: 1000,
  MIN_ALKALINITY: 0,
  MAX_ALKALINITY: 400,
  MIN_CYA: 0,
  MAX_CYA: 50,
  MIN_TDS: 300,
  MAX_TDS: 3000,
};

// Temperature factor calculation using proper formula
// -13.12 x Log10(oC + 273) + 34.55
const getTemperatureFactor = (temp) => {
  // Convert Fahrenheit to Celsius for internal calculation
  const tempC = (temp - 32) * (5/9);
  return (-13.12 * Math.log10(tempC + 273)) + 34.55;
};

// Calcium factor calculation using proper formula
const getCalciumFactor = (calcium) => {
  return Math.log10(calcium) - 0.4;
};

// Calculate cyanurate alkalinity based on CYA and pH
const getCyanurateAlkalinity = (cya, pH) => {
  if (cya <= 0) return 0;
  // Calculate ionization fraction (alpha)
  const alpha = 1 / (1 + Math.pow(10, 6.51 - pH));
  // Return cyanurate alkalinity contribution
  return cya * alpha;
};

// Alkalinity factor calculation using proper formula
const getAlkalinityFactor = (alkalinity, cya, pH) => {
  // Subtract cyanurate alkalinity to total alkalinity
  const cyaAlkalinity = getCyanurateAlkalinity(cya, pH);
  const effectiveAlkalinity = alkalinity - cyaAlkalinity;
  return Math.log10(effectiveAlkalinity);
};

// TDS factor calculation using proper formula
// (Log10[TDS] - 1)/10
const getTDSFactor = (tds) => {
  return (Math.log10(tds) - 1)/10;
};

// Calculate saturation pH based on temperature, TDS, and other factors
const calculateSaturationPH = (tf, cf, af, tdsFactor) => {
  return LSI_CONSTANTS.SATURATION_PH + tdsFactor + tf - cf - af;
};

// Main LSI calculation function
export const calculateLSI = (params) => {
  const { 
    pH, 
    temperature, 
    calcium, 
    alkalinity, 
    cya,
    tds
  } = params;
  
  const tf = getTemperatureFactor(temperature);
  const cf = getCalciumFactor(calcium);
  const af = getAlkalinityFactor(alkalinity, cya, pH);
  const tdsFactor = getTDSFactor(tds);
  
  // Calculate saturation pH dynamically
  const pHs = calculateSaturationPH(tf, cf, af, tdsFactor);
  
  // Calculate final LSI
  return pH - pHs;
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
    case 'tds':
      min = LSI_CONSTANTS.MIN_TDS;
      max = LSI_CONSTANTS.MAX_TDS;
      step = 100;
      break;
    default:
      console.warn('Unknown parameter:', param);
      return [];
  }
  
  // Ensure all required parameters have default values
  const params = {
    pH: 7.5,
    temperature: 80,
    calcium: 250,
    alkalinity: 120,
    cya: 30,
    tds: 300,
    ...otherParams
  };
  
  for (let i = min; i <= max; i += step) {
    const newParams = {
      ...params,
      [param]: i,
    };
    
    try {
      const lsi = calculateLSI(newParams);
      // Only add valid LSI values
      if (!isNaN(lsi) && isFinite(lsi)) {
        data.push({
          value: i,
          lsi: lsi,
        });
      }
    } catch (e) {
      console.warn(`Error calculating LSI for ${param}=${i}:`, e);
      continue;
    }
  }
  
  return data;
}; 
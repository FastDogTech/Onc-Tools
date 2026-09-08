function loadValue(key, fallback) {
  const v = localStorage.getItem(key);
  if (v === null) return fallback;
  try { return JSON.parse(v); } catch { return fallback; }
}

function saveValue(key, value) {
  if (value === null || value === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function loadHistory(key) {
  return loadValue(key, []);
}

function pushHistory(key, entry, max = 10) {
  const list = loadHistory(key);
  list.unshift(entry);
  if (list.length > max) list.length = max;
  saveValue(key, list);
  return list;
}

const Settings = {
  accentColors: {
    Blue: '#007AFF',
    Purple: '#AF52DE',
    Pink: '#FF2D55',
    Orange: '#FF9500',
    Yellow: '#FFCC00',
    Green: '#34C759',
    Mint: '#00C7BE',
    Teal: '#30B0C7',
    Indigo: '#5856D6'
  },
  get accentColor() { return loadValue('accentColor', 'Blue'); },
  set accentColor(v) { saveValue('accentColor', v); },
  get accentColorValue() { return this.accentColors[this.accentColor] || this.accentColors.Blue; },

  get appTheme() { return loadValue('appTheme', 'System'); },
  set appTheme(v) { saveValue('appTheme', v); },

  get defaultHeightUnit() { return loadValue('defaultHeightUnit', 'Metric'); },
  set defaultHeightUnit(v) { saveValue('defaultHeightUnit', v); },

  get defaultWeightUnit() { return loadValue('defaultWeightUnit', 'Metric'); },
  set defaultWeightUnit(v) { saveValue('defaultWeightUnit', v); },

  get defaultTemperatureUnit() { return loadValue('defaultTemperatureUnit', 'Celsius'); },
  set defaultTemperatureUnit(v) { saveValue('defaultTemperatureUnit', v); },

  get defaultSex() { return loadValue('defaultSex', 'Male'); },
  set defaultSex(v) { saveValue('defaultSex', v); },

  get defaultBSAFormula() { return loadValue('defaultBSAFormula', 'Dubois'); },
  set defaultBSAFormula(v) { saveValue('defaultBSAFormula', v); },

  get maxCreatinineClearance() { return loadValue('maxCreatinineClearance', 125); },
  set maxCreatinineClearance(v) { saveValue('maxCreatinineClearance', v); }
};

const UnitManager = {
  get heightUnit() { return loadValue('heightUnit', Settings.defaultHeightUnit); },
  set heightUnit(v) { saveValue('heightUnit', v); },

  get weightUnit() { return loadValue('weightUnit', Settings.defaultWeightUnit); },
  set weightUnit(v) { saveValue('weightUnit', v); },

  get temperatureUnit() { return loadValue('temperatureUnit', Settings.defaultTemperatureUnit); },
  set temperatureUnit(v) { saveValue('temperatureUnit', v); },

  cmToInch: 0.393701,
  inchToCm: 2.54,
  kgToLbs: 2.20462,
  lbsToKg: 0.453592,

  convertTemperatureToDisplay(celsius) {
    if (celsius === null || celsius === undefined) return null;
    return this.temperatureUnit === 'Celsius' ? celsius : (celsius * 9 / 5) + 32;
  },
  convertTemperatureToMetric(value, unit) {
    if (value === null || value === undefined) return null;
    return unit === 'Celsius' ? value : (value - 32) * 5 / 9;
  },

  convertHeightToDisplay(cm) {
    if (cm === null || cm === undefined) return null;
    return this.heightUnit === 'Metric' ? cm : cm * this.cmToInch;
  },
  convertHeightToMetric(value, unit) {
    if (value === null || value === undefined) return null;
    return unit === 'Metric' ? value : value * this.inchToCm;
  },

  convertWeightToDisplay(kg) {
    if (kg === null || kg === undefined) return null;
    return this.weightUnit === 'Metric' ? kg : kg * this.kgToLbs;
  },
  convertWeightToMetric(value, unit) {
    if (value === null || value === undefined) return null;
    return unit === 'Metric' ? value : value * this.lbsToKg;
  },

  get heightUnitLabel() { return this.heightUnit === 'Metric' ? 'cm' : 'in'; },
  get weightUnitLabel() { return this.weightUnit === 'Metric' ? 'kg' : 'lbs'; },
  get temperatureUnitLabel() { return this.temperatureUnit === 'Celsius' ? '°C' : '°F'; },

  get heightRange() { return this.heightUnit === 'Metric' ? { min: 0, max: 300 } : { min: 0, max: 118 }; },
  get heightRangeDescription() { return this.heightUnit === 'Metric' ? '0-300 cm' : '0-118 inches'; },

  get weightRange() { return this.weightUnit === 'Metric' ? { min: 0, max: 500 } : { min: 0, max: 1102 }; },
  get weightRangeDescription() { return this.weightUnit === 'Metric' ? '0-500 kg' : '0-1102 lbs'; },

  get temperatureRange() { return this.temperatureUnit === 'Celsius' ? { min: 26, max: 42 } : { min: 78.8, max: 107.6 }; },
  get temperatureRangeDescription() { return this.temperatureUnit === 'Celsius' ? '26 to 42 °C' : '78.8 to 107.6 °F'; }
};

const Patient = {
  get age() { return loadValue('age', null); },
  set age(v) { saveValue('age', v); },

  get sex() { return loadValue('sex', Settings.defaultSex); },
  set sex(v) { saveValue('sex', v); },

  get height() { return loadValue('height', null); },
  set height(v) { saveValue('height', v); },

  get weight() { return loadValue('weight', null); },
  set weight(v) { saveValue('weight', v); },

  get serumCalcium() { return loadValue('serumCalcium', null); },
  set serumCalcium(v) { saveValue('serumCalcium', v); },

  get albumin() { return loadValue('albumin', null); },
  set albumin(v) { saveValue('albumin', v); },

  reset() {
    this.height = null;
    this.weight = null;
    this.age = null;
    this.sex = Settings.defaultSex;
  }
};

const Formulas = {
  bsaDubois(height, weight) {
    if (height === null || weight === null || height === undefined || weight === undefined) return 0;
    return Math.round(0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425) * 100) / 100;
  },
  bsaMosteller(height, weight) {
    if (height === null || weight === null || height === undefined || weight === undefined) return 0;
    return Math.round(Math.sqrt((height * weight) / 3600) * 100) / 100;
  },
  idealBodyWeight(height, sex) {
    if (height === null || height === undefined) return 0;
    const baseWeight = sex === 'Male' ? 50.0 : 45.5;
    const baseHeight = 152.4;
    const kgPerCm = 0.9055;
    return baseWeight + kgPerCm * (height - baseHeight);
  },
  adjustedBodyWeight(actual, ideal) {
    if (actual <= ideal) return actual;
    return ideal + 0.4 * (actual - ideal);
  },
  cockcroftGault(age, weight, creatinine, sex) {
    if (age === null || weight === null || creatinine === null || creatinine === undefined ||
        age === undefined || weight === undefined || creatinine <= 0) return 0;
    const baseClearance = (140 - age) * weight;
    const sexFactor = sex === 'Female' ? 0.85 : 1.0;
    return (baseClearance * sexFactor) / (72 * creatinine);
  },
  mdrdGFR(creatinine, age, sex) {
    if (creatinine === null || age === null || creatinine === undefined || age === undefined || creatinine <= 0) return 0;
    const baseGFR = 175.0 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203);
    const sexFactor = sex === 'Female' ? 0.742 : 1.0;
    return baseGFR * sexFactor;
  },
  anc(wbc, neutrophils, bands) {
    if (wbc === null || neutrophils === null || bands === null ||
        wbc === undefined || neutrophils === undefined || bands === undefined || wbc <= 0) return 0;
    return wbc * ((neutrophils + bands) / 100);
  },
  correctedCalcium(serumCalcium, albumin) {
    if (serumCalcium === null || albumin === null || serumCalcium === undefined || albumin === undefined || albumin <= 0) return 0;
    return serumCalcium + 0.8 * (4.0 - albumin);
  }
};

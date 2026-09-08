function applyTheme() {
  const theme = Settings.appTheme;
  const root = document.documentElement;
  if (theme === 'Light') root.setAttribute('data-theme', 'light');
  else if (theme === 'Dark') root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme');
}

function applyAccentColor() {
  document.documentElement.style.setProperty('--accent', Settings.accentColorValue);
}

function initChrome() {
  applyTheme();
  applyAccentColor();
}

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
  }
  (children || []).forEach(c => { if (c) node.appendChild(c); });
  return node;
}

function fieldRow(labelText, unitText, input, toggleBtn) {
  const row = el('div', { class: 'field-row' }, [
    el('span', { class: 'field-label', text: labelText }, unitText ? [el('span', { class: 'field-unit', text: unitText })] : []),
    el('div', { class: 'field-input-group' }, [input, toggleBtn].filter(Boolean))
  ]);
  return row;
}

function errorLine() {
  return el('div', { class: 'error-text', hidden: 'hidden' });
}

function setError(errEl, message) {
  if (message) {
    errEl.textContent = message;
    errEl.hidden = false;
  } else {
    errEl.textContent = '';
    errEl.hidden = true;
  }
}

function numberInput(placeholder) {
  const input = el('input', { type: 'text', inputmode: 'decimal', placeholder, class: 'num-input' });
  return input;
}

function parseNum(str) {
  if (str === '' || str === null || str === undefined) return null;
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

function toggleButton(text, isImperial) {
  const btn = el('button', { type: 'button', class: 'toggle-btn' + (isImperial ? ' imperial' : ''), text });
  return btn;
}

function renderHeightInput(container, onChange) {
  const wrap = el('div', { class: 'field-block' });
  const input = numberInput('Height');
  const unitBtn = toggleButton('', false);
  const err = errorLine();

  function refresh() {
    const display = UnitManager.convertHeightToDisplay(Patient.height);
    input.value = display === null ? '' : (Math.round(display * 10) / 10).toString();
    unitBtn.textContent = UnitManager.heightUnitLabel;
    unitBtn.className = 'toggle-btn' + (UnitManager.heightUnit === 'Imperial' ? ' imperial' : '');
  }

  input.addEventListener('input', () => {
    const value = parseNum(input.value);
    if (value !== null) {
      if (value < UnitManager.heightRange.min || value > UnitManager.heightRange.max) {
        setError(err, `Height must be between ${UnitManager.heightRangeDescription}`);
        Patient.height = null;
      } else {
        setError(err, null);
        Patient.height = UnitManager.convertHeightToMetric(value, UnitManager.heightUnit);
      }
    } else {
      setError(err, null);
      Patient.height = null;
    }
    if (onChange) onChange();
  });

  unitBtn.addEventListener('click', () => {
    UnitManager.heightUnit = UnitManager.heightUnit === 'Metric' ? 'Imperial' : 'Metric';
    refresh();
  });

  wrap.appendChild(fieldRow('Height', null, input, unitBtn));
  wrap.appendChild(err);
  container.appendChild(wrap);
  refresh();
  return { refresh };
}

function renderWeightInput(container, onChange) {
  const wrap = el('div', { class: 'field-block' });
  const input = numberInput('Weight');
  const unitBtn = toggleButton('', false);
  const err = errorLine();

  function refresh() {
    const display = UnitManager.convertWeightToDisplay(Patient.weight);
    input.value = display === null ? '' : (Math.round(display * 10) / 10).toString();
    unitBtn.textContent = UnitManager.weightUnitLabel;
    unitBtn.className = 'toggle-btn' + (UnitManager.weightUnit === 'Imperial' ? ' imperial' : '');
  }

  input.addEventListener('input', () => {
    const value = parseNum(input.value);
    if (value !== null) {
      const metricValue = UnitManager.convertWeightToMetric(value, UnitManager.weightUnit);
      if (metricValue < UnitManager.weightRange.min || metricValue > UnitManager.weightRange.max) {
        setError(err, `Weight must be between ${UnitManager.weightRangeDescription}`);
        Patient.weight = null;
      } else {
        setError(err, null);
        Patient.weight = metricValue;
      }
    } else {
      setError(err, null);
      Patient.weight = null;
    }
    if (onChange) onChange();
  });

  unitBtn.addEventListener('click', () => {
    UnitManager.weightUnit = UnitManager.weightUnit === 'Metric' ? 'Imperial' : 'Metric';
    refresh();
  });

  wrap.appendChild(fieldRow('Weight', null, input, unitBtn));
  wrap.appendChild(err);
  container.appendChild(wrap);
  refresh();
  return { refresh };
}

function renderTemperatureInput(container, getTemp, setTemp, onChange) {
  const wrap = el('div', { class: 'field-block' });
  const input = numberInput('Temperature');
  const unitBtn = toggleButton('', false);
  const err = errorLine();

  function refresh() {
    const display = UnitManager.convertTemperatureToDisplay(getTemp());
    input.value = display === null ? '' : (Math.round(display * 10) / 10).toString();
    unitBtn.textContent = UnitManager.temperatureUnitLabel;
    unitBtn.className = 'toggle-btn' + (UnitManager.temperatureUnit === 'Fahrenheit' ? ' imperial' : '');
  }

  input.addEventListener('input', () => {
    const value = parseNum(input.value);
    if (value !== null) {
      const metricValue = UnitManager.convertTemperatureToMetric(value, UnitManager.temperatureUnit);
      const displayValue = UnitManager.convertTemperatureToDisplay(metricValue);
      if (displayValue < UnitManager.temperatureRange.min || displayValue > UnitManager.temperatureRange.max) {
        setError(err, `Temperature must be between ${UnitManager.temperatureRangeDescription}`);
        setTemp(null);
      } else {
        setError(err, null);
        setTemp(metricValue);
      }
    } else {
      setError(err, null);
      setTemp(null);
    }
    if (onChange) onChange();
  });

  unitBtn.addEventListener('click', () => {
    UnitManager.temperatureUnit = UnitManager.temperatureUnit === 'Celsius' ? 'Fahrenheit' : 'Celsius';
    refresh();
  });

  wrap.appendChild(fieldRow('Temperature', null, input, unitBtn));
  wrap.appendChild(err);
  container.appendChild(wrap);
  refresh();
  return { refresh };
}

function renderSexToggle(container, onChange) {
  const wrap = el('div', { class: 'field-row' });
  const label = el('span', { class: 'field-label', text: 'Sex' });
  const btn = el('button', { type: 'button', class: 'toggle-btn' });

  function refresh() { btn.textContent = Patient.sex; }
  btn.addEventListener('click', () => {
    Patient.sex = Patient.sex === 'Male' ? 'Female' : 'Male';
    refresh();
    if (onChange) onChange();
  });

  wrap.appendChild(label);
  wrap.appendChild(el('div', { class: 'field-input-group' }, [btn]));
  container.appendChild(wrap);
  refresh();
  return { refresh };
}

function wireResetButton(button, onReset) {
  button.addEventListener('click', () => {
    onReset();
    location.reload();
  });
}

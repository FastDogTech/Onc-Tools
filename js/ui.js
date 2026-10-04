if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

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
  if (location.hostname === 'onctools.fastdog.tech') {
    document.addEventListener('DOMContentLoaded', showMovedNotice);
  }
}

function showMovedNotice() {
  try { if (sessionStorage.getItem('movedNoticeSeen')) return; } catch (e) {}

  const newUrl = 'https://onctools.com' + location.pathname + location.search + location.hash;
  const doneBtn = el('button', { type: 'button', class: 'btn-save help-done', text: 'Got it' });
  const sheet = el('div', { class: 'help-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Onc Tools has moved' }, [
    el('div', { class: 'help-title', text: 'Onc Tools has a new home!' }),
    el('div', { class: 'help-text', text: 'Onc Tools is now at onctools.com. This address will keep working for now, but please update your bookmarks and home screen shortcut.' }),
    el('a', { class: 'btn-save help-done', href: newUrl, text: 'Go to onctools.com', style: 'display:block;text-align:center;text-decoration:none;box-sizing:border-box' }),
    doneBtn
  ]);
  const backdrop = el('div', { class: 'help-backdrop' }, [sheet]);

  function close() {
    try { sessionStorage.setItem('movedNoticeSeen', '1'); } catch (e) {}
    document.body.style.overflow = '';
    backdrop.remove();
  }
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
  doneBtn.addEventListener('click', close);
  document.body.style.overflow = 'hidden';
  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('open'));
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
  const input = numberInput('Temp');
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

const TABS = [
  { id: 'bsa', label: 'BSA', href: 'index.html' },
  { id: 'auc', label: 'AUC', href: 'auc.html' },
  { id: 'weight', label: 'Weight', href: 'weight.html' },
  { id: 'misc', label: 'Misc', href: 'misc.html' },
  { id: 'date-finder', label: 'Dates', href: 'date-finder.html' },
  { id: 'settings', label: 'Settings', href: 'settings.html', icon: true }
];

const SETTINGS_ICON_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';

const HELP = {
  bsa: {
    title: 'BSA',
    items: [
      { term: 'Height / Weight', text: 'Enter the patient\'s values. Tap the buttons to switch between metric and imperial.' },
      { term: 'Formula button', text: 'Switches between the Dubois and Mosteller BSA formulas.' },
      { term: 'Dose', text: 'Enter a dose per m² to get the total dose (BSA × dose).' },
      { term: 'Save', text: 'Stores the calculation in History.' },
      { term: 'Reset', text: 'Clears the entered values.' },
      { term: 'History', text: 'Tap a saved row to load it back into the calculator. Clear deletes all saved rows.' }
    ]
  },
  auc: {
    title: 'AUC (Carboplatin)',
    items: [
      { term: 'Age / Weight / Sex', text: 'Enter the patient\'s values. Tap the buttons to switch between metric and imperial or to change the sex.' },
      { term: 'Serum creatinine', text: 'Enter the patient\'s serum creatinine to calculate CrCl.' },
      { term: 'Max Cr Clearance', text: 'Caps the CrCl used in the Calvert formula. Change the default in Settings.' },
      { term: 'Target AUC', text: 'Enter the target AUC to get the carboplatin dose from the Calvert formula.' },
      { term: 'Save', text: 'Stores the calculation in History.' },
      { term: 'Reset', text: 'Clears the entered values.' },
      { term: 'History', text: 'Tap a saved row to load it back into the calculator. Clear deletes all saved rows.' }
    ]
  },
  weight: {
    title: 'Weight',
    items: [
      { term: 'Height / Weight / Sex', text: 'Enter the patient\'s values. Tap the buttons to switch between metric and imperial or to change the sex.' },
      { term: 'Actual / Adjusted / Ideal', text: 'Chooses which weight is used for the dose: actual body weight, adjusted body weight, or ideal body weight. The formulas are shown below the result.' },
      { term: 'Dose', text: 'Enter a dose per kg to get the total dose for the selected weight.' },
      { term: 'Save', text: 'Stores the calculation in History.' },
      { term: 'Reset', text: 'Clears the entered values.' },
      { term: 'History', text: 'Tap a saved row to load it back into the calculator. Clear deletes all saved rows.' }
    ]
  },
  misc: {
    title: 'Misc',
    items: [
      { term: 'ANC', text: 'Calculates the absolute neutrophil count from the white blood cell count and differential.' },
      { term: 'Calcium', text: 'Corrects serum calcium for the albumin level.' },
      { term: 'CrCl / eGFR', text: 'Estimates kidney function from age, weight, sex and serum creatinine. The formulas are shown at the bottom.' },
      { term: 'Units', text: 'Converts height, weight and temperature. Tap the unit button to switch between metric and imperial.' },
      { term: 'Reset', text: 'Clears the entered values.' }
    ]
  },
  'date-finder': {
    title: 'Dates',
    items: [
      { term: 'Between Dates', text: 'Pick a start and end date to see the time between them. Today fills in the current date.' },
      { term: 'Find Date', text: 'Starts from a date and time, then finds the date a set number of hours, days, weeks or months in the past or future.' },
      { term: 'Show / In the', text: 'Choose the period (hours, days, weeks, months) and the direction (past or future).' },
      { term: 'Reset', text: 'Clears the entered values.' }
    ]
  },
  settings: {
    title: 'Settings',
    items: [
      { term: 'Appearance', text: 'Choose an accent color and a Light, Dark or System theme.' },
      { term: 'Defaults', text: 'The starting height and weight units, sex, BSA formula and maximum creatinine clearance used when the app opens.' },
      { term: 'Feedback', text: 'Email feedback@fastdog.tech with questions or suggestions.' }
    ]
  }
};

function openHelp(pageId) {
  const content = HELP[pageId];
  if (!content || document.querySelector('.help-backdrop')) return;

  const opener = document.activeElement;
  const body = el('div', { class: 'help-body' });
  content.items.forEach(item => {
    body.appendChild(el('div', { class: 'help-item' }, [
      el('div', { class: 'help-term', text: item.term }),
      el('div', { class: 'help-text', text: item.text })
    ]));
  });

  const doneBtn = el('button', { type: 'button', class: 'btn-save help-done', text: 'Done' });
  const sheet = el('div', { class: 'help-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': content.title + ' help' }, [
    el('div', { class: 'help-title', text: content.title + ' Help' }),
    body,
    doneBtn
  ]);
  const backdrop = el('div', { class: 'help-backdrop' }, [sheet]);

  function close() {
    document.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
    backdrop.remove();
    if (opener && opener.focus) opener.focus();
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
  doneBtn.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  document.body.style.overflow = 'hidden';
  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('open'));
  doneBtn.focus();
}

function renderHeader(container, opts) {
  const { active } = opts;

  container.appendChild(el('div', { class: 'site-title' }, [
    el('img', { class: 'site-logo', src: 'img/onctoolslogo-96.png', alt: '', width: '32', height: '32' }),
    document.createTextNode('Onc Tools'),
    el('button', { type: 'button', class: 'help-btn', 'aria-label': 'Help', text: '?', onclick: () => openHelp(active) })
  ]));

  const tabbar = el('nav', { class: 'tabbar' });
  TABS.forEach(t => {
    const tabEl = el('a', {
      href: t.href,
      class: 'tab' + (t.icon ? ' tab-icon' : '') + (t.id === active ? ' active' : ''),
      'aria-label': t.label
    });
    if (t.icon) {
      tabEl.innerHTML = SETTINGS_ICON_SVG;
      tabEl.title = t.label;
    } else {
      tabEl.textContent = t.label;
    }
    tabbar.appendChild(tabEl);
  });
  container.appendChild(tabbar);
}

function renderResetButton(container, onReset) {
  const wrap = el('div', { class: 'reset-bar' });
  const btn = el('button', { type: 'button', class: 'btn-reset', text: 'Reset' });
  wireResetButton(btn, onReset);
  wrap.appendChild(btn);
  container.appendChild(wrap);
}

function renderSaveResetBar(container, { onSave, onReset, canSave }) {
  const wrap = el('div', { class: 'reset-bar' });
  const saveBtn = el('button', { type: 'button', class: 'btn-save', text: 'Save' });
  const resetBtn = el('button', { type: 'button', class: 'btn-reset', text: 'Reset' });

  function refreshSaveState() {
    saveBtn.disabled = !canSave();
  }

  saveBtn.addEventListener('click', () => {
    onSave();
    refreshSaveState();
  });
  wireResetButton(resetBtn, onReset);

  wrap.appendChild(saveBtn);
  wrap.appendChild(resetBtn);
  container.appendChild(wrap);
  refreshSaveState();
  return { refreshSaveState };
}

function renderHistoryCard(container, { key, columns, formatRow, onRowClick }) {
  const gridStyle = `grid-template-columns: repeat(${columns.length}, 1fr);`;
  const card = el('div', { class: 'card history-card' });
  const titleBar = el('div', { class: 'history-title-bar' });
  const title = el('span', { class: 'history-title', text: 'History' });
  const clearBtn = el('button', { class: 'history-clear-btn', type: 'button', text: 'Clear' });
  titleBar.appendChild(title);
  titleBar.appendChild(clearBtn);
  const header = el('div', { class: 'history-header' });
  header.style.cssText = gridStyle;
  columns.forEach(c => header.appendChild(el('span', { text: c })));
  const body = el('div', { class: 'history-body' });
  card.appendChild(titleBar);
  card.appendChild(header);
  card.appendChild(body);
  container.appendChild(card);

  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear all saved calculations?')) return;
    clearHistory(key);
    render();
  });

  function render() {
    body.innerHTML = '';
    const rows = loadHistory(key);
    clearBtn.hidden = rows.length === 0;
    if (rows.length === 0) {
      body.appendChild(el('div', { class: 'history-empty', text: 'No saved calculations yet' }));
      return;
    }
    rows.forEach(entry => {
      const row = el('div', { class: 'history-row' });
      row.style.cssText = gridStyle;
      formatRow(entry).forEach(text => row.appendChild(el('span', { text })));
      if (onRowClick) row.addEventListener('click', () => onRowClick(entry));
      body.appendChild(row);
    });
  }

  render();
  return { render };
}

function setupSubtabs(tabs, noteContainer) {
  const entries = tabs.map(t => ({
    ...t,
    tabEl: document.getElementById(t.tabId),
    panelEl: document.getElementById(t.panelId),
    initialized: false
  }));

  function activate(entry) {
    entries.forEach(e => {
      const isActive = e === entry;
      e.tabEl.classList.toggle('active', isActive);
      e.panelEl.hidden = !isActive;
    });
    if (!entry.initialized) {
      entry.renderFn(entry.panelEl);
      entry.initialized = true;
    }
    if (noteContainer) {
      noteContainer.innerHTML = '';
      (entry.notes || []).forEach(text => {
        noteContainer.appendChild(el('p', { class: 'formula-note', text }));
      });
    }
  }

  entries.forEach(entry => {
    entry.tabEl.addEventListener('click', () => activate(entry));
  });

  activate(entries[0]);
}

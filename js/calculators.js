function renderANCCalculator(container) {
  const wbcInput = numberInput('WBC');
  const neutrophilsInput = numberInput('Neutrophils');
  const bandsInput = numberInput('Bands');
  const wbcError = errorLine();
  const neutrophilsError = errorLine();
  const bandsError = errorLine();
  const totalWarning = el('div', { class: 'warning-text', hidden: 'hidden' });
  const totalHint = el('div', { class: 'hint-text', hidden: 'hidden' });
  const ancValue = el('span', { text: '-' });
  const ancUnit = el('span', { class: 'unit' });

  container.appendChild(el('div', { class: 'card no-dividers' }, [
    el('div', { class: 'field-row' }, [
      el('span', { class: 'field-label' }, [document.createTextNode('WBC '), el('span', { class: 'field-unit', text: '(K/µL)' })]),
      el('div', { class: 'field-input-group' }, [wbcInput])
    ]),
    wbcError,
    el('div', { class: 'field-row' }, [
      el('span', { class: 'field-label' }, [document.createTextNode('Neutrophils '), el('span', { class: 'field-unit', text: '(%)' })]),
      el('div', { class: 'field-input-group' }, [neutrophilsInput])
    ]),
    neutrophilsError,
    el('div', { class: 'field-row' }, [
      el('span', { class: 'field-label' }, [document.createTextNode('Bands '), el('span', { class: 'field-unit', text: '(%)' })]),
      el('div', { class: 'field-input-group' }, [bandsInput])
    ]),
    bandsError,
    totalWarning,
    totalHint
  ]));

  container.appendChild(el('div', { class: 'card' }, [
    el('div', { class: 'result-row' }, [
      el('span', { text: 'Absolute Neutrophil Count' }),
      el('span', { class: 'value' }, [ancValue, ancUnit])
    ])
  ]));

  let wbc = null, neutrophils = null, bands = null;

  function validateTotal() {
    if (neutrophils !== null && bands !== null) {
      const total = neutrophils + bands;
      if (total > 100) {
        setError(totalWarning, 'Total (Neutrophils + Bands) cannot exceed 100%');
        totalHint.hidden = true;
      } else {
        totalWarning.hidden = true;
        totalHint.hidden = false;
        totalHint.textContent = `Total: ${total.toFixed(0)}%`;
      }
    } else {
      totalWarning.hidden = true;
      totalHint.hidden = true;
    }
  }

  function recalc() {
    if (wbc !== null && neutrophils !== null && bands !== null) {
      ancValue.textContent = Formulas.anc(wbc, neutrophils, bands).toFixed(2);
      ancUnit.textContent = ' K/µL';
    } else {
      ancValue.textContent = '-';
      ancUnit.textContent = '';
    }
  }

  wbcInput.addEventListener('input', () => {
    wbc = parseNum(wbcInput.value);
    const v = wbc ?? 0;
    if (v < 0) setError(wbcError, 'WBC cannot be negative');
    else if (v > 100) setError(wbcError, 'Please verify WBC value');
    else setError(wbcError, null);
    recalc();
  });

  neutrophilsInput.addEventListener('input', () => {
    neutrophils = parseNum(neutrophilsInput.value);
    const v = neutrophils ?? 0;
    if (v < 0) setError(neutrophilsError, 'Neutrophils cannot be negative');
    else if (v > 100) setError(neutrophilsError, 'Neutrophils cannot exceed 100%');
    else setError(neutrophilsError, null);
    validateTotal();
    recalc();
  });

  bandsInput.addEventListener('input', () => {
    bands = parseNum(bandsInput.value);
    const v = bands ?? 0;
    if (v < 0) setError(bandsError, 'Bands cannot be negative');
    else if (v > 100) setError(bandsError, 'Bands cannot exceed 100%');
    else setError(bandsError, null);
    validateTotal();
    recalc();
  });
}

function renderCorrectedCalciumCalculator(container) {
  const calciumInput = numberInput('Calcium');
  const albuminInput = numberInput('Albumin');
  const calciumError = errorLine();
  const albuminError = errorLine();
  const calciumValue = el('span', { text: '-' });
  const calciumUnit = el('span', { class: 'unit' });

  container.appendChild(el('div', { class: 'card no-dividers' }, [
    el('div', { class: 'field-row' }, [
      el('span', { class: 'field-label' }, [document.createTextNode('Serum Calcium '), el('span', { class: 'field-unit', text: '(mg/dL)' })]),
      el('div', { class: 'field-input-group' }, [calciumInput])
    ]),
    calciumError,
    el('div', { class: 'field-row' }, [
      el('span', { class: 'field-label' }, [document.createTextNode('Albumin '), el('span', { class: 'field-unit', text: '(g/dL)' })]),
      el('div', { class: 'field-input-group' }, [albuminInput])
    ]),
    albuminError
  ]));

  container.appendChild(el('div', { class: 'card' }, [
    el('div', { class: 'result-row' }, [
      el('span', { text: 'Corrected Calcium' }),
      el('span', { class: 'value' }, [calciumValue, calciumUnit])
    ])
  ]));

  function recalc() {
    if (Patient.serumCalcium !== null && Patient.albumin !== null) {
      calciumValue.textContent = Formulas.correctedCalcium(Patient.serumCalcium, Patient.albumin).toFixed(2);
      calciumUnit.textContent = ' mg/dL';
    } else {
      calciumValue.textContent = '-';
      calciumUnit.textContent = '';
    }
  }

  calciumInput.value = Patient.serumCalcium ?? '';
  albuminInput.value = Patient.albumin ?? '';

  calciumInput.addEventListener('input', () => {
    const value = parseNum(calciumInput.value);
    Patient.serumCalcium = value;
    if (value !== null) {
      if (value < 0) setError(calciumError, 'Calcium cannot be negative');
      else if (value > 25) setError(calciumError, 'Please verify calcium value');
      else setError(calciumError, null);
    } else {
      setError(calciumError, null);
    }
    recalc();
  });

  albuminInput.addEventListener('input', () => {
    const value = parseNum(albuminInput.value);
    Patient.albumin = value;
    if (value !== null) {
      if (value < 3) setError(albuminError, 'Corrected Ca is unreliable with an albumin < 3');
      else if (value > 5) setError(albuminError, 'Corrected Ca should not be used with an albumin > 5');
      else setError(albuminError, null);
    } else {
      setError(albuminError, null);
    }
    recalc();
  });

  recalc();
}

function renderCrClEgfrCalculator(container) {
  const ageInput = numberInput('Age');
  const ageError = errorLine();
  const weightContainer = el('div');
  const sexContainer = el('div');
  const creatinineInput = numberInput('Creatinine');
  const creatinineError = errorLine();
  const crclValue = el('span', { text: '-' });
  const crclUnit = el('span', { class: 'unit' });
  const gfrValue = el('span', { text: '-' });
  const gfrUnit = el('span', { class: 'unit' });

  container.appendChild(el('div', { class: 'card no-dividers' }, [
    el('div', { class: 'field-row' }, [
      el('span', { class: 'field-label', text: 'Age' }),
      el('div', { class: 'field-input-group' }, [ageInput, el('span', { class: 'toggle-btn static', text: 'yrs' })])
    ]),
    ageError,
    weightContainer,
    sexContainer,
    el('div', { class: 'field-row' }, [
      el('span', { class: 'field-label' }, [document.createTextNode('Serum Creatinine '), el('span', { class: 'field-unit', text: '(mg/dL)' })]),
      el('div', { class: 'field-input-group' }, [creatinineInput])
    ]),
    creatinineError
  ]));

  container.appendChild(el('div', { class: 'card' }, [
    el('div', { class: 'result-row' }, [
      el('span', { text: 'Creatinine Clearance' }),
      el('span', { class: 'value' }, [crclValue, crclUnit])
    ])
  ]));

  container.appendChild(el('div', { class: 'card' }, [
    el('div', { class: 'result-row' }, [
      el('span', { text: 'eGFR' }),
      el('span', { class: 'value' }, [gfrValue, gfrUnit])
    ])
  ]));

  let age = Patient.age;
  let serumCreatinine = null;

  if (age !== null) ageInput.value = String(age);

  function recalc() {
    const hasCrcl = age !== null && Patient.weight !== null && serumCreatinine !== null && serumCreatinine > 0;
    if (hasCrcl) {
      crclValue.textContent = Formulas.cockcroftGault(age, Patient.weight, serumCreatinine, Patient.sex).toFixed(1);
      crclUnit.textContent = ' mL/min';
    } else {
      crclValue.textContent = '-';
      crclUnit.textContent = '';
    }

    const hasGfr = age !== null && serumCreatinine !== null;
    if (hasGfr) {
      gfrValue.textContent = Formulas.mdrdGFR(serumCreatinine, age, Patient.sex).toFixed(1);
      gfrUnit.textContent = ' mL/min/1.73m²';
    } else {
      gfrValue.textContent = '-';
      gfrUnit.textContent = '';
    }
  }

  ageInput.addEventListener('input', () => {
    const value = parseNum(ageInput.value);
    age = value !== null ? Math.round(value) : null;
    if (age !== null) {
      if (age < 18) setError(ageError, 'Age must be 18 or older for accurate results');
      else if (age > 120) setError(ageError, 'Please verify age');
      else { setError(ageError, null); Patient.age = age; }
    } else {
      setError(ageError, null);
    }
    recalc();
  });

  creatinineInput.addEventListener('input', () => {
    serumCreatinine = parseNum(creatinineInput.value);
    const v = serumCreatinine ?? 0;
    if (v < 0) setError(creatinineError, 'Creatinine cannot be negative');
    else if (v > 20) setError(creatinineError, 'Please verify creatinine value');
    else setError(creatinineError, null);
    recalc();
  });

  renderWeightInput(weightContainer, recalc);
  renderSexToggle(sexContainer, recalc);
  recalc();
}

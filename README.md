<h1 style="align: center">Onc Tools Webpage</h1>
<img src="https://raw.githubusercontent.com/FastDogTech/Onc-Tools/refs/heads/main/img/onctoolslogo.png" width="200">

Onc Tools is a set of oncology clinical calculators that runs entirely in your web browser. Open it at **[onctools.com](https://onctools.com)**. It also installs to a phone or desktop home screen like an app and keeps working offline.

## Calculators

| Page | What it does |
| --- | --- |
| **BSA** | Body surface area using the Dubois or Mosteller formula, plus total dose from a dose per m². |
| **AUC (Carboplatin)** | Cockcroft-Gault creatinine clearance (with an adjustable maximum) and the carboplatin dose from the Calvert formula for a target AUC. |
| **Weight** | Actual, adjusted or ideal (Devine) body weight, plus total dose from a dose per kg for the weight you select. |
| **Misc** | Absolute neutrophil count (ANC), albumin-corrected calcium, CrCl / eGFR (Cockcroft-Gault and MDRD), and a height, weight and temperature unit converter. |
| **Dates** | Time between two dates, and a date finder that adds or subtracts hours, days, weeks or months. |
| **Settings** | Accent color, Light / Dark / System theme, and default units, sex, BSA formula and maximum creatinine clearance. |

Every page has a **?** button in the header with a short help sheet. The formulas used are shown on the page next to the result.

### Other features

- Switch between metric and imperial units with one tap.
- BSA, AUC and Weight pages keep a **History** of saved calculations. Tap a row to load it back into the calculator.
- Installable as a home-screen app (PWA) and usable offline once loaded.
- Light, dark and system themes with a choice of accent color.

## Privacy

Onc Tools is built so that the values you enter never leave your device.

- **No data is sent anywhere.** All calculations run locally in your browser. The app makes no requests to send or collect what you type.
- **No accounts or sign-in.** There is nothing to register for.
- **No analytics, tracking or advertising.** No third-party scripts, fonts or trackers are loaded.
- **Saved data stays on your device.** Settings and History are kept in your browser's local storage on your own device. Nothing is uploaded or synced. Clearing your browser's site data, or tapping **Clear** in History, removes it.
- **Works offline.** After the first load the app is cached on your device, so you can use it without a connection.

## Disclaimer

Onc Tools is a calculation aid and is not a substitute for clinical judgment, institutional protocols or independent verification of doses. Always double-check results before using them in patient care.

## Feedback

Questions or suggestions: [feedback@fastdog.tech](mailto:feedback@fastdog.tech)

## Development

A static site of plain HTML, CSS and JavaScript with no build step. Calculation logic is in `js/state.js` and shared UI helpers are in `js/ui.js`. To run it locally, serve the folder with any static server, for example `python3 -m http.server`.

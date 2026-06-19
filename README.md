![Angular](https://img.shields.io/badge/Angular-21-red)
![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)

# Resistor Calculator

<img width="1036" height="620" alt="image" src="https://github.com/user-attachments/assets/c1f22acc-7d59-486c-bf42-14fe0ae1f099" />

A simple Angular application that calculates resistor values based on standard resistor color codes.

The app allows users to select color bands and instantly computes the corresponding resistance value according to industry standards.

## Features

- Forward calculator (4/5/6 band): color bands -> resistance value
- Reverse calculator: typed value (`4.7k`, `330`, `1M`) -> candidate band combinations
- Circuit tools page: series, parallel, and voltage divider calculators
- Shared navigation and responsive mobile menu
- Live SVG resistor preview, copy result action, reset defaults
- Built-in guide page with band meanings, E-series, tolerance, and TCR reference

---

## Installation Requirements

Before running the project, make sure the following tools are installed on your system:

- **Node.js** `>= 20.x` (required by Angular 21)
- **npm** `>= 10.x` (bundled with Node.js)
- **Angular CLI** `>= 21`

You can install the Angular CLI globally with:

```bash
npm install -g @angular/cli
```

If you are using **nvm**, you can switch to the required Node.js version with:

```bash
nvm use
```

## Project Setup

Clone the repository and install the required dependencies.

From the project root directory, run:

```bash
npm install
```

This will install all necessary packages listed in package.json.

## Development Server

To start a local development server, run:

```bash
npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Running Unit Tests

To execute unit tests with the [Vitest](https://vitest.dev/), run:

```bash
npm run test
```

Test results will be displayed in the terminal.

## Lint

To check lint rules, run:

```bash
npm run lint
```

## Build

To build the project for production, run:

```bash
npm run build
```

## Project Structure

```
src/app/
├── app.config.ts
├── app.routes.ts
├── layout/
│   └── header.component.*
├── feature/
│   ├── resistor/
│   │   ├── components/
│   │   │   ├── mode-toggle/
│   │   │   ├── forward-form/
│   │   │   ├── result-card/
│   │   │   ├── help-section/
│   │   │   ├── reverse-shell/
│   │   │   ├── resistor-preview/
│   │   │   └── reference-panel/
│   │   ├── services/
│   │   ├── state/
│   │   └── utils/
│   ├── circuit/
│   │   ├── services/
│   │   └── state/
│   └── guide/
└── shared/
    ├── pipes/             # ohms/volts/amps formatting
    ├── select/
    └── utils/
```

Everything is built with standalone components and Angular signals. The app uses zoneless change detection. State is feature-scoped stores (`ResistorStore`, `CircuitStore`) with computed view models and pure mapper/validator utilities.

## Import Conventions

- Cross-folder imports use TypeScript path aliases: `@app/*`, `@shared/*`, `@resistor/*`, `@circuit/*`.
- Same-folder imports stay relative (`./...`).

## Styling Conventions

- Component SCSS should reuse shared button/interactive mixins from `src/styles/_buttons.scss` via `@use`.
- Prefer centralizing repeated `hover`, `focus-visible`, and `disabled` styles in shared mixins instead of duplicating declarations across component styles.

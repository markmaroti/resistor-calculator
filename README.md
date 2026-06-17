![Angular](https://img.shields.io/badge/Angular-21-red)
![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)

# Resistor Calculator

<img width="1036" height="620" alt="image" src="https://github.com/user-attachments/assets/c1f22acc-7d59-486c-bf42-14fe0ae1f099" />

A simple Angular application that calculates resistor values based on standard resistor color codes.

The app allows users to select color bands and instantly computes the corresponding resistance value according to industry standards.

## Features

Pick resistor bands and get the value instantly — works with 4, 5, and 6 band resistors. You can also go the other way: type in a resistance like `4.7k` or `330` and it'll find the closest band combinations for you.

There's a live SVG preview that updates as you play with the bands, a one-click copy button for the result, and a reset to get everything back to defaults. A built-in guide page covers band meanings, E-series, tolerances, and TCR if you need a refresher.

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
ng serve
# or
npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Running Unit Tests

To execute unit tests with the [Vitest](https://vitest.dev/), run:

```bash
ng test
```

Test results will be displayed in the terminal.

## Build

To build the project for production, run:

```bash
ng build
```

## Project Structure

```
src/app/
├── feature/
│   ├── resistor/          # The main calculator
│   │   ├── components/    # Preview SVG, reference panel
│   │   ├── pipes/         # OhmsPipe — formats raw ohms to human-readable
│   │   ├── services/      # Calculation logic (forward + reverse)
│   │   ├── state/         # Store, mappers, validators
│   │   └── utils/         # Formatting, value parsing, clipboard
│   └── guide/             # Color code reference page
├── shared/
│   ├── select/            # Reusable dropdown component
│   └── utils/             # Clipboard helper
└── app.routes.ts          # All routes, lazy-loaded
```

Everything's built with standalone components and Angular signals. No zones — uses zoneless change detection. State lives in a `ResistorStore` with computed values and pure functions for mapping and validation.

## Styling Conventions

- Component SCSS should reuse shared button/interactive mixins from `src/styles/_buttons.scss` via `@use`.
- Prefer centralizing repeated `hover`, `focus-visible`, and `disabled` styles in shared mixins instead of duplicating declarations across component styles.

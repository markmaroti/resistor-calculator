![Angular](https://img.shields.io/badge/Angular-21-red)
![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)


# Resistor Calculator

<img width="1036" height="620" alt="image" src="https://github.com/user-attachments/assets/c1f22acc-7d59-486c-bf42-14fe0ae1f099" />

A simple Angular application that calculates resistor values based on standard resistor color codes.

The app allows users to select color bands and instantly computes the corresponding resistance value according to industry standards.

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

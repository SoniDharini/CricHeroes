# CricHeroes Frontend

This is the web frontend for the **CricHeroes Player Impact Analyzer**, allowing users to perform comprehensive data visualization and queries about cricket player performance. This project leverages a modern minimalistic design system originally exported from Figma.

It is built with **React**, powered by **Vite** for fast, optimized builds, and styled using **Tailwind CSS**. It also incorporates beautiful interactive primitives from **Radix UI** and comprehensive chart components from **Recharts**.

## Features

- **Modern Minimalistic UI**: Elegant interfaces relying on Radix UI, Material UI (MUI), and Tailwind CSS to ensure a beautiful aesthetic.
- **Lightning Fast Builds**: Using Vite for blazing fast Hot Module Replacement (HMR) and production builds.
- **Flexible Data Visualization**: Integrates `recharts` for charting and analytical data presentation. 
- **Component-Driven**: Extremely modular architecture designed using the latest React component paradigms.

## Requirements

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (version 18+ is recommended)
- `npm` (Node Package Manager), which is installed by default with Node.js.

## Running the Frontend

Follow these instructions to get the application running on your local machine:

### 1. Navigate to the frontend directory
Open your terminal and ensure you are in the `frontend` folder:
```bash
cd frontend
```

### 2. Install Dependencies
Run the package manager to download all required frontend libraries:
```bash
npm install
```

### 3. Start the Development Server
Execute the dev script to start the Vite server with hot-reloading:
```bash
npm run dev
```

By default, Vite runs the application at `http://localhost:5173/`. Open this URL in your browser to see the app!

### 4. Build for Production
To create an optimized production build, run:
```bash
npm run build
```

This will output a `dist` directory with your minified static files, ready to be served.
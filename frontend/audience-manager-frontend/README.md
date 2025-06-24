# Frontend Application

This directory contains the React-based frontend application for the Audience Manager Platform. It was bootstrapped with Create React App and uses TypeScript, TailwindCSS, and React Router.

---

## Frontend Guide

For a detailed breakdown of the application's structure, pages, and components, please refer to the main project documentation:

**[➡️ View Frontend Application Guide](../../DOCUMENTATION.md#frontend-application-guide)**

---

## Local Setup

Follow these steps to get the frontend application running on your local machine.

### Prerequisites

-   Node.js v18 or higher.
-   The backend API service must be running, as this application proxies all API requests to it. See the [backend README](../backend/README.md) for setup instructions.

### 1. Install Dependencies

From within this `frontend/audience-manager-frontend` directory, install all the required npm packages.

```bash
npm install
```

### 2. Run the Development Server

Once the dependencies are installed, you can start the React development server.

```bash
npm start
```

This will automatically open the application in your default web browser, typically at `http://localhost:3000`.

### API Proxy

Note that this application is configured to proxy API requests to the backend server running at `http://127.0.0.1:5000`. This is handled by the `"proxy"` key in the `package.json` file, which avoids CORS issues during development.

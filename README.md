# Vite + Quart Cross-Platform Packager Boilerplate with Electron

## Overview

This template provides a ready-to-use environment for building and packaging a cross-platform application using Vite for the frontend and Quart for the backend. The setup utilizes Docker to containerize both services and Electron to create a standalone executable for your application. 

## Requirements

Before you start, ensure you have Docker, Docker Compose, and Node.js installed on your system. You can find the installation instructions for these tools here:
- [Install Docker](https://docs.docker.com/get-docker/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)
- [Install Node.js](https://nodejs.org/)

## Repository Structure

The boilerplate is structured as follows:

```
├── README.md                # This README file
├── .env.template            # Environment variable template file, to be copied to .env
├── .gitignore               # Git ignore file
├── docker-compose.yml       # Docker Compose configuration file
├── frontend/                # Frontend Vite-React application directory
│   ├── index.html           # Main HTML file
│   ├── Dockerfile           # Dockerfile for the frontend
│   ├── .eslintrc.cjs        # ESLint configuration
│   ├── vite.config.js       # Vite configuration
│   ├── .gitignore           # Git ignore file for the frontend
│   ├── package.json         # Frontend package configuration
│   ├── public/              # Public assets directory
│   │   └── vite.svg         # Vite logo
│   ├── src/                 # Source code for the frontend
│       ├── App.css          # CSS for the App component
│       ├── index.css        # Global CSS
│       ├── main.jsx         # Main entry point for React
│       ├── App.jsx          # React App component
│       └── assets/          # Assets directory
│           └── react.svg    # React logo
├── backend/                 # Backend application directory
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Dockerfile for the backend
│   └── app.py               # Quart application
└── electron/                # Electron application directory
    ├── main.js              # Main script for Electron
    ├── package.json         # Electron package configuration
    └── preload.js           # Optional: Preload script for Electron
```

## Setting Up Environment

1. **Clone the repository**:
   ```bash
   git clone git@github.com:albertbuchard/vite-quart-cross-platform-boilerplate.git
   cd vite-quart-cross-platform-boilerplate
   ```

2. **Create the `.env` file**:
   Copy the `.env.template` file to `.env` and adjust the variables if needed.
   ```bash
   cp .env.template .env
   ```

3. **Install Docker, Docker Compose, and Node.js**:
   Follow the [Docker](https://docs.docker.com/get-docker/), [Docker Compose](https://docs.docker.com/compose/install/), and [Node.js](https://nodejs.org/) installation guides.

## Running the Application

1. **Build and start the services**:
   Navigate to the root directory and use Docker Compose to build and start the services.
   ```bash
   docker-compose up --build
   ```

2. **Run the Electron application**:
   Navigate to the `electron` directory and start the Electron application. This will launch a window that opens the frontend and controls the backend services.
   ```bash
   cd electron
   npm install
   npm start
   ```

3. **Access the frontend and backend**:
   The Electron application will open a browser window to the frontend URL defined in your `.env` file (`FRONTEND_HOST` and `FRONTEND_PORT`).

## Packaging the Application

To package the application into a standalone executable for different platforms, follow these steps:

1. **Navigate to the `electron` directory**:
   ```bash
   cd electron
   ```

2. **Install the necessary npm packages**:
   ```bash
   npm install
   ```

3. **Run the packaging script**:
   This will create executables for Linux, macOS, and Windows in the `dist` directory.
   ```bash
   npm run package
   ```

The executables will be found in the `dist` directory inside the `electron` folder.

## Development Notes

- **Frontend**: The Vite-based frontend is located in the `frontend` directory. Use `npm run dev` for development and `npm run build` to build the production assets.
- **Backend**: The Quart-based backend is in the `backend` directory. You can run it locally with `python app.py`, or use Docker to containerize it.
- **Electron**: The Electron application is in the `electron` directory. You can develop and test the Electron app by running `npm start` inside the `electron` directory.

## Additional Information

- **Environment Variables**: The `.env` file is crucial for setting up the environment. Ensure it is properly configured.
- **Electron**: The `main.js` script in the `electron` directory is responsible for starting the Docker services and launching the frontend URL in a window. It also ensures Docker services are shut down when the window is closed.
- **Packaging**: The `electron/package.json` file contains scripts and configuration for packaging the application into standalone executables using `electron-builder`.

For detailed configuration, refer to each respective file within the repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or issues, please contact the repository maintainer.

---

Enjoy building with Vite, Quart, and Electron!

---

This README now reflects the updated approach using Electron to manage and package your application across multiple platforms.
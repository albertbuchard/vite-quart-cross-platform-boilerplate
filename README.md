# Vite + Quart Cross-Platform Packager Boilerplate

## Overview

This template provides a ready-to-use environment for building and packaging a cross-platform application using Vite for the frontend and Quart for the backend. The setup uses Docker to containerize both services and provides a packager script to bundle the entire application into a distributable format.

## Requirements

Before you start, ensure you have Docker and Docker Compose installed on your system. You can find the installation instructions for Docker and Docker Compose here:
- [Install Docker](https://docs.docker.com/get-docker/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)

## Repository Structure

The project is structured as follows:

```
├── interface.js             # Script to interface with the application
├── README.md                # This README file
├── .env.template            # Environment variable template file
├── .gitignore               # Git ignore file
├── docker-compose.yml       # Docker Compose configuration file
├── frontend/                # Frontend application directory
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
└── packager/                # Packager script directory
    ├── packager.js          # Script to package the application
    └── package.json         # Packager package configuration
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

3. **Install Docker and Docker Compose**:
   Follow the [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installation guides.

## Running the Application

1. **Build and start the services**:
   Navigate to the root directory and use Docker Compose to build and start the services.
   ```bash
   docker-compose up --build
   ```

2. **Access the frontend**:
   Open your browser and go to `http://localhost:<FRONTEND_PORT>` (replace `<FRONTEND_PORT>` with the port specified in your `.env` file, default is `3000`).

3. **Access the backend API**:
   You can access the backend API at `http://localhost:<BACKEND_PORT>/data` (replace `<BACKEND_PORT>` with the port specified in your `.env` file, default is `5000`).

## Packaging the Application

To package the application into a standalone executable for different platforms, follow these steps:

1. **Navigate to the `packager` directory**:
   ```bash
   cd packager
   ```

2. **Install the necessary npm packages**:
   ```bash
   npm install
   ```

3. **Run the packaging script**:
   This will create executables for Linux, macOS, and Windows in the parent directory.
   ```bash
   npm run package
   ```

The executables will be found in the `../` directory relative to the `packager` folder.

## Development Notes

- **Frontend**: The Vite-based frontend is located in the `frontend` directory. Use `npm run dev` for development and `npm run build` to build the production assets.
- **Backend**: The Quart-based backend is in the `backend` directory. You can run it locally with `python app.py`, or use Docker to containerize it.

## Additional Information

- The `interface.js` script is designed to load and open the frontend URL automatically in your default browser.
- The `packager/packager.js` script is responsible for bundling the entire application into a distributable format using `pkg`.

For detailed configuration, refer to each respective file within the repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or issues, please contact the repository maintainer.

---

Enjoy building with Vite and Quart!
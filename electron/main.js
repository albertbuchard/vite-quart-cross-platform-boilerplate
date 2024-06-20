const {app, BrowserWindow} = require('electron');
const path = require('path');
const {loadEnvironmentVariables, findDockerComposeDirectory, executeCommand} = require("./src/utilities");

const startup = async () => {
    try {
        const composeFileDirectory = findDockerComposeDirectory();
        console.log(`Docker Compose directory: ${composeFileDirectory}`);

        loadEnvironmentVariables(composeFileDirectory);
        console.log(`Environment variables loaded. 
        Host: ${process.env.FRONTEND_HOST}, Port: ${process.env.FRONTEND_PORT}`);

        // Quit when all windows are closed (except on macOS)
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                executeCommand('docker-compose', ['down'], composeFileDirectory).then(() => {
                    app.quit();
                }).catch((error) => {
                    console.error(`Failed to stop Docker Compose: ${error.message}`);
                    app.quit();
                });
            }
        });

        console.log('Starting Docker Compose with rebuild...');
        await executeCommand(
            'docker-compose',
            ['up', '--build'],
            composeFileDirectory, ({
                                       newString,
                                       allOutputString,
                                       resolve
                                   }) => {
                // Look for specific markers in the Docker Compose output that indicate readiness
                if (allOutputString.includes('Attaching to') || allOutputString.includes('Running on')) {
                    resolve(); // Resolve the promise when these markers are found
                }
            })
        console.log('Docker Compose started successfully.');

        // Create the Electron window
        const onCloseCallback = async () => {
            console.log('Stopping Docker Compose...');
            await executeCommand('docker-compose', ['down'], composeFileDirectory);
            console.log('Docker Compose stopped successfully.');
        }
        createWindow({onCloseCallback});
    } catch (error) {
        console.error(`Execution failed: ${error.message}`); // Debug: Print execution failure details
        process.exit(1);
    }
}

// Function to create the Electron window
function createWindow({onCloseCallback}) {
    // Create the browser window
    const win = new BrowserWindow({
        width: 800, height: 600, webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Construct the URL based on environment variables or defaults
    const url = `http://${process.env.FRONTEND_HOST || 'localhost'}:${process.env.FRONTEND_PORT || 3000}`;
    // Number of retry attempts
    const maxRetries = 5;
    // Delay between retries in milliseconds
    const retryDelay = 2000;
    const loadURLWithRetries = (retryCount = 0) => {
        win.loadURL(url).then(() => {
            console.log(`Successfully loaded URL: ${url}`);
        }).catch((error) => {
            console.error(`Failed to load the URL on attempt ${retryCount + 1}: ${error.message}`);

            if (retryCount < maxRetries) {
                console.log(`Retrying in ${retryDelay / 1000} seconds...`);
                setTimeout(() => loadURLWithRetries(retryCount + 1), retryDelay);
            } else {
                console.error(`Exceeded maximum retry attempts. Quitting application.`);
                app.quit();
            }
        });
    };

    loadURLWithRetries();

    // Open the DevTools (optional)
    // win.webContents.openDevTools();

    // Event when the window is closed
    win.on('closed', async() => {
        try {
            await onCloseCallback();
            app.quit();
        } catch (error) {
            console.error(`Failed to close the window: ${error.message}`);
            app.quit();
        }

    });
}

// Main execution logic
app.whenReady().then(startup);

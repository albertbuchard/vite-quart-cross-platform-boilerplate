const {app, BrowserWindow} = require('electron');
const path = require('path');
const {
    loadEnvironmentVariables, findDockerComposePath, executeCommand, loadURLWithRetries, dockerComposeUp,
    dockerComposeDown, errors
} = require("./src/utilities");

const startup = async () => {
    try {
        console.log('Starting application...');
        console.log(`Ressource path: ${process.resourcesPath}`);
        const composeFilePath = findDockerComposePath();
        console.log(`Docker Compose file path: ${composeFilePath}`);
        const composeFileDirectory = path.dirname(composeFilePath);
        console.log(`Docker Compose directory: ${composeFileDirectory}`);

        loadEnvironmentVariables(composeFileDirectory);
        console.log(`
        Environment variables:
        Host: ${process.env.FRONTEND_HOST},
        Port: ${process.env.FRONTEND_PORT}
        `);

        await dockerComposeUp({composeFilePath});

        // Open a window that shows the list of errors
        if (errors.length === 0) {
            console.log('No errors found.');
        } else {
            const errorWindow = new BrowserWindow({width: 800, height: 600});
            await errorWindow.loadURL(`data:text/html,${errors.join('<br>')}`);
        }

        // Quit when all windows are closed (except on macOS)
        app.on('window-all-closed', async () => {
            if (process.platform !== 'darwin') {
                await dockerComposeDown({composeFilePath});
            }
        });

        // Create the Electron window
        const onCloseCallback = () => dockerComposeDown({composeFilePath})
        createWindow({onCloseCallback});
    } catch (error) {
        console.error(`Execution failed: ${error.message}`); // Debug: Print execution failure details
        // app.quit();
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

    loadURLWithRetries({window: win, url});

    // Open the DevTools (optional)
    // win.webContents.openDevTools();

    // Event when the window is closed
    win.on('closed', async () => {
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

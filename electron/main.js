const {app, BrowserWindow} = require('electron');
const path = require('path');
const {
    loadEnvironmentVariables, findDockerComposeDirectory, executeCommand, loadURLWithRetries, dockerComposeUp,
    dockerComposeDown
} = require("./src/utilities");

const startup = async () => {
    try {
        const composeFileDirectory = findDockerComposeDirectory();
        console.log(`Docker Compose directory: ${composeFileDirectory}`);

        loadEnvironmentVariables(composeFileDirectory);
        console.log(`
        Environment variables loaded. 
        Host: ${process.env.FRONTEND_HOST}, 
        Port: ${process.env.FRONTEND_PORT}
        `);

        await dockerComposeUp({composeFileDirectory});

        // Quit when all windows are closed (except on macOS)
        app.on('window-all-closed', async () => {
            if (process.platform !== 'darwin') {
                await dockerComposeDown({composeFileDirectory});
            }
        });

        // Create the Electron window
        const onCloseCallback = () => dockerComposeDown({composeFileDirectory})
        createWindow({onCloseCallback});
    } catch (error) {
        console.error(`Execution failed: ${error.message}`); // Debug: Print execution failure details
        app.quit();
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

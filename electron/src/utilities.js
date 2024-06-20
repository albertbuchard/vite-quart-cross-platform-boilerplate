// Function to execute a command with options
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const {app} = require("electron");

const errors = [];

const executeCommand = ({command, args, cwd = ".", stdoutCallback = null}) => {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {cwd});

        let allOutputString = '';
        child.stdout.on('data', (data) => {
            process.stdout.write(data);
            const newString = data.toString();
            allOutputString += newString;
            if (stdoutCallback) {
                stdoutCallback({newString, allOutputString, resolve, reject});
            }
        });
        child.stderr.on('data', (data) => {
            process.stderr.write(data); // Output stderr to the console
            // errors.push(data.toString());
        });
        child.on('close', (code) => {
            if (code !== 0) {
                errors.push(`${command} process exited with code ${code}`);
                reject(new Error(`${command} process exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
};
const findFileInTree = (startPath, fileName, maxDepth = null) => {
    let currentPath = startPath;

    console.log(`Starting search for ${fileName} from: ${startPath}`);
    let depth = 0;
    while (true) {
        if (maxDepth && depth > maxDepth) {
            console.warn(`Reached maximum depth of ${maxDepth} without finding ${fileName}`);
            return null;
        }
        const potentialPath = path.join(currentPath, fileName);
        console.log(`Checking: ${potentialPath}`); // Debug: Print the current path being checked

        if (fs.existsSync(potentialPath)) {
            console.log(`Found ${fileName} at: ${potentialPath}`); // Debug: Found the file
            return potentialPath;
        }

        const parentPath = path.resolve(currentPath, '..');
        console.log(`Moving up to parent path: ${parentPath}`); // Debug: Print the next directory to check

        if (parentPath === currentPath) {
            // Reached the root directory without finding the file
            return null;
        }
        currentPath = parentPath;
        depth += 1;
    }
};

// Function to find the directory containing docker-compose.yml by traversing up the directory tree
const findDockerComposePath = () => {
    // Try to locate docker-compose.yml starting from the current working directory
    const executableDir = path.dirname(process.execPath);
    // Try to locate docker-compose.yml starting from the executable directory
    let dockerPath = findFileInTree(executableDir, 'docker-compose.yml');

    if (dockerPath === null) {
        // Look for docker-compose-package.yml in the resources directory
        dockerPath = findFileInTree(process.resourcesPath + '/app', 'docker-compose-packaged.yml');
    }

    if (dockerPath) {
        return dockerPath
    }

    errors.push('docker-compose.yml not found either in the current directory or in the resources directory');
};

const loadEnvironmentVariables = (startPath) => {
    // find the .env file in the same directory as the docker-compose.yml file
    const envFilePath = findFileInTree(startPath, '.env')
    if (envFilePath && fs.existsSync(envFilePath)) {
        console.log(`Loading environment variables from: ${envFilePath}`);
        dotenv.config({path: envFilePath});
    } else {
        console.warn(`.env file not found in: ${startPath}`);
        errors.push('.env file not found in: ${startPath}');
    }
}

const findDockerAndUpdatePath = () => {
    // Function to find docker and docker-compose executables in common system paths
    // Necessary when app is packaged as an Electron app

    const possiblePaths = [
        // Common locations for Unix-like systems
        '/usr/local/bin/',
        '/usr/bin/',
        '/usr/local/sbin/',
        '/sbin/',
        '/snap/bin/',
        // Common locations for Docker installed via Homebrew on macOS
        '/opt/homebrew/bin/',
        // Common locations for Windows
        'C:\\Program Files\\Docker\\Docker\\resources\\bin\\',
        'C:\\Program Files (x86)\\Docker\\Docker\\resources\\bin\\',
        'C:\\ProgramData\\Docker\\resources\\bin\\',
        'C:\\Docker Toolbox\\',
        'C:\\Program Files\\Docker Toolbox\\'
    ];

    // Check common system paths
    let foundCompose = false;
    let foundDocker = false;
    for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath + 'docker-compose')) {
            process.env.PATH = `${possiblePath}:${process.env.PATH}`;
            foundCompose = true;
            console.log(`Docker Compose executable found at: ${possiblePath}`);
        }
        if (fs.existsSync(possiblePath + 'docker')) {
            process.env.PATH = `${possiblePath}:${process.env.PATH}`;
            foundDocker = true;
            console.log(`Docker executable found at: ${possiblePath}`);
        }
    }

    if (!foundCompose) {
        errors.push('docker-compose executable not found');
    }
    if (!foundDocker) {
        errors.push('docker executable not found');
    }
}
const dockerComposeUp = async ({composeFilePath}) => {
    try {
        findDockerAndUpdatePath();
        console.log('Starting Docker Compose with rebuild...');
        console.log(`Docker Compose YML Path: ${composeFilePath}`);

        await executeCommand({
            command: "docker-compose",
            args: ['-f', composeFilePath, 'up', '--build'],
            stdoutCallback: ({newString, allOutputString, resolve}) => {
                // Look for specific markers in the Docker Compose output that indicate readiness
                if (allOutputString.includes('Attaching to') || allOutputString.includes('Running on')) {
                    resolve(); // Resolve the promise when these markers are found
                }
            }
        })
        console.log('Docker Compose started successfully.');
    } catch (error) {
        console.error(`Failed to start Docker Compose: ${error.message}`)
        errors.push(error.message)
    }
}

const dockerComposeDown = async ({composeFilePath}) => {
    try {
        console.log('Stopping Docker Compose...')
        await executeCommand({
            command: "docker-compose",
            args: ['-f', composeFilePath, 'down']
        })
        console.log('Docker Compose stopped successfully.')
    } catch (error) {
        console.error(`Failed to stop Docker Compose: ${error.message}`)
        errors.push(error.message)
    }
}
const loadURLWithRetries = ({
                                window,
                                url,
                                retryCount = 0,
                                retryDelay = 2000,
                                maxRetries = 5
                            }) => {
    window.loadURL(url).then(() => {
        console.log(`Successfully loaded URL: ${url}`)
    }).catch((error) => {
        console.error(`Failed to load the URL on attempt ${retryCount + 1}: ${error.message}`)

        if (retryCount < maxRetries) {
            console.log(`Retrying in ${retryDelay / 1000} seconds...`);
            setTimeout(() => loadURLWithRetries({
                window,
                url,
                retryCount: retryCount + 1
            }), retryDelay)
        } else {
            let errorMessage = `Exceeded page load retry attempts for: ${url}`;
            console.error(errorMessage);
            errors.push(errorMessage);
        }
    });
};

module.exports = {
    errors,
    executeCommand,
    findDockerComposePath,
    dockerComposeUp,
    dockerComposeDown,
    loadEnvironmentVariables,
    loadURLWithRetries
};
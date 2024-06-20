// Function to execute a command with options
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const executeCommand = (command, args, cwd, stdoutCallback = null) => {
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
        });
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`${command} process exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
};
const findFileInTree = (startPath, fileName) => {
    let currentPath = startPath;

    console.log(`Starting search for ${fileName} from: ${startPath}`);

    while (true) {
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
            throw new Error(`${fileName} not found`);
        }
        currentPath = parentPath;
    }
};

// Function to find the directory containing docker-compose.yml by traversing up the directory tree
const findDockerComposeDirectory = () => {
    const executableDir = path.dirname(process.execPath);
    // Try to locate docker-compose.yml starting from the executable directory
    return path.dirname(findFileInTree(executableDir, 'docker-compose.yml'));
};

const loadEnvironmentVariables = (startPath) => {
    // find the .env file in the same directory as the docker-compose.yml file
    const envFilePath = findFileInTree(startPath, '.env')
    if (fs.existsSync(envFilePath)) {
        console.log(`Loading environment variables from: ${envFilePath}`);
        dotenv.config({path: envFilePath});
    } else {
        console.warn(`.env file not found in: ${startPath}`);
    }
}

module.exports = {
    executeCommand,
    findDockerComposeDirectory,
    loadEnvironmentVariables
};
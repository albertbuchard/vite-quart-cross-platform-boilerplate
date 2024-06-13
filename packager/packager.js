const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to find a file by traversing up the directory tree
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
const findDockerComposeDirectory = (startPath) => {
    return path.dirname(findFileInTree(startPath, 'docker-compose.yml'));
};

let composeFileDirectory;

try {
    // Determine the directory of the executable or script
    const executableDir = path.dirname(process.execPath);
    // Try to locate docker-compose.yml starting from the executable directory
    composeFileDirectory = findDockerComposeDirectory(executableDir);
    console.log(`Using docker-compose.yml directory: ${composeFileDirectory}`); // Debug: Print the directory to be used

    // Print current working directory and list files for debugging
    console.log(`Current working directory: ${composeFileDirectory}`);
    console.log('Files in the current directory:', fs.readdirSync(composeFileDirectory));
} catch (error) {
    console.error(error.message);
    process.exit(1);
}


// Function to install Puppeteer globally if not already installed
const installOpenAndDotenvGlobally = () => {
    return new Promise((resolve, reject) => {
                // Install Puppeteer globally
                const npmInstall = spawn('npm', ['install', '-g', 'open' , 'dotenv'], {stdio: 'inherit'});

                npmInstall.on('close', (installCode) => {
                    if (installCode === 0) {
                        console.log('open and dotenv installed successfully.');
                        resolve();
                    } else {
                        reject(new Error('Failed to install open and dotenv globally.'));
                    }
                });
    });
};
const executeCommand = (command, args, workingDirectory) => {
    console.log(`Executing command: ${command} ${args.join(' ')}`); // Debug: Print the command being executed
    console.log(`In directory: ${workingDirectory}`); // Debug: Print the working directory for the command

    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {cwd: workingDirectory});

        let dockerComposeOutput = '';

        child.stdout.on('data', (data) => {
            const output = data.toString();
            process.stdout.write(output); // Output stdout to the console
            dockerComposeOutput += output;

            // Look for specific markers in the Docker Compose output that indicate readiness
            if (output.includes('Attaching to') || output.includes('Running on')) {
                resolve(); // Resolve the promise when these markers are found
            }
        });

        child.stderr.on('data', (data) => {
            process.stderr.write(data); // Output stderr to the console
        });

        child.on('close', (code) => {
            if (code !== 0 && !dockerComposeOutput.includes('Attaching to') && !dockerComposeOutput.includes('Running on')) {
                reject(`Command failed with code ${code}`);
            }
        });
    });
};

const spawnInterfaceScript = () => {

    // Determine the path to interface.js relative to the current executable
    const interfaceScriptPath = findFileInTree(path.dirname(process.execPath), 'interface.js');

    console.log(`Spawning interface.js from: ${interfaceScriptPath}`); // Debug: Print the path to interface.js
    const child = spawn('node', [interfaceScriptPath], {
        stdio: 'inherit' // Inherit the stdio to see the output in the current terminal
    });

    child.on('close', (code) => {
        if (code !== 0) {
            console.error(`interface.js process exited with code ${code}`);
        } else {
            console.log('interface.js executed successfully.');
        }
    });
};

(async () => {
    try {
        await installOpenAndDotenvGlobally();

        console.log('Starting Docker Compose with rebuild...');
        await executeCommand('docker-compose', ['up', '--build'], composeFileDirectory);
        console.log('Docker Compose started successfully.');

        // Spawn the interface script with the specified URL
        spawnInterfaceScript();
    } catch (error) {
        console.error(`Execution failed: ${error}`); // Debug: Print execution failure details
    }
})();

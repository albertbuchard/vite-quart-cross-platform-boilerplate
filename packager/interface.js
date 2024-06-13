const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to load a module from the global node_modules using dynamic import
const loadGlobalModule = async (moduleName) => {
  try {
    // Get the global node_modules path using npm root -g
    const globalNodeModulesPath = execSync('npm root -g').toString().trim();
    console.log(`Global node_modules path: ${globalNodeModulesPath}`);

    // Construct the path to the module's main directory
    let modulePath = path.join(globalNodeModulesPath, moduleName);
    console.log(`${moduleName} path: ${modulePath}`);

    // Check if the modulePath is a directory and point to index.js if it is
    if (fs.existsSync(modulePath) && fs.lstatSync(modulePath).isDirectory()) {
      modulePath = path.join(modulePath, 'index.js');
      console.log(`Resolved ${moduleName} to: ${modulePath}`);
    }

    // Use dynamic import to load the ES module
    const module = await import(modulePath);
    return module;
  } catch (error) {
    console.error(`Failed to load ${moduleName} from global node_modules: ${error.message}`);
    process.exit(1);
  }
};

// Load dotenv from the global installation using require
const loadGlobalDotenv = () => {
  try {
    // Get the global node_modules path using npm root -g
    const globalNodeModulesPath = execSync('npm root -g').toString().trim();
    console.log(`Global node_modules path: ${globalNodeModulesPath}`);

    // Construct the path to dotenv's main file
    const dotenvPath = path.join(globalNodeModulesPath, 'dotenv');
    console.log(`Dotenv path: ${dotenvPath}`);

    // Require dotenv dynamically from the global path
    return require(dotenvPath);
  } catch (error) {
    console.error(`Failed to load dotenv from global node_modules: ${error.message}`);
    process.exit(1);
  }
};

// Load dotenv using require
const dotenv = loadGlobalDotenv();

try {
    // Determine the directory of the executable or script
  const executableDir = path.dirname(process.execPath);

    // Print current working directory and list files for debugging
    console.log(`Current working directory: ${executableDir}`);
    console.log('Files in the current directory:', fs.readdirSync(executableDir));

    console.log('Loading environment variables from .env file');
    dotenv.config({ path: path.join(executableDir, '.env') });
} catch (error) {
    console.error(error.message);
    process.exit(1);
}


// Function to open the default browser to the specified URL
const openDefaultBrowser = async () => {
  const url = `http://${process.env.FRONTEND_HOST || 'localhost'}:${process.env.FRONTEND_PORT || 3000}`;
  console.log(`Opening default browser to ${url}`);

  try {
    // Load the 'open' module dynamically as it is an ES module
    const openModule = await loadGlobalModule('open');
    const open = openModule.default || openModule; // ES modules export `default`

    // Use the open function to open the URL in the default browser
    await open(url);
    console.log('Default browser opened successfully.');
  } catch (error) {
    console.error(`Failed to open default browser: ${error.message}`);
    process.exit(1);
  }
};

// Execute the function to open the URL in the default browser
(async () => {
  await openDefaultBrowser();
})();

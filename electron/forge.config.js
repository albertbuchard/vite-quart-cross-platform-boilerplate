const path = require('path');
const fs = require('fs');

module.exports = {
    packagerConfig: {
    },
    makers: [
        // {
        //     "name": "@electron-forge/maker-squirrel",
        //     "config": {}
        // },
        // {
        //     "name": "@electron-forge/maker-zip",
        //     "platforms": [
        //         "darwin",
        //         "linux",
        //         "win64"
        //     ]
        // },
        // {
        //     "name": "@electron-forge/maker-deb",
        //     "config": {}
        // },
        // {
        //     "name": "@electron-forge/maker-rpm",
        //     "config": {}
        // },
        {
            "name": "@electron-forge/maker-dmg",
            "config": {
                "format": "ULFO"
            }
        }
    ],
    hooks: {
        packageAfterCopy: async (config, buildPath, electronVersion, platform, arch) => {
            //  Copy frontend, backend, docker-compose.yml, and .env files to the build directory
            const basePath = path.join(__dirname, '../');
            const files = ['frontend', 'backend', 'docker-compose.yml', '.env', 'docker-compose-packaged.yml'];
            for (const file of files) {
                const src = path.join(basePath, file);
                const dst = path.join(buildPath, file);
                process.stdout.write(`[PackageAfterCopy] Copying ${src} to ${dst}\n`);
                fs.cpSync(src, dst, {recursive: true});
            }
        }
    }
};

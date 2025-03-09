const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = require(packageJsonPath);

// Add test scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
};

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2)); 
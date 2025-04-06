const fs = require('fs');
const path = require('path');

// The correct key for the desired extension ID
const EXTENSION_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoMoUnkthR+jQ8UpKoA6wxrS4G8MfdkvW8V8FxmQT9DzKQd3pCfYMLIE3AmA06MAVwyOx/LBRJKjxHmhJxOdljN2o/TpXUHQCbf0COIMB6gMLs3MaF0djWtNB6yPdaK8x2QiwN17P+ACP5IrZXLiiM5/xWbmQ0wrbZXxyiOEwoy+WCkm0i+LfzQtbLrN3Rgx73Y9YGLQoA10D7rYe7TQV0tjUyxvEL/HkBYe/5whlXMrGlCOBiy+a5pTYcRw4rf6Va5BSq4Ef+8z3NUPnRWaz21/l0D+Rp/Ok6Z8eb/biuw47xPDIY3U9iWe8g7C8b3jCO5ct06DmcyxqrOBGS3HdywIDAQAB";

// Paths to the manifest files
const BUILD_DIR = 'build/chrome-mv3-prod';
const MANIFEST_PATH = path.join(BUILD_DIR, 'manifest.json');

// Read the built manifest
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// Update the key
manifest.key = EXTENSION_KEY;

// Write back the updated manifest
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2)); 
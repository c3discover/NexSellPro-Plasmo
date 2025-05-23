/**
 * @fileoverview Type definitions for JSON module imports
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No imports needed as this is a declaration file

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants needed

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Declares the type for imported JSON files
 * This allows TypeScript to understand the structure of imported JSON files
 */
declare module "*.json" {
    const content: {
        version: string;  // The version of the JSON data
        [key: string]: any;  // Allows for additional properties of any type
    };
    export = content;  // Exports the JSON content as a module
}

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// No configuration needed

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// No helper functions needed

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// No exports needed as this is a declaration file 
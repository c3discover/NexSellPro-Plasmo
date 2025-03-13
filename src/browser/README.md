# Chrome API Module

This module provides a wrapper around the Chrome extension API, making it easier to use with proper error handling and TypeScript support.

## Directory Structure

```
browser/
├── api.ts                 # Chrome API implementation
├── index.ts               # Exports Chrome API functionality
└── README.md              # This file
```

## Usage

### Basic Usage

```typescript
import { browserAPI } from './browser';

// Send a message to the background script
browserAPI.runtime.sendMessage({ type: 'HELLO' })
  .then(response => {
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Checking API Availability

```typescript
import { isBrowserAPIAvailable } from './browser';

if (isBrowserAPIAvailable()) {
  // Chrome API is available
  // Safe to use browserAPI
} else {
  // Chrome API is not available
  // Handle gracefully
}
```

## API Reference

### browserAPI

The `browserAPI` object provides a wrapper around the Chrome extension API. It includes the following namespaces:

- `runtime`: For messaging and extension lifecycle management
- `storage`: For storing and retrieving data
- `tabs`: For working with browser tabs
- `webNavigation`: For detecting navigation events
- `webRequest`: For intercepting web requests

### isBrowserAPIAvailable

The `isBrowserAPIAvailable` function checks if the Chrome API is available in the current environment. 
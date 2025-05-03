export default {
  defaultLocale: "en",
  manifestVersion: 3,
  runtime: "nodejs",
  dev: {
    extendManifest: true
  },
  overrideManifest: {
    name: "NexSellPro",
    version: "0.0.3",
    author: "C3 Discover LLC <admin@c3discover.com>",
    description: "NexSellPro: Chrome extension to assist Walmart sellers with profitability calculations and product analysis",

    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoMoUnkthR+jQ8UpKoA6wxrS4G8MfdkvW8V8FxmQT9DzKQd3pCfYMLIE3AmA06MAVwyOx/LBRJKjxHmhJxOdljN2o/TpXUHQCbf0COIMB6gMLs3MaF0djWtNB6yPdaK8x2QiwN17P+ACP5IrZXLiiM5/xWbmQ0wrbZXxyiOEwoy+WCkm0i+LfzQtbLrN3Rgx73Y9YGLQoA10D7rYe7TQV0tjUyxvEL/HkBYe/5whlXMrGlCOBiy+a5pTYcRw4rf6Va5BSq4Ef+8z3NUPnRWaz21/l0D+Rp/Ok6Z8eb/biuw47xPDIY3U9iWe8g7C8b3jCO5ct06DmcyxqrOBGS3HdywIDAQAB",

    oauth2: {
      client_id: "469074340331-62763q6jvgj6voqg4vu8mi5bgfhs0qkd.apps.googleusercontent.com",
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file"
      ]
    },

    permissions: [
      "storage",
      "tabs",
      "webNavigation",
      "webRequest",
      "identity"
    ],

    host_permissions: [
      "https://accounts.google.com/*",
      "https://www.googleapis.com/*",
      "https://www.walmart.com/*"
    ],

    options_ui: {
      page: "options.html",
      open_in_tab: true
    },

    background: {
      service_worker: "background/index.ts",
      type: "module"
    },

    content_security_policy: {
      extension_pages:
        "script-src 'self'; object-src 'self'; connect-src 'self' https://api.emailjs.com https://*.walmart.com https://accounts.google.com https://www.googleapis.com"
    },

    icons: {
      "16": "assets/icons/icon16.png",
      "32": "assets/icons/icon32.png",
      "48": "assets/icons/icon48.png",
      "64": "assets/icons/icon64.png",
      "128": "assets/icons/icon128.png"
    },

    action: {
      default_icon: {
        "16": "assets/icons/icon16.png",
        "32": "assets/icons/icon32.png",
        "48": "assets/icons/icon48.png",
        "64": "assets/icons/icon64.png",
        "128": "assets/icons/icon128.png"
      }
    },

    web_accessible_resources: [
      {
        resources: ["assets/*"],
        matches: ["https://www.walmart.com/*"]
      }
    ]
  }
}

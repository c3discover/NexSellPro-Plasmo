# NexSellPro

**NexSellPro** is a Chrome extension that helps Walmart sellers make informed decisions about product profitability and performance. It provides detailed product analysis, including estimated profitability, sales data, and tools for understanding market competition—all within the Walmart product pages.

This extension is designed to be simple to use, integrating directly with the Walmart product listings to give you the insights you need to grow your e-commerce business.

## Features

NexSellPro offers a range of features to help Walmart sellers make informed business decisions:

- **Profitability Calculations**: Provides estimated profit, margin, and return on investment for products.
- **Product Analysis**: Displays key product metrics like monthly sales estimates and competition data.
- **Variant Support**: Displays information for all product variants (e.g., colors, sizes).
- **Buy Gauge**: A quick gauge to help decide if the product is worth purchasing based on profitability and other metrics.

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the Chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

### Key Files for Development

- **`content.tsx`**: This file controls the core UI displayed on Walmart product pages.
- **`TopHeader.tsx`**: This is the header component displayed within the extension.
- **`Analysis.tsx`**: This component provides detailed profitability and sales analysis for the product.
- **`BuyGauge.tsx`**: Displays a gauge to quickly assess whether the product is a good buying opportunity.
- **`Product.tsx`**: Displays the main product details such as name, brand, and price.
- **`Pricing.tsx`**: Handles the display of pricing details, including cost, fees, and total profit.
- **`ProductInfo.tsx`**: Provides additional information about the product, such as specifications.
- **`Variations.tsx`**: Displays information for all variants of a product (e.g., different sizes or colors).
- **`ListingExport.tsx`**: Allows users to export listing details for further analysis or record-keeping.
- **`Settings.tsx`**: Contains configuration settings that can be modified by the user to customize their experience.
- **`Footer.tsx`**: Displays the footer of the extension with branding or links.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add an `options.tsx` file to the root of the project with a React component default exported. Likewise, to add a content page, add a `content.ts` file to the root of the project, importing some modules and doing some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/).

## Making a Production Build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the Webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action, however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit), and you should be on your way for automated submission!

## Contribution Guidelines

We welcome contributions! Please feel free to submit a pull request or open an issue for discussion. Make sure to run Prettier before submitting code changes:

```bash
pnpm prettier --write .
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Working on 0.0.4-dev

### Added
- New Integrations tab in Settings modal with modern Google Sheets integration UI
- Auto-set contract category based on product's main category
  - "Clothing" → "Apparel & Accessories"
  - "Beauty" → "Beauty"
  - "Baby" → "Baby"
  - "Health"/"Personal Care" → "Health & Personal Care"
  - "Food" → "Grocery"
  - "Cell Phones" → "Cell Phones"
  - "Camera"/"Photo" → "Camera & Photo"
- Added CHANGELOG.md to track project changes and versions
- Improved Google OAuth authentication with proper Chrome identity API integration
- Added rate limiting for API requests to prevent throttling

### Fixed
- Shipping dimensions now persist correctly when navigating away and returning
- WFS apparel fee ($0.50) now correctly applies when "Apparel & Accessories" is selected
- Pricing values (product cost, sale price) now persist correctly
- Values maintain bold styling when edited and returning to page
- Storage fee visibility now properly tied to fulfillment type selection
- Shipping rate calculations improved in Pricing component
- Extension persistence issues when navigating between product pages
- Google authentication flow now properly handles connection and disconnection
- Rate limiting implemented to prevent API throttling and CAPTCHA challenges

### Changed
- Updated fulfillment option buttons with modern styling and better visual feedback
- Improved error handling for localStorage operations
- Enhanced data persistence for product-specific settings
- Updated version numbering to use -dev suffix for development versions
- Enhanced Settings modal with improved tab organization and navigation
- Redesigned product badges with modern styling:
  - Added gradient backgrounds and icons for all standard Walmart badge types
  - Improved visual hierarchy with color-coded categories
  - Enhanced badge readability with consistent typography
  - Added hover effects and smooth transitions
  - Implemented flexible layout for better responsiveness
  - Added support for all common Walmart badge types with appropriate styling

## [0.0.3] - 2024-03-21
### Added
- Buy Gauge functionality
- Additional improvements and fixes

## [0.0.2] - 2024-03-14
### Changed
- Quick improvements and bug fixes from initial release

## [0.0.1] - 2024-03-07
### Added
- Initial beta private release
- Basic pricing calculator functionality
- Product data integration
- Settings management
- Export functionality 
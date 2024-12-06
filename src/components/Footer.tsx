////////////////////////////////////////////////
// Imports
////////////////////////////////////////////////
import React from "react";
import { version } from '../../package.json';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

////////////////////////////////////////////////
// Constants and Variables
////////////////////////////////////////////////
// No constants or variables defined here.

////////////////////////////////////////////////
// Props and Types
////////////////////////////////////////////////
interface FooterProps {
  version: string;  // Version number or text to display in the footer
}

////////////////////////////////////////////////
// State and Hooks
////////////////////////////////////////////////
// No state or hooks defined here.

////////////////////////////////////////////////
// Helper Functions
////////////////////////////////////////////////
// No helper functions defined here.

////////////////////////////////////////////////
// Event Handlers
////////////////////////////////////////////////
// No event handlers defined here.

////////////////////////////////////////////////
// JSX (Return)
////////////////////////////////////////////////
export const Footer = () => {
  return (
    <div
      id="footer"
      key={"footer"}
      className="flex flex-col items-center p-4 m-4 pt-4 bg-[#3a3f47] min-h-12 rounded-lg shadow-lg text-center text-white"
    >
      {/* Company Information */}
      <p className="text-xs font-semibold">
        WalAIWiz - Empowering Walmart Sellers with AI
      </p>
      <p className="text-xs font-light">
      Version: {version || "N/A"}
      </p>

      {/* Links Section */}
      <div className="flex justify-center gap-4 mt-2">
        <a href="/contact" className="text-sm underline hover:text-cyan-400">
          Contact Us
        </a>
        <a href="/feedback" className="text-sm underline hover:text-cyan-400">
          Send Feedback
        </a>
        <a href="/about" className="text-sm underline hover:text-cyan-400">
          About Us
        </a>
        <a href="/privacy-policy" className="text-sm underline hover:text-cyan-400">
          Privacy Policy
        </a>
        <a href="/terms" className="text-sm underline hover:text-cyan-400">
          Terms of Service
        </a>
      </div>

      {/* Social Media Icons */}
      <div className="flex justify-center gap-4 mt-4">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebook className="w-6 h-6 hover:text-blue-500 transition-colors duration-200" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FaTwitter className="w-6 h-6 hover:text-blue-300 transition-colors duration-200" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <FaLinkedin className="w-6 h-6 hover:text-blue-600 transition-colors duration-200" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="w-6 h-6 hover:text-pink-400 transition-colors duration-200" />
        </a>
      </div>

      {/* Newsletter Subscribe (Future Enhancement) */}
      <div className="mt-4">
        <p className="text-xs italic">Subscribe to get the latest updates:</p>
        <input
          type="text"
          placeholder="Enter your email"
          className="p-1 rounded-lg mt-2 text-black"
        />
        <button className="ml-2 px-3 py-1 bg-cyan-500 rounded-lg text-white hover:bg-cyan-600">
          Subscribe
        </button>
      </div>

      {/* Legal and Copyright Information */}
      <p className="text-xs font-light italic mt-4">
        &copy; {new Date().getFullYear()} C3 Discover LLC. All Rights Reserved.
      </p>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement
////////////////////////////////////////////////
export default Footer;

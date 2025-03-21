/**
 * @fileoverview Footer component with newsletter subscription and social links
 * @author NexSellPro
 * @created 2024-03-07
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import { version } from '../../../package.json';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import emailjs from '@emailjs/browser';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Regular expression for validating email format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Social media platform URLs (placeholder until accounts are created)
const SOCIAL_LINKS = {
  facebook: "#",
  twitter: "#",
  linkedin: "#",
  instagram: "#"
};

// EmailJS service configuration
const EMAILJS_CONFIG = {
  serviceId: process.env.PLASMO_PUBLIC_EMAILJS_SERVICE_ID || "",
  adminTemplateId: process.env.PLASMO_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID || "",
  subscriberTemplateId: process.env.PLASMO_PUBLIC_EMAILJS_SUBSCRIBER_TEMPLATE_ID || "",
  publicKey: process.env.PLASMO_PUBLIC_EMAILJS_PUBLIC_KEY || ""
};

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Type for subscription status states
type SubscriptionStatus = 'idle' | 'loading' | 'success' | 'error';

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// No props needed for this component

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const Footer = () => {

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
  // State for email input and subscription process
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<SubscriptionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [hasConsented, setHasConsented] = useState(false);

  // Initialize EmailJS on component mount
  useEffect(() => {
    if (EMAILJS_CONFIG.publicKey) {
      emailjs.init(EMAILJS_CONFIG.publicKey);
    }
  }, []);

////////////////////////////////////////////////
// Chrome API Handlers:
////////////////////////////////////////////////
// No Chrome API handlers needed for this component

////////////////////////////////////////////////
// Event Handlers:
////////////////////////////////////////////////
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setSubscribeStatus('loading');
    setErrorMessage("");

    // Validate email and consent
    if (!email) {
      setErrorMessage("Please enter an email address");
      setSubscribeStatus('error');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage("Please enter a valid email address");
      setSubscribeStatus('error');
      return;
    }

    if (!hasConsented) {
      setErrorMessage("Please accept the privacy policy");
      setSubscribeStatus('error');
      return;
    }

    // Validate EmailJS configuration
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.adminTemplateId || 
        !EMAILJS_CONFIG.subscriberTemplateId || !EMAILJS_CONFIG.publicKey) {
      setErrorMessage("Subscription service is not properly configured");
      setSubscribeStatus('error');
      return;
    }

    try {
      // Send notification to admin
      const adminResponse = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.adminTemplateId,
        {
          subscriber_email: email,
          subscription_date: new Date().toLocaleDateString(),
          message: `New subscription from ${email}`
        }
      );

      // Send welcome email to subscriber
      const subscriberResponse = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.subscriberTemplateId,
        {
          to_email: email,
          from_name: "NexSellPro",
          to_name: email.split('@')[0],
          unsubscribe_link: `https://nexsellpro.com/unsubscribe?email=${encodeURIComponent(email)}`,
        }
      );

      if (adminResponse.status === 200 && subscriberResponse.status === 200) {
        setSubscribeStatus('success');
        setEmail("");
        setHasConsented(false);
      } else {
        throw new Error('Subscription failed - Non-200 status received');
      }
    } catch (error: any) {
      console.error('Subscription error:', {
        message: error.message,
        name: error.name
      });
      setSubscribeStatus('error');
      setErrorMessage("Failed to subscribe. Please try again later.");
    }
  };

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// No helper functions needed for this component

////////////////////////////////////////////////
// Styles:
////////////////////////////////////////////////
// Styles are handled via Tailwind CSS classes in the JSX

////////////////////////////////////////////////
// JSX:
////////////////////////////////////////////////
  return (
    <div
      id="footer"
      key={"footer"}
      className="flex flex-col items-center p-4 m-4 pt-4 bg-[#3a3f47] min-h-12 rounded-lg shadow-lg text-center text-white"
    >
      {/* Company Information */}
      <p className="text-xs font-semibold">
        NexSellPro - Empowering Walmart Sellers with Data
      </p>
      <p className="text-xs font-light">
        Version: {version || "N/A"}
      </p>

      {/* Links Section */}
      <div className="flex justify-center gap-4 mt-2">
        <a href="mailto:support@nexsellpro.com" className="text-xs underline hover:text-cyan-400">
          Contact Us
        </a>
        <a href="mailto:feedback@nexsellpro.com" className="text-xs underline hover:text-cyan-400">
          Send Feedback
        </a>
        <a 
          href="https://github.com/c3discover/nexsellpro/blob/main/PRIVACY.md" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs underline hover:text-cyan-400"
        >
          Privacy Policy
        </a>
        <a 
          href="https://github.com/c3discover/nexsellpro/blob/main/LICENSE" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs underline hover:text-cyan-400"
        >
          Terms of Service
        </a>
      </div>

      {/* Social Media Icons */}
      <div className="flex justify-center gap-4 mt-4">
        {SOCIAL_LINKS.facebook !== "#" && (
          <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer">
            <FaFacebook className="w-6 h-6 hover:text-blue-500 transition-colors duration-200" />
          </a>
        )}
        {SOCIAL_LINKS.twitter !== "#" && (
          <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer">
            <FaTwitter className="w-6 h-6 hover:text-blue-300 transition-colors duration-200" />
          </a>
        )}
        {SOCIAL_LINKS.linkedin !== "#" && (
          <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="w-6 h-6 hover:text-blue-600 transition-colors duration-200" />
          </a>
        )}
        {SOCIAL_LINKS.instagram !== "#" && (
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">
            <FaInstagram className="w-6 h-6 hover:text-pink-400 transition-colors duration-200" />
          </a>
        )}
      </div>

      {/* Newsletter Subscribe Section */}
      <form onSubmit={handleSubscribe} className="mt-4 flex flex-col items-center">
        <p className="text-xs italic">Subscribe to get the latest updates:</p>
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="p-2 rounded-lg text-black w-64 sm:w-auto"
            disabled={subscribeStatus === 'loading'}
          />
          <button 
            type="submit"
            disabled={subscribeStatus === 'loading'}
            className={`px-4 py-2 rounded-lg text-white transition-colors duration-200 ${
              subscribeStatus === 'success' 
                ? 'bg-green-500 hover:bg-green-600' 
                : subscribeStatus === 'loading'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-600'
            }`}
          >
            {subscribeStatus === 'success' 
              ? 'Subscribed!' 
              : subscribeStatus === 'loading'
              ? 'Subscribing...'
              : 'Subscribe'}
          </button>
        </div>

        {/* Privacy Consent Checkbox */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="privacy-consent"
            checked={hasConsented}
            onChange={(e) => setHasConsented(e.target.checked)}
            className="rounded text-cyan-500 focus:ring-cyan-500"
            disabled={subscribeStatus === 'loading'}
          />
          <label htmlFor="privacy-consent" className="text-xs">
            I agree to receive emails and accept the{' '}
            <a
              href="https://github.com/c3discover/nexsellpro/blob/main/PRIVACY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-cyan-400"
            >
              privacy policy
            </a>
          </label>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <p className="text-red-400 text-xs mt-1">{errorMessage}</p>
        )}
        {subscribeStatus === 'success' && (
          <p className="text-green-400 text-xs mt-1">Thank you for subscribing!</p>
        )}
      </form>

      {/* Copyright Information */}
      <p className="text-xs font-light italic mt-4">
        &copy; {new Date().getFullYear()} C3 Discover LLC. All Rights Reserved.
      </p>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default Footer;

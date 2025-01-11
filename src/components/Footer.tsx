////////////////////////////////////////////////
// Imports
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import { version } from '../../package.json';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import emailjs from '@emailjs/browser';

////////////////////////////////////////////////
// Constants and Variables
////////////////////////////////////////////////
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Add your EmailJS credentials from the dashboard
const EMAILJS_SERVICE_ID = "service_ajk56wf";
const EMAILJS_ADMIN_TEMPLATE_ID = "template_cmbmlwp";
const EMAILJS_SUBSCRIBER_TEMPLATE_ID = "template_vt0464a";
const EMAILJS_PUBLIC_KEY = "6B47NfPQdoQJhSsGX";

////////////////////////////////////////////////
// Props and Types
////////////////////////////////////////////////
interface FooterProps {
  version: string;
}

////////////////////////////////////////////////
// Component
////////////////////////////////////////////////
export const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setSubscribeStatus('idle');
    setErrorMessage("");

    // Validate email
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

    try {
      // Send notification to admin
      const adminResponse = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_ADMIN_TEMPLATE_ID,
        {
          subscriber_email: email,
          subscription_date: new Date().toLocaleDateString(),
          message: `New subscription from ${email}`
        }
      );

      // Send welcome email to subscriber
      const subscriberResponse = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_SUBSCRIBER_TEMPLATE_ID,
        {
          to_email: email,
          from_name: "NexSellPro",
          to_name: email.split('@')[0],
          unsubscribe_link: "https://nexsellpro.com/unsubscribe?email=" + encodeURIComponent(email),
        }
      );

      if (adminResponse.status === 200 && subscriberResponse.status === 200) {
        setSubscribeStatus('success');
        setEmail("");
      } else {
        throw new Error('Subscription failed - Non-200 status received');
      }
    } catch (error: any) {
      console.error('Detailed subscription error:', {
        error: error,
        message: error.message,
        text: error.text,
        name: error.name,
        stack: error.stack
      });
      setSubscribeStatus('error');
      setErrorMessage(error.text || "Failed to subscribe. Please try again later.");
    }
  };

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
        <a href="/about" className="text-xs underline hover:text-cyan-400">
          About Us
        </a>
        <a href="/privacy-policy" className="text-xs underline hover:text-cyan-400">
          Privacy Policy
        </a>
        <a href="/terms" className="text-xs underline hover:text-cyan-400">
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
          />
          <button 
            type="submit"
            className={`px-4 py-2 rounded-lg text-white transition-colors duration-200 ${
              subscribeStatus === 'success' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-cyan-500 hover:bg-cyan-600'
            }`}
          >
            {subscribeStatus === 'success' ? 'Subscribed!' : 'Subscribe'}
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-400 text-xs mt-1">{errorMessage}</p>
        )}
        {subscribeStatus === 'success' && (
          <p className="text-green-400 text-xs mt-1">Thank you for subscribing!</p>
        )}
      </form>

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

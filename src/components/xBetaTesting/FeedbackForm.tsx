/**
 * @fileoverview Beta testing feedback collection form component
 * @author NexSellPro
 * @created 2024-03-07
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Fun messages shown after successful feedback submission
const CONFIRMATION_MESSAGES = [
  "Thanks a million! Your feedback is pure gold! 🏆",
  "You rock! Thanks for making NexSellPro better! 🚀",
  "Woohoo! Your feedback just made our day! 🎉",
  "Awesome input! We're on it like a rocket! 🔥",
  "High five! Your feedback helps us level up! 🙌"
];

// Google Apps Script endpoint for form submission
const FEEDBACK_ENDPOINT = "https://script.google.com/macros/s/AKfycbxsERSeufqWg9um_PFp3pGczkLMMsYXaimhEMXjnqTjF7t7mvkpsQhbtezZHwRCrjQy/exec";

// Auto-close delay after successful submission (in milliseconds)
const AUTO_CLOSE_DELAY = 3000;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
interface FeedbackFormProps {
  isOpen: boolean;              // Controls form visibility
  onClose: () => void;         // Callback to close the form
}

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// Using FeedbackFormProps defined above

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const FeedbackForm: React.FC<FeedbackFormProps> = ({ isOpen, onClose }) => {

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
  // Form input states
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  
  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

////////////////////////////////////////////////
// Chrome API Handlers:
////////////////////////////////////////////////
// No Chrome API handlers needed for this component

////////////////////////////////////////////////
// Event Handlers:
////////////////////////////////////////////////
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate feedback content
    if (!feedback.trim()) {
      setError("Please enter some feedback");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      // Prepare form data for submission
      const formData = new FormData();
      formData.append("feedback", feedback);
      formData.append("email", email);
      formData.append("timestamp", new Date().toISOString());
      formData.append("url", window.location.href);
      
      // Submit to Google Apps Script endpoint
      // Using no-cors mode since Google Apps Script doesn't support CORS
      await fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });
      
      // Handle successful submission
      setIsSubmitted(true);
      setFeedback("");
      setEmail("");
      
      // Auto-close form after delay
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, AUTO_CLOSE_DELAY);
      
    } catch (err) {
      setError("Failed to submit feedback. Please try again.");
      console.error("Error submitting feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
  // Get a random confirmation message
  const getRandomConfirmation = () => {
    const randomIndex = Math.floor(Math.random() * CONFIRMATION_MESSAGES.length);
    return CONFIRMATION_MESSAGES[randomIndex];
  };

////////////////////////////////////////////////
// Styles:
////////////////////////////////////////////////
// Styles are handled via Tailwind CSS classes in the JSX

////////////////////////////////////////////////
// JSX:
////////////////////////////////////////////////
  // Don't render if form is not open
  if (!isOpen) return null;

  return (
    <div className="w-full bg-white text-black p-3 mt-2 shadow-md rounded-b-lg"
      style={{
        fontSize: "12px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        position: "relative",
      }}>
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <IoClose size={20} />
      </button>

      {/* Success State */}
      {isSubmitted ? (
        <div className="flex flex-col items-center justify-center py-4">
          <div className="text-lg font-bold text-green-600 mb-2">
            {getRandomConfirmation()}
          </div>
          <div className="text-sm text-gray-600">
            We appreciate your help improving NexSellPro!
          </div>
        </div>
      ) : (
        // Feedback Form
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Form Header */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-center mb-2">Beta Feedback</h3>
            <p className="text-xs text-gray-600 text-center mb-3">
              Help us improve NexSellPro by sharing your thoughts!
            </p>
          </div>
          
          {/* Feedback Input */}
          <div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What's working well? What could be better?"
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>
          
          {/* Email Input */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email (optional)"
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Error Message */}
          {error && <p className="text-red-500 text-xs">{error}</p>}
          
          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default FeedbackForm; 
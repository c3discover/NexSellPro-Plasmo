/**
 * @fileoverview Custom hook for managing analysis state and UI controls
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// Import React hooks for state management
import { useState, useEffect } from 'react';
// Import helper function for date calculations
import { getDaysAgo } from '../utils/analysisHelpers';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants needed as we're using props and state

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// No additional types needed as we're using basic boolean state

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed for this hook

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// No configuration needed

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// No additional helper functions needed as we're using imported getDaysAgo

////////////////////////////////////////////////
// Hook Definition:
////////////////////////////////////////////////
/**
 * Custom hook for managing analysis panel state and UI controls
 * @param initialIsOpen - Initial state of the analysis panel
 * @returns Object containing state and control functions
 */
export function useAnalysisState(initialIsOpen: boolean) {
  // UI state for panel visibility
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  // UI state for table expansion
  const [isTableExpanded, setIsTableExpanded] = useState(true);
  
  // Update panel state when initialIsOpen changes
  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);
  
  // Toggle functions for UI controls
  const toggleOpen = () => setIsOpen(!isOpen);
  const toggleTable = () => setIsTableExpanded(!isTableExpanded);
  
  // Return state and control functions
  return {
    isOpen,              // Current panel visibility state
    isTableExpanded,     // Current table expansion state
    toggleOpen,          // Function to toggle panel visibility
    toggleTable,         // Function to toggle table expansion
    getDaysAgo          // Helper function for date calculations
  };
} 
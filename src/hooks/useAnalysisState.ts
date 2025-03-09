import { useState, useEffect } from 'react';
import { getDaysAgo } from '../utils/analysisHelpers';

export function useAnalysisState(initialIsOpen: boolean) {
  // UI state
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [isTableExpanded, setIsTableExpanded] = useState(true);
  
  // Update isOpen when initialIsOpen changes
  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);
  
  // Toggle functions
  const toggleOpen = () => setIsOpen(!isOpen);
  const toggleTable = () => setIsTableExpanded(!isTableExpanded);
  
  return {
    isOpen,
    isTableExpanded,
    toggleOpen,
    toggleTable,
    getDaysAgo
  };
} 
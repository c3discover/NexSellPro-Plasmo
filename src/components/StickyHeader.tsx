import React, { ReactNode } from 'react';
import { heights, zIndex } from '~data/utils/uiConfig';

interface StickyHeaderProps {
  /**
   * Content to render in the left section of the header
   */
  leftContent?: ReactNode;
  
  /**
   * Content to render in the center section of the header
   */
  centerContent?: ReactNode;
  
  /**
   * Content to render in the right section of the header
   */
  rightContent?: ReactNode;
  
  /**
   * Optional CSS class name to add to the header
   */
  className?: string;
  
  /**
   * Whether to add a bottom border/shadow to the header
   */
  hasBorder?: boolean;
  
  /**
   * Whether to have the header fade in on scroll
   */
  fadeOnScroll?: boolean;
  
  /**
   * Background color of the header
   */
  bgColor?: string;
}

/**
 * Sticky header component that stays fixed at the top of the viewport
 */
const StickyHeader: React.FC<StickyHeaderProps> = ({
  leftContent,
  centerContent,
  rightContent,
  className = '',
  hasBorder = true,
  fadeOnScroll = false,
  bgColor = 'white'
}) => {
  // For fade on scroll effect
  const [opacity, setOpacity] = React.useState(fadeOnScroll ? 0 : 1);

  // Handle scroll events for fade effect
  React.useEffect(() => {
    if (!fadeOnScroll) return;
    
    const handleScroll = () => {
      // Start fading in after 20px of scroll
      const scrollThreshold = 20;
      const newOpacity = Math.min(window.scrollY / scrollThreshold, 1);
      setOpacity(newOpacity);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fadeOnScroll]);

  // Border/shadow style based on props
  const borderStyle = hasBorder 
    ? 'border-b border-gray-200 shadow-sm' 
    : '';
  
  // Calculate opacity style
  const opacityStyle = fadeOnScroll 
    ? { opacity } 
    : {};
    
  // Combine all styles
  const headerStyle = {
    height: heights.header,
    zIndex: zIndex.sticky,
    backgroundColor: bgColor,
    ...opacityStyle
  };

  return (
    <>
      {/* Add a spacer with the same height as the header */}
      <div style={{ height: heights.header }} />
      
      {/* The actual fixed header */}
      <header 
        className={`fixed top-0 left-0 right-0 flex items-center justify-between px-4 transition-opacity duration-200 ${borderStyle} ${className}`}
        style={headerStyle}
      >
        {/* Left section */}
        <div className="flex items-center">
          {leftContent}
        </div>
        
        {/* Center section */}
        <div className="flex items-center justify-center flex-1">
          {centerContent}
        </div>
        
        {/* Right section */}
        <div className="flex items-center">
          {rightContent}
        </div>
      </header>
    </>
  );
};

export default StickyHeader; 
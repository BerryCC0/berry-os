/**
 * ScrollBar Component
 * Mac OS 8-style scrollbar that automatically applies to all windows
 * Replaces default browser scrollbars with authentic System 7 styling
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './ScrollBar.module.css';

interface ScrollBarProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Show scrollbar arrows (up/down or left/right)
   * Default: true (Mac OS 8 style)
   */
  showArrows?: boolean;
  /**
   * Direction of scroll
   */
  direction?: 'vertical' | 'horizontal' | 'both';
  /**
   * Auto-hide scrollbar when not scrolling
   * Default: false (always visible, Mac OS 8 style)
   */
  autoHide?: boolean;
  /**
   * Space reserved at bottom (e.g., for resize corner)
   * Default: 0
   */
  bottomOffset?: number;
}

export default function ScrollBar({
  children,
  className = '',
  showArrows = true,
  direction = 'vertical',
  autoHide = false,
  bottomOffset = 0,
}: ScrollBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Track previous content height for scroll position preservation
  const prevContentHeightRef = useRef<number>(0);
  
  // Vertical scrollbar state
  const [vThumbHeight, setVThumbHeight] = useState(0);
  const [vThumbTop, setVThumbTop] = useState(0);
  const [vCanScroll, setVCanScroll] = useState(false);
  
  // Horizontal scrollbar state
  const [hThumbWidth, setHThumbWidth] = useState(0);
  const [hThumbLeft, setHThumbLeft] = useState(0);
  const [hCanScroll, setHCanScroll] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(!autoHide);
  
  // Calculate scrollbar thumb size and position
  const updateScrollbar = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = container;
    
    // Batch all state updates together using React 18's automatic batching
    // Calculate vertical scrollbar
    if (direction === 'vertical' || direction === 'both') {
      const canScrollV = scrollHeight > clientHeight;
      
      // Only update if changed to prevent unnecessary re-renders
      setVCanScroll(prev => prev !== canScrollV ? canScrollV : prev);
      
      if (canScrollV) {
        // Calculate thumb height (proportional to visible content)
        const thumbHeight = Math.max(
          (clientHeight / scrollHeight) * clientHeight,
          20 // Minimum thumb height
        );
        setVThumbHeight(prev => Math.abs(prev - thumbHeight) > 0.5 ? thumbHeight : prev);
        
        // Calculate thumb position
        const maxScroll = scrollHeight - clientHeight;
        const scrollPercent = maxScroll > 0 ? scrollTop / maxScroll : 0;
        const trackHeight = clientHeight - (showArrows ? 30 : 0); // Account for arrow buttons
        const maxThumbTop = trackHeight - thumbHeight;
        const newThumbTop = scrollPercent * maxThumbTop + (showArrows ? 15 : 0);
        setVThumbTop(prev => Math.abs(prev - newThumbTop) > 0.5 ? newThumbTop : prev);
      }
    }
    
    // Calculate horizontal scrollbar
    if (direction === 'horizontal' || direction === 'both') {
      const canScrollH = scrollWidth > clientWidth;
      
      // Only update if changed
      setHCanScroll(prev => prev !== canScrollH ? canScrollH : prev);
      
      if (canScrollH) {
        // Calculate thumb width (proportional to visible content)
        const thumbWidth = Math.max(
          (clientWidth / scrollWidth) * clientWidth,
          20 // Minimum thumb width
        );
        setHThumbWidth(prev => Math.abs(prev - thumbWidth) > 0.5 ? thumbWidth : prev);
        
        // Calculate thumb position
        const maxScroll = scrollWidth - clientWidth;
        const scrollPercent = maxScroll > 0 ? scrollLeft / maxScroll : 0;
        const trackWidth = clientWidth - (showArrows ? 30 : 0);
        const maxThumbLeft = trackWidth - thumbWidth;
        const newThumbLeft = scrollPercent * maxThumbLeft + (showArrows ? 15 : 0);
        setHThumbLeft(prev => Math.abs(prev - newThumbLeft) > 0.5 ? newThumbLeft : prev);
      }
    }
  }, [direction, showArrows]);
  
  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      updateScrollbar();
      
      if (autoHide) {
        setIsVisible(true);
        // Hide after 1 second of no scrolling
        const timer = setTimeout(() => setIsVisible(false), 1000);
        return () => clearTimeout(timer);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [autoHide]);
  
  // Update on content/window resize
  useEffect(() => {
    updateScrollbar();
    
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !contentRef.current) return;
      
      const container = containerRef.current;
      const content = contentRef.current;
      const newHeight = content.scrollHeight;
      const prevHeight = prevContentHeightRef.current;
      
      // If content height increased (items added), preserve scroll position
      if (newHeight > prevHeight && prevHeight > 0) {
        const currentScroll = container.scrollTop;
        
        // Only adjust if we're not at the very top (user is scrolled down)
        if (currentScroll > 10) {
          // Maintain the same visual position by keeping scrollTop unchanged
          // The browser will naturally maintain the position, we just need to
          // ensure our updateScrollbar doesn't interfere
          container.scrollTop = currentScroll;
        }
      }
      
      prevContentHeightRef.current = newHeight;
      updateScrollbar();
    });
    
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    
    return () => resizeObserver.disconnect();
  }, [children, direction, showArrows, updateScrollbar]);
  
  // Arrow button handlers
  const scrollBy = (deltaX: number, deltaY: number) => {
    containerRef.current?.scrollBy({ left: deltaX, top: deltaY, behavior: 'smooth' });
  };
  
  // Drag scrollbar thumb
  const handleThumbDrag = (e: React.MouseEvent, orientation: 'vertical' | 'horizontal') => {
    e.preventDefault();
    setIsDragging(true);
    
    const container = containerRef.current;
    if (!container) return;
    
    const startY = e.clientY;
    const startX = e.clientX;
    const startScrollTop = container.scrollTop;
    const startScrollLeft = container.scrollLeft;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (orientation === 'vertical') {
        const deltaY = moveEvent.clientY - startY;
        const { scrollHeight, clientHeight } = container;
        const trackHeight = clientHeight - (showArrows ? 30 : 0);
        const scrollRatio = (scrollHeight - clientHeight) / (trackHeight - vThumbHeight);
        container.scrollTop = startScrollTop + deltaY * scrollRatio;
      } else {
        const deltaX = moveEvent.clientX - startX;
        const { scrollWidth, clientWidth } = container;
        const trackWidth = clientWidth - (showArrows ? 30 : 0);
        const scrollRatio = (scrollWidth - clientWidth) / (trackWidth - hThumbWidth);
        container.scrollLeft = startScrollLeft + deltaX * scrollRatio;
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const showVertical = (direction === 'vertical' || direction === 'both') && vCanScroll;
  const showHorizontal = (direction === 'horizontal' || direction === 'both') && hCanScroll;
  
  return (
    <div className={`${styles.scrollbarContainer} ${className}`}>
      {/* Content area with native scroll */}
      <div
        ref={containerRef}
        className={styles.scrollContent}
        style={{
          paddingRight: showVertical ? '15px' : '0',
          paddingBottom: showHorizontal ? '15px' : '0',
        }}
      >
        <div ref={contentRef}>
          {children}
        </div>
      </div>
      
      {/* Vertical Scrollbar */}
      {showVertical && (
        <div 
          className={`${styles.scrollbar} ${styles.vertical} ${isVisible ? styles.visible : ''}`}
          style={{
            bottom: `${bottomOffset}px`,
            height: bottomOffset ? `calc(100% - ${bottomOffset}px)` : '100%',
          }}
        >
          {showArrows && (
            <button
              className={styles.scrollArrow}
              onClick={() => scrollBy(0, -20)}
              aria-label="Scroll up"
            >
              ▲
            </button>
          )}
          
          <div className={styles.scrollTrack}>
            <div
              className={styles.scrollThumb}
              style={{
                height: `${vThumbHeight}px`,
                top: `${vThumbTop}px`,
              }}
              onMouseDown={(e) => handleThumbDrag(e, 'vertical')}
            />
          </div>
          
          {showArrows && (
            <button
              className={styles.scrollArrow}
              onClick={() => scrollBy(0, 20)}
              aria-label="Scroll down"
            >
              ▼
            </button>
          )}
        </div>
      )}
      
      {/* Horizontal Scrollbar */}
      {showHorizontal && (
        <div className={`${styles.scrollbar} ${styles.horizontal} ${isVisible ? styles.visible : ''}`}>
          {showArrows && (
            <button
              className={styles.scrollArrow}
              onClick={() => scrollBy(-20, 0)}
              aria-label="Scroll left"
            >
              ◀
            </button>
          )}
          
          <div className={styles.scrollTrack}>
            <div
              className={styles.scrollThumb}
              style={{
                width: `${hThumbWidth}px`,
                left: `${hThumbLeft}px`,
              }}
              onMouseDown={(e) => handleThumbDrag(e, 'horizontal')}
            />
          </div>
          
          {showArrows && (
            <button
              className={styles.scrollArrow}
              onClick={() => scrollBy(20, 0)}
              aria-label="Scroll right"
            >
              ▶
            </button>
          )}
        </div>
      )}
    </div>
  );
}


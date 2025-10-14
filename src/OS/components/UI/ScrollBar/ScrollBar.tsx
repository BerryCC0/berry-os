/**
 * ScrollBar Component
 * Mac OS 8-style scrollbar that automatically applies to all windows
 * Replaces default browser scrollbars with authentic System 7 styling
 */

'use client';

import { useEffect, useRef, useState } from 'react';
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
  const updateScrollbar = () => {
    if (!containerRef.current || !contentRef.current) return;
    
    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = container;
    
    // Vertical scrollbar
    if (direction === 'vertical' || direction === 'both') {
      const canScrollV = scrollHeight > clientHeight;
      setVCanScroll(canScrollV);
      
      if (canScrollV) {
        // Calculate thumb height (proportional to visible content)
        const thumbHeight = Math.max(
          (clientHeight / scrollHeight) * clientHeight,
          20 // Minimum thumb height
        );
        setVThumbHeight(thumbHeight);
        
        // Calculate thumb position
        const maxScroll = scrollHeight - clientHeight;
        const scrollPercent = scrollTop / maxScroll;
        const trackHeight = clientHeight - (showArrows ? 30 : 0); // Account for arrow buttons
        const maxThumbTop = trackHeight - thumbHeight;
        setVThumbTop(scrollPercent * maxThumbTop + (showArrows ? 15 : 0));
      }
    }
    
    // Horizontal scrollbar
    if (direction === 'horizontal' || direction === 'both') {
      const canScrollH = scrollWidth > clientWidth;
      setHCanScroll(canScrollH);
      
      if (canScrollH) {
        // Calculate thumb width (proportional to visible content)
        const thumbWidth = Math.max(
          (clientWidth / scrollWidth) * clientWidth,
          20 // Minimum thumb width
        );
        setHThumbWidth(thumbWidth);
        
        // Calculate thumb position
        const maxScroll = scrollWidth - clientWidth;
        const scrollPercent = scrollLeft / maxScroll;
        const trackWidth = clientWidth - (showArrows ? 30 : 0);
        const maxThumbLeft = trackWidth - thumbWidth;
        setHThumbLeft(scrollPercent * maxThumbLeft + (showArrows ? 15 : 0));
      }
    }
  };
  
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
    
    const resizeObserver = new ResizeObserver(updateScrollbar);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    
    return () => resizeObserver.disconnect();
  }, [children, direction, showArrows]);
  
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


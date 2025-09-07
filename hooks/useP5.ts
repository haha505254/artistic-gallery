import React, { useEffect, useRef, MutableRefObject } from 'react';
import p5 from 'p5';

/**
 * Custom hook for integrating p5.js with React
 * Handles lifecycle and cleanup automatically
 */
export function useP5(
  sketch: (p: p5) => void,
  containerRef: MutableRefObject<HTMLDivElement | null>,
  dependencies: React.DependencyList = []
) {
  const p5Instance = useRef<p5 | null>(null);
  const isInitialized = useRef(false);
  
  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return;
    
    // Mark as initialized to prevent double initialization
    isInitialized.current = true;
    
    // Clean up any existing instance
    if (p5Instance.current) {
      const p5WithCleanup = p5Instance.current as p5 & { cleanup?: () => void };
      if (p5WithCleanup.cleanup) {
        p5WithCleanup.cleanup();
      }
      p5Instance.current.remove();
      p5Instance.current = null;
    }
    
    // Small delay to ensure cleanup is complete
    const timeoutId = setTimeout(() => {
      if (containerRef.current) {
        // Create new p5 instance
        p5Instance.current = new p5(sketch, containerRef.current);
        // console.log('[useP5] p5 instance created');
      }
    }, 0);
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      isInitialized.current = false;
      
      if (p5Instance.current) {
        const p5WithCleanup = p5Instance.current as p5 & { cleanup?: () => void };
        if (p5WithCleanup.cleanup) {
          p5WithCleanup.cleanup();
        }
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Only run once on mount
  
  // Return the ref itself, not its current value
  // This allows the caller to access the instance after it's created
  return p5Instance;
}
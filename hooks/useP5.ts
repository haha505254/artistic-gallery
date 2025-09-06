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
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clean up existing instance
    if (p5Instance.current) {
      const p5WithCleanup = p5Instance.current as p5 & { cleanup?: () => void };
      if (p5WithCleanup.cleanup) {
        p5WithCleanup.cleanup();
      }
      p5Instance.current.remove();
    }
    
    // Create new p5 instance
    p5Instance.current = new p5(sketch, containerRef.current);
    
    // Cleanup on unmount
    return () => {
      if (p5Instance.current) {
        const p5WithCleanup = p5Instance.current as p5 & { cleanup?: () => void };
        if (p5WithCleanup.cleanup) {
          p5WithCleanup.cleanup();
        }
        p5Instance.current.remove();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sketch, containerRef, ...dependencies]);
  
  // Return instance for external control
  return p5Instance.current;
}
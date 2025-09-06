import { useEffect, useRef, MutableRefObject } from 'react';
import p5 from 'p5';

/**
 * Custom hook for integrating p5.js with React
 * Handles lifecycle and cleanup automatically
 */
export function useP5(
  sketch: (p: p5) => void,
  containerRef: MutableRefObject<HTMLDivElement | null>,
  dependencies: any[] = []
) {
  const p5Instance = useRef<p5 | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clean up existing instance
    if (p5Instance.current) {
      if ((p5Instance.current as any).cleanup) {
        (p5Instance.current as any).cleanup();
      }
      p5Instance.current.remove();
    }
    
    // Create new p5 instance
    p5Instance.current = new p5(sketch, containerRef.current);
    
    // Cleanup on unmount
    return () => {
      if (p5Instance.current) {
        if ((p5Instance.current as any).cleanup) {
          (p5Instance.current as any).cleanup();
        }
        p5Instance.current.remove();
      }
    };
  }, [sketch, containerRef, ...dependencies]);
  
  // Return instance for external control
  return p5Instance.current;
}
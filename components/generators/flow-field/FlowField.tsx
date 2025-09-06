'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import p5 from 'p5';
import { useP5 } from '@/hooks/useP5';
import { flowFieldSketch, type FlowFieldParams } from './FlowFieldSketch';
import { useFlowFieldStore } from '@/lib/stores/useFlowFieldStore';
import dynamic from 'next/dynamic';

// Dynamically import control panel to reduce initial bundle
const ControlPanel = dynamic(
  () => import('@/components/ui/ControlPanel'),
  { ssr: false }
);

/**
 * Main Flow Field component
 * Renders the p5.js sketch with controls
 */
const FlowField: React.FC = React.memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);
  const params = useFlowFieldStore();
  const paramsRef = useRef(params);
  
  // Update params ref when params change
  paramsRef.current = params;
  
  // Create memoized sketch with current params
  const sketch = useCallback(
    (p: p5) => flowFieldSketch(paramsRef.current)(p),
    [] // Only create once, uses paramsRef to access latest params
  );
  
  // Initialize p5
  p5Ref.current = useP5(sketch, containerRef, []);
  
  // Update params when they change
  useEffect(() => {
    if (p5Ref.current && (p5Ref.current as p5 & { updateParams?: (params: FlowFieldParams) => void }).updateParams) {
      (p5Ref.current as p5 & { updateParams: (params: FlowFieldParams) => void }).updateParams(params);
    }
  }, [params]);
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Canvas container */}
      <div 
        ref={containerRef}
        id="flow-field-container"
        className="absolute inset-0"
      />
      
      {/* Control Panel */}
      <ControlPanel />
      
      {/* Title overlay */}
      <div className="absolute top-8 left-8 pointer-events-none">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Flow Field
        </h1>
        <p className="text-sm mt-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Interactive particle system with Perlin noise
        </p>
      </div>
    </div>
  );
});

FlowField.displayName = 'FlowField';

export default FlowField;
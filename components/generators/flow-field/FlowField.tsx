'use client';

import React, { useRef, useEffect } from 'react';
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
  
  // Create sketch function once
  const sketchRef = useRef<((p: p5) => void) | undefined>(undefined);
  if (!sketchRef.current) {
    sketchRef.current = (p: p5) => {
      // console.log('[FlowField] Storing p5 instance');
      // Store p5 instance for later access
      p5Ref.current = p;
      flowFieldSketch(paramsRef.current)(p);
      // console.log('[FlowField] p5 instance stored, updateParams available?', !!(p as any).updateParams);
    };
  }
  
  // Initialize p5 only once
  const p5InstanceRef = useP5(sketchRef.current, containerRef, []);
  
  // Update p5Ref when instance is created
  useEffect(() => {
    if (p5InstanceRef.current && !p5Ref.current) {
      p5Ref.current = p5InstanceRef.current;
      // console.log('[FlowField] p5Ref updated from useP5');
    }
  });
  
  // Track previous params to avoid unnecessary updates
  const prevParamsRef = useRef<FlowFieldParams | undefined>(undefined);
  
  // Update params when they change
  useEffect(() => {
    // Check if params actually changed
    if (prevParamsRef.current && 
        JSON.stringify(prevParamsRef.current) === JSON.stringify(params)) {
      return; // No actual change, skip update
    }
    
    prevParamsRef.current = params;
    
    // Only update if p5 is ready
    if (p5Ref.current && (p5Ref.current as p5 & { updateParams?: (params: FlowFieldParams) => void }).updateParams) {
      (p5Ref.current as p5 & { updateParams: (params: FlowFieldParams) => void }).updateParams(params);
    } else if (!p5Ref.current) {
      console.warn('[FlowField] p5Ref.current is null when trying to update params');
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
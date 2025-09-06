'use client';

import React, { useState, useCallback, memo } from 'react';
import { useFlowFieldStore } from '@/lib/stores/useFlowFieldStore';
import { ChevronLeft, ChevronRight, RotateCcw, Share2, Download } from 'lucide-react';
import ParameterSlider from './ParameterSlider';

/**
 * Glass Morphism Control Panel
 * Controls for Flow Field parameters
 */
const ControlPanel: React.FC = memo(() => {
  const [isOpen, setIsOpen] = useState(true);
  const { 
    particleCount, 
    noiseScale, 
    speed, 
    fadeRate, 
    mouseForce,
    colorMode,
    renderMode,
    updateParams, 
    resetParams 
  } = useFlowFieldStore();
  
  const handleShare = useCallback(() => {
    // Copy URL with params to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }, []);
  
  const handleDownload = useCallback(() => {
    // Download canvas as image
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `flow-field-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  }, []);
  
  return (
    <div 
      className={`
        fixed right-0 top-1/2 -translate-y-1/2 z-50
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-48px)]'}
      `}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-12 h-24 rounded-l-lg flex items-center justify-center transition-colors"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        aria-label="Toggle controls"
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 text-white" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-white" />
        )}
      </button>
      
      {/* Main panel */}
      <div 
        className="w-80 overflow-y-auto rounded-l-2xl shadow-2xl p-6"
        style={{
          maxHeight: '80vh',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Controls</h2>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              aria-label="Share"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              aria-label="Download"
            >
              <Download className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={resetParams}
              className="p-2 rounded-lg transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              aria-label="Reset"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        
        {/* Parameters */}
        <div className="space-y-4">
          <ParameterSlider
            label="Particles"
            value={particleCount}
            min={100}
            max={10000}
            step={100}
            onChange={(value) => updateParams({ particleCount: value })}
          />
          
          <ParameterSlider
            label="Noise Scale"
            value={noiseScale}
            min={0.001}
            max={0.05}
            step={0.001}
            onChange={(value) => updateParams({ noiseScale: value })}
          />
          
          <ParameterSlider
            label="Speed"
            value={speed}
            min={0.5}
            max={10}
            step={0.1}
            onChange={(value) => updateParams({ speed: value })}
          />
          
          <ParameterSlider
            label="Fade Rate"
            value={fadeRate}
            min={0.8}
            max={1}
            step={0.01}
            onChange={(value) => updateParams({ fadeRate: value })}
          />
          
          <ParameterSlider
            label="Mouse Force"
            value={mouseForce}
            min={-100}
            max={100}
            step={5}
            onChange={(value) => updateParams({ mouseForce: value })}
          />
          
          {/* Dropdown for color mode */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Color Mode
            </label>
            <select
              value={colorMode}
              onChange={(e) => updateParams({ colorMode: e.target.value as 'velocity' | 'position' | 'gradient' })}
              className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <option value="velocity">Velocity</option>
              <option value="position">Position</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>
          
          {/* Dropdown for render mode */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Render Mode
            </label>
            <select
              value={renderMode}
              onChange={(e) => updateParams({ renderMode: e.target.value as 'dots' | 'lines' | 'both' })}
              className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <option value="dots">Dots</option>
              <option value="lines">Lines</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
});

ControlPanel.displayName = 'ControlPanel';

export default ControlPanel;
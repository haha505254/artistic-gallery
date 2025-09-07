import p5 from 'p5';
import { ParticlePool } from './ParticlePool';
import { perlinNoise } from '@/lib/utils/perlinNoise';

// Disable FES for production - improves performance by up to 10x
if (typeof window !== 'undefined') {
  (window as Window & { p5?: typeof p5 }).p5 = p5;
  (p5 as typeof p5 & { disableFriendlyErrors?: boolean }).disableFriendlyErrors = true;
}

export interface FlowFieldParams {
  particleCount: number;
  noiseScale: number;
  speed: number;
  fadeRate: number;
  mouseForce: number;
  colorMode: 'velocity' | 'position' | 'gradient';
  renderMode: 'dots' | 'lines' | 'both';
}

/**
 * Main Flow Field p5.js sketch
 * Optimized for performance with offscreen rendering
 */
export const flowFieldSketch = (initialParams: FlowFieldParams) => (p: p5) => {
  
  // Create a mutable params container that both draw and updateParams can access
  const currentParams = { ...initialParams };
  
  let particlePool: ParticlePool;
  let flowField: p5.Vector[] = [];
  let graphics: p5.Graphics;
  let cols: number;
  let rows: number;
  const scale = 20;
  let zoff = 0;
  // let frameCounter = 0; // Not used currently
  
  // Mouse tracking variables
  const mousePos = { x: 0, y: 0 };
  const lastMousePos = { x: 0, y: 0 };
  let canvasElement: HTMLCanvasElement | null = null;
  let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  let mouseEnterHandler: ((e: MouseEvent) => void) | null = null;
  let mouseLeaveHandler: (() => void) | null = null;
  
  // Performance monitoring
  let fps = 0;
  const frameRates: number[] = [];
  const maxFrameRates = 30;
  
  // Track frame count for optimizations
  let frameCount = 0;
  
  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent('flow-field-container');
    
    // Set pixel density to 1 for consistent performance
    p.pixelDensity(1);
    
    // Get the actual canvas DOM element
    canvasElement = ((canvas as unknown as { canvas: HTMLCanvasElement }).canvas) as HTMLCanvasElement;
    
    // Initialize mouse position
    mousePos.x = p.width / 2;
    mousePos.y = p.height / 2;
    lastMousePos.x = mousePos.x;
    lastMousePos.y = mousePos.y;
    
    // Add native mouse event listeners to the canvas
    if (canvasElement) {
      // Create event handlers and store references for cleanup
      mouseMoveHandler = (e: MouseEvent) => {
        const rect = canvasElement!.getBoundingClientRect();
        const scaleX = canvasElement!.width / rect.width;
        const scaleY = canvasElement!.height / rect.height;
        
        mousePos.x = (e.clientX - rect.left) * scaleX;
        mousePos.y = (e.clientY - rect.top) * scaleY;
        
        // Clamp to canvas bounds
        mousePos.x = Math.max(0, Math.min(mousePos.x, p.width));
        mousePos.y = Math.max(0, Math.min(mousePos.y, p.height));
      };
      
      mouseEnterHandler = mouseMoveHandler; // Use same handler for enter
      
      mouseLeaveHandler = () => {
        // Optionally reset mouse position or keep last position
        // For now, we'll keep the last position
      };
      
      canvasElement.addEventListener('mousemove', mouseMoveHandler);
      canvasElement.addEventListener('mouseenter', mouseEnterHandler);
      canvasElement.addEventListener('mouseleave', mouseLeaveHandler);
      
    }
    
    // Create offscreen graphics buffer for trails
    graphics = p.createGraphics(p.width, p.height);
    graphics.colorMode(p.HSL, 360, 100, 100, 100);
    graphics.background(0, 0, 5);
    
    // Initialize flow field grid
    cols = Math.floor(p.width / scale) + 1;
    rows = Math.floor(p.height / scale) + 1;
    flowField = new Array(cols * rows);
    
    // Initialize particle pool
    particlePool = new ParticlePool(p, 10000);
    particlePool.setActiveCount(currentParams.particleCount);
    
    // Set color mode
    p.colorMode(p.HSL, 360, 100, 100, 100);
  };
  
  p.draw = () => {
    frameCount++;
    
    // Update last mouse position (current position is updated by native event listeners)
    lastMousePos.x = mousePos.x;
    lastMousePos.y = mousePos.y;
    
    
    
    // Update FPS
    updateFPS();
    
    // Update flow field only every 10 frames for better performance
    if (frameCount % 10 === 0) {
      updateFlowField();
    }
    
    // Fade background for trail effect
    graphics.fill(0, 0, 5, currentParams.fadeRate * 10);
    graphics.noStroke();
    graphics.rect(0, 0, p.width, p.height);
    
    // Update and draw particles
    particlePool.update(
      flowField,
      cols,
      scale,
      mousePos.x,
      mousePos.y,
      200, // Mouse radius - increased for testing
      currentParams.mouseForce,
      currentParams.speed,  // Pass speed directly, not multiplied
      currentParams.colorMode
    );
    
    // Draw particles to graphics buffer
    particlePool.draw(graphics, currentParams.renderMode);
    
    // Draw graphics buffer to main canvas
    p.image(graphics, 0, 0);
    
    // Draw UI overlay (less frequently for performance)
    if (frameCount % 30 === 0) {
      drawOverlay();
    }
    
  };
  
  /**
   * Update flow field vectors based on Perlin noise
   */
  function updateFlowField() {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;
        
        // Get flow angle from Perlin noise
        // Pass grid coordinates directly, let getFlowAngle handle scaling
        const angle = perlinNoise.getFlowAngle(
          x,
          y,
          currentParams.noiseScale,
          zoff
        );
        
        // Create vector from angle
        const v = p5.Vector.fromAngle(angle);
        v.setMag(1);
        flowField[index] = v;
      }
    }
    
    zoff += 0.003; // Animate flow field
  }
  
  /**
   * Update FPS counter
   */
  function updateFPS() {
    const currentFPS = p.frameRate();
    frameRates.push(currentFPS);
    
    if (frameRates.length > maxFrameRates) {
      frameRates.shift();
    }
    
    fps = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
  }
  
  /**
   * Draw UI overlay
   */
  function drawOverlay() {
    // FPS counter
    p.push();
    p.noStroke();
    p.fill(0, 0, 100, 80);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(12);
    p.text(`FPS: ${Math.round(fps)}`, 10, 10);
    p.text(`Particles: ${particlePool.getCount()}`, 10, 30);
    p.pop();
  }
  
  /**
   * Handle window resize
   */
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    
    // Re-attach event listeners to the new canvas if needed
    // (p5 might create a new canvas element on resize)
    const canvas = document.querySelector('#flow-field-container canvas') as HTMLCanvasElement;
    if (canvas && canvas !== canvasElement) {
      // Remove old listeners
      if (canvasElement && mouseMoveHandler && mouseEnterHandler && mouseLeaveHandler) {
        canvasElement.removeEventListener('mousemove', mouseMoveHandler);
        canvasElement.removeEventListener('mouseenter', mouseEnterHandler);
        canvasElement.removeEventListener('mouseleave', mouseLeaveHandler);
      }
      
      // Update canvas reference and re-attach listeners
      canvasElement = canvas;
      if (mouseMoveHandler && mouseEnterHandler && mouseLeaveHandler) {
        canvasElement.addEventListener('mousemove', mouseMoveHandler);
        canvasElement.addEventListener('mouseenter', mouseEnterHandler);
        canvasElement.addEventListener('mouseleave', mouseLeaveHandler);
      }
    }
    
    // Recreate graphics buffer
    graphics = p.createGraphics(p.width, p.height);
    graphics.colorMode(p.HSL, 360, 100, 100, 100);
    graphics.background(0, 0, 5);
    
    // Recalculate grid
    cols = Math.floor(p.width / scale) + 1;
    rows = Math.floor(p.height / scale) + 1;
    flowField = new Array(cols * rows);
    
    // Reset particles
    particlePool.resetAll();
  };
  
  // Mouse events are now handled by native event listeners in setup
  // No need for p.mouseMoved or p.mouseDragged
  
  /**
   * Update parameters dynamically
   */
  (p as p5 & { updateParams?: (newParams: Partial<FlowFieldParams>) => void }).updateParams = (newParams: Partial<FlowFieldParams>) => {
      Object.assign(currentParams, newParams);
    
    // Update particle count if changed
    if (newParams.particleCount !== undefined) {
      particlePool.setActiveCount(newParams.particleCount);
    }
  };
  
  /**
   * Clean up resources
   */
  (p as p5 & { cleanup?: () => void }).cleanup = () => {
    // Remove event listeners
    if (canvasElement) {
      if (mouseMoveHandler) {
        canvasElement.removeEventListener('mousemove', mouseMoveHandler);
      }
      if (mouseEnterHandler) {
        canvasElement.removeEventListener('mouseenter', mouseEnterHandler);
      }
      if (mouseLeaveHandler) {
        canvasElement.removeEventListener('mouseleave', mouseLeaveHandler);
      }
    }
    
    // Clean up graphics
    if (graphics) {
      graphics.remove();
    }
  };
  
};
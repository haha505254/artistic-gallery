import p5 from 'p5';
import { ParticlePool } from './ParticlePool';
import { perlinNoise } from '@/lib/utils/perlinNoise';

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
export const flowFieldSketch = (params: FlowFieldParams) => (p: p5) => {
  let particlePool: ParticlePool;
  let flowField: p5.Vector[] = [];
  let graphics: p5.Graphics;
  let cols: number;
  let rows: number;
  const scale = 20;
  let zoff = 0;
  // let frameCounter = 0; // Not used currently
  
  // Performance monitoring
  let fps = 0;
  const frameRates: number[] = [];
  const maxFrameRates = 30;
  
  // Disable FES for performance
  (p as p5 & { disableFriendlyErrors?: boolean }).disableFriendlyErrors = true;
  
  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent('flow-field-container');
    
    // Set pixel density to 1 for consistent performance
    p.pixelDensity(1);
    
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
    particlePool.setActiveCount(params.particleCount);
    
    // Set color mode
    p.colorMode(p.HSL, 360, 100, 100, 100);
  };
  
  p.draw = () => {
    // Update FPS
    updateFPS();
    
    // Update flow field
    updateFlowField();
    
    // Fade background for trail effect
    graphics.fill(0, 0, 5, params.fadeRate * 10);
    graphics.noStroke();
    graphics.rect(0, 0, p.width, p.height);
    
    // Update and draw particles
    particlePool.update(
      flowField,
      cols,
      scale,
      p.mouseX,
      p.mouseY,
      100, // Mouse radius
      params.mouseForce,
      params.speed * 0.1
    );
    
    // Draw particles to graphics buffer
    particlePool.draw(graphics, params.renderMode);
    
    // Draw graphics buffer to main canvas
    p.image(graphics, 0, 0);
    
    // Draw UI overlay
    drawOverlay();
    
    // frameCounter++;
  };
  
  /**
   * Update flow field vectors based on Perlin noise
   */
  function updateFlowField() {
    let yoff = 0;
    
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;
        
        // Get flow angle from Perlin noise
        const angle = perlinNoise.getFlowAngle(
          xoff,
          yoff,
          params.noiseScale,
          zoff
        );
        
        // Create vector from angle
        const v = p5.Vector.fromAngle(angle);
        v.setMag(1);
        flowField[index] = v;
        
        xoff += params.noiseScale;
      }
      yoff += params.noiseScale;
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
  
  /**
   * Update parameters dynamically
   */
  (p as p5 & { updateParams?: (newParams: Partial<FlowFieldParams>) => void }).updateParams = (newParams: Partial<FlowFieldParams>) => {
    Object.assign(params, newParams);
    
    // Update particle count if changed
    if (newParams.particleCount !== undefined) {
      particlePool.setActiveCount(newParams.particleCount);
    }
  };
  
  /**
   * Clean up resources
   */
  (p as p5 & { cleanup?: () => void }).cleanup = () => {
    if (graphics) {
      graphics.remove();
    }
  };
};
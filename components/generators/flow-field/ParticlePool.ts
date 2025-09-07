import p5 from 'p5';
import { Particle } from './Particle';

/**
 * Object Pool for efficient particle management
 * Reduces garbage collection and improves performance
 */
export class ParticlePool {
  private particles: Particle[] = [];
  private activeCount: number = 0;
  private maxParticles: number;
  private p: p5;
  
  constructor(p: p5, maxParticles: number = 10000) {
    this.p = p;
    this.maxParticles = maxParticles;
    this.initialize();
  }
  
  /**
   * Pre-allocate all particles
   */
  private initialize() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(new Particle(this.p));
    }
    this.activeCount = this.maxParticles;
  }
  
  /**
   * Get active particles count
   */
  getActiveCount(): number {
    return this.activeCount;
  }
  
  /**
   * Get particle at index (for direct iteration)
   */
  getParticle(index: number): Particle | null {
    if (index < this.activeCount) {
      return this.particles[index];
    }
    return null;
  }
  
  /**
   * Set number of active particles
   */
  setActiveCount(count: number) {
    this.activeCount = Math.min(count, this.maxParticles);
    
    // Reset new particles if activating more
    for (let i = 0; i < this.activeCount; i++) {
      if (this.particles[i].isDead()) {
        this.particles[i].reset(this.p);
      }
    }
  }
  
  /**
   * Update all active particles
   */
  update(
    flowField: p5.Vector[],
    cols: number,
    scale: number,
    mouseX: number,
    mouseY: number,
    mouseRadius: number,
    mouseStrength: number,
    deltaTime: number = 1,
    colorMode: 'velocity' | 'position' | 'gradient' = 'velocity'
  ) {
    // Pre-calculate mouse force parameters if needed
    const radiusSq = mouseRadius * mouseRadius;
    const hasMouseForce = mouseStrength !== 0;
    
    // Update all particles
    for (let i = 0; i < this.activeCount; i++) {
      const particle = this.particles[i];
      
      // Apply flow field
      particle.follow(flowField, cols, scale);
      
      // Apply mouse force with early exit optimization
      if (hasMouseForce) {
        // Quick distance check using squared distance
        const dx = particle.pos.x - mouseX;
        const dy = particle.pos.y - mouseY;
        const distSq = dx * dx + dy * dy;
        
        // Only apply force if within radius
        if (distSq < radiusSq) {
          particle.applyMouseForce(this.p, mouseX, mouseY, mouseRadius, mouseStrength);
        }
      }
      
      // Update physics with color mode (deltaTime is speed value)
      particle.update(this.p, deltaTime * 0.1, colorMode);
      
      // Handle edges
      particle.edges(this.p);
      
      // Respawn dead particles if needed
      if (particle.isDead()) {
        particle.reset(this.p);
      }
    }
  }
  
  /**
   * Draw all particles (simple optimized rendering)
   */
  draw(graphics: p5.Graphics, mode: 'dots' | 'lines' | 'both' = 'lines') {
    graphics.push();
    
    if (mode === 'dots' || mode === 'both') {
      // Render dots with simple color caching
      graphics.noStroke();
      let lastColorKey = '';
      
      for (let i = 0; i < this.activeCount; i++) {
        const particle = this.particles[i];
        const alpha = particle.life * 255;
        
        // Only update fill when color changes significantly
        const colorKey = `${Math.floor(particle.color.h / 5)}-${Math.floor(particle.color.s / 10)}-${Math.floor(particle.color.l / 10)}-${Math.floor(alpha / 20)}`;
        if (colorKey !== lastColorKey) {
          graphics.fill(
            particle.color.h,
            particle.color.s,
            particle.color.l,
            alpha
          );
          lastColorKey = colorKey;
        }
        
        graphics.circle(particle.pos.x, particle.pos.y, 2);
      }
    }
    
    if (mode === 'lines' || mode === 'both') {
      // Render lines with simple color caching
      graphics.noFill();
      graphics.strokeWeight(1);
      let lastColorKey = '';
      
      for (let i = 0; i < this.activeCount; i++) {
        const particle = this.particles[i];
        const alpha = particle.life * 100; // More transparent for lines
        
        // Only update stroke when color changes significantly
        const colorKey = `${Math.floor(particle.color.h / 5)}-${Math.floor(particle.color.s / 10)}-${Math.floor(particle.color.l / 10)}-${Math.floor(alpha / 10)}`;
        if (colorKey !== lastColorKey) {
          graphics.stroke(
            particle.color.h,
            particle.color.s,
            particle.color.l,
            alpha
          );
          lastColorKey = colorKey;
        }
        
        graphics.line(
          particle.prevPos.x,
          particle.prevPos.y,
          particle.pos.x,
          particle.pos.y
        );
      }
    }
    
    graphics.pop();
  }
  
  /**
   * Get particle count
   */
  getCount(): number {
    return this.activeCount;
  }
  
  /**
   * Reset all particles
   */
  resetAll() {
    for (let i = 0; i < this.activeCount; i++) {
      this.particles[i].reset(this.p);
    }
  }
}
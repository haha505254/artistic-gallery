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
   * Get active particles
   */
  getActiveParticles(): Particle[] {
    return this.particles.slice(0, this.activeCount);
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
    deltaTime: number = 1
  ) {
    for (let i = 0; i < this.activeCount; i++) {
      const particle = this.particles[i];
      
      // Apply flow field
      particle.follow(flowField, cols, scale);
      
      // Apply mouse force
      if (mouseStrength !== 0) {
        particle.applyMouseForce(this.p, mouseX, mouseY, mouseRadius, mouseStrength);
      }
      
      // Update physics
      particle.update(this.p, deltaTime);
      
      // Handle edges
      particle.edges(this.p);
      
      // Respawn dead particles
      if (particle.isDead()) {
        particle.reset(this.p);
      }
    }
  }
  
  /**
   * Draw all particles (optimized batch rendering)
   */
  draw(graphics: p5.Graphics, mode: 'dots' | 'lines' | 'both' = 'lines') {
    graphics.push();
    
    if (mode === 'dots' || mode === 'both') {
      // Batch render dots
      graphics.noStroke();
      for (let i = 0; i < this.activeCount; i++) {
        const particle = this.particles[i];
        const alpha = particle.life * 255;
        
        graphics.fill(
          particle.color.h,
          particle.color.s,
          particle.color.l,
          alpha
        );
        
        graphics.circle(particle.pos.x, particle.pos.y, 2);
      }
    }
    
    if (mode === 'lines' || mode === 'both') {
      // Batch render lines
      graphics.noFill();
      for (let i = 0; i < this.activeCount; i++) {
        const particle = this.particles[i];
        const alpha = particle.life * 100; // More transparent for lines
        
        graphics.stroke(
          particle.color.h,
          particle.color.s,
          particle.color.l,
          alpha
        );
        graphics.strokeWeight(1);
        
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
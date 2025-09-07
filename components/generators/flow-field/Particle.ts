import p5 from 'p5';

/**
 * Optimized Particle class for Flow Field
 * Uses p5.Vector for efficient vector operations
 */
export class Particle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  prevPos: p5.Vector;
  maxSpeed: number;
  color: { h: number; s: number; l: number };
  life: number;
  private tempMouse: p5.Vector;  // Reusable vector for mouse calculations
  private tempForce: p5.Vector;  // Reusable vector for force calculations
  private framesSinceColorUpdate: number = 0;  // Track frames since last color update
  
  constructor(p: p5, x?: number, y?: number) {
    // Initialize position
    if (x !== undefined && y !== undefined) {
      this.pos = p.createVector(x, y);
    } else {
      this.pos = p.createVector(
        p.random(p.width),
        p.random(p.height)
      );
    }
    
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
    this.prevPos = this.pos.copy();
    this.maxSpeed = 8;  // Increased for more responsive mouse interaction
    this.life = 1;
    
    // Initialize reusable vectors
    this.tempMouse = p.createVector(0, 0);
    this.tempForce = p.createVector(0, 0);
    
    // Initialize color based on position
    this.color = {
      h: (this.pos.x / p.width) * 360,
      s: 70,
      l: 50
    };
  }
  
  /**
   * Apply force to particle (F = ma)
   */
  applyForce(force: p5.Vector) {
    this.acc.add(force);
  }
  
  /**
   * Follow the flow field
   */
  follow(flowField: p5.Vector[], cols: number, scale: number) {
    const x = Math.floor(this.pos.x / scale);
    const y = Math.floor(this.pos.y / scale);
    const index = x + y * cols;
    
    if (flowField[index]) {
      const force = flowField[index].copy();
      force.mult(0.05); // Further reduced to make mouse force more dominant
      this.applyForce(force);
    }
  }
  
  /**
   * Update particle physics
   */
  update(p: p5, deltaTime: number = 1, colorMode: 'velocity' | 'position' | 'gradient' = 'velocity') {
    // Add acceleration to velocity
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    
    // Store previous position for trail effect
    this.prevPos = this.pos.copy();
    
    // Update position
    const deltaVel = this.vel.copy();
    deltaVel.mult(deltaTime);
    this.pos.add(deltaVel);
    
    // Reset acceleration AFTER using it (ready for next frame's forces)
    this.acc.set(0, 0);
    
    // Update color only every 3 frames to improve performance
    this.framesSinceColorUpdate++;
    if (this.framesSinceColorUpdate >= 3) {
      this.framesSinceColorUpdate = 0;
      
      switch (colorMode) {
        case 'velocity':
          // Color based on speed (original implementation)
          const speed = this.vel.mag();
          this.color.h = (this.color.h + speed * 2) % 360;
          this.color.l = p.map(speed, 0, this.maxSpeed, 30, 70);
          this.color.s = 70;
          break;
          
        case 'position':
          // Color based on position
          this.color.h = p.map(this.pos.x, 0, p.width, 0, 360);
          this.color.s = p.map(this.pos.y, 0, p.height, 50, 100);
          this.color.l = 60;
          break;
          
        case 'gradient':
          // Gradient from purple to cyan based on diagonal position
          const diagonal = (this.pos.x / p.width + this.pos.y / p.height) / 2;
          this.color.h = p.map(diagonal, 0, 1, 270, 180); // Purple to cyan
          this.color.s = 80;
          this.color.l = p.map(Math.sin(diagonal * Math.PI * 2), -1, 1, 40, 60);
          break;
      }
    }
    
    // Fade life very slowly for visual effect only
    // Removed aggressive fade to prevent particles from disappearing
    // this.life *= 0.995;  // This was causing particles to disappear after ~15 seconds
  }
  
  /**
   * Apply mouse interaction force (optimized)
   */
  applyMouseForce(p: p5, mouseX: number, mouseY: number, radius: number, strength: number) {
    // Calculate distance components
    const dx = this.pos.x - mouseX;
    const dy = this.pos.y - mouseY;
    const distSq = dx * dx + dy * dy;
    const radiusSq = radius * radius;
    
    // Use squared distance to avoid sqrt
    if (distSq < radiusSq && distSq > 0.01) {
      // Only calculate actual distance when needed
      const distance = Math.sqrt(distSq);
      const invDistance = 1 / distance; // Pre-calculate inverse
      
      // Calculate force direction using pre-computed inverse
      this.tempForce.set(dx * invDistance, dy * invDistance);
      
      // Linear decay for stronger, more visible effect
      const normalizedDistance = distance / radius; // 0 to 1
      const mag = strength * (1 - normalizedDistance) * 0.5;
      this.tempForce.mult(mag);
      
      // Apply the force
      this.acc.add(this.tempForce);
    }
  }
  
  /**
   * Handle edge wrapping
   */
  edges(p: p5) {
    if (this.pos.x > p.width) {
      this.pos.x = 0;
      this.prevPos.x = 0;
    } else if (this.pos.x < 0) {
      this.pos.x = p.width;
      this.prevPos.x = p.width;
    }
    
    if (this.pos.y > p.height) {
      this.pos.y = 0;
      this.prevPos.y = 0;
    } else if (this.pos.y < 0) {
      this.pos.y = p.height;
      this.prevPos.y = p.height;
    }
  }
  
  /**
   * Reset particle to new position
   */
  reset(p: p5, x?: number, y?: number) {
    if (x !== undefined && y !== undefined) {
      this.pos.set(x, y);
    } else {
      this.pos.set(p.random(p.width), p.random(p.height));
    }
    
    this.vel.mult(0);
    this.acc.mult(0);
    this.prevPos = this.pos.copy();
    this.life = 1;
    
    // Reset color
    this.color.h = (this.pos.x / p.width) * 360;
  }
  
  /**
   * Check if particle needs respawn
   */
  isDead(): boolean {
    return this.life <= 0;
  }
}
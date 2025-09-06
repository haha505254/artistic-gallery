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
    this.maxSpeed = 4;
    this.life = 1;
    
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
      force.mult(0.1); // Reduce force strength
      this.applyForce(force);
    }
  }
  
  /**
   * Update particle physics
   */
  update(p: p5, deltaTime: number = 1) {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    
    // Store previous position for trail effect
    this.prevPos = this.pos.copy();
    
    // Update position
    const deltaVel = this.vel.copy();
    deltaVel.mult(deltaTime);
    this.pos.add(deltaVel);
    
    // Reset acceleration
    this.acc.mult(0);
    
    // Update color based on velocity
    const speed = this.vel.mag();
    this.color.h = (this.color.h + speed * 2) % 360;
    this.color.l = p.map(speed, 0, this.maxSpeed, 30, 70);
    
    // Fade life slightly
    this.life *= 0.995;
  }
  
  /**
   * Apply mouse interaction force
   */
  applyMouseForce(p: p5, mouseX: number, mouseY: number, radius: number, strength: number) {
    const mouse = p.createVector(mouseX, mouseY);
    const distance = p5.Vector.dist(this.pos, mouse);
    
    if (distance < radius && distance > 0) {
      const force = p5.Vector.sub(this.pos, mouse);
      force.normalize();
      
      // Inverse square law for realistic force
      const mag = (strength * radius) / (distance * distance);
      force.mult(mag);
      
      this.applyForce(force);
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
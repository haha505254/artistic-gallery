/**
 * Optimized Perlin Noise implementation for Flow Field
 * Based on p5.js noise() function principles
 */

export class PerlinNoise {
  private perm: Uint8Array;
  private gradP: Array<{x: number, y: number, z: number}>;
  
  constructor(seed: number = Math.random() * 255) {
    this.perm = new Uint8Array(512);
    this.gradP = new Array(512);
    this.setSeed(seed);
  }

  setSeed(seed: number) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    
    // Shuffle with seed
    let n = seed;
    for (let i = 255; i > 0; i--) {
      n = (n * 1664525 + 1013904223) % 256;
      const j = n % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    
    // Duplicate permutation array
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.gradP[i] = this.grad3[this.perm[i] % 12];
    }
  }
  
  private grad3 = [
    {x:1,y:1,z:0}, {x:-1,y:1,z:0}, {x:1,y:-1,z:0}, {x:-1,y:-1,z:0},
    {x:1,y:0,z:1}, {x:-1,y:0,z:1}, {x:1,y:0,z:-1}, {x:-1,y:0,z:-1},
    {x:0,y:1,z:1}, {x:0,y:-1,z:1}, {x:0,y:1,z:-1}, {x:0,y:-1,z:-1}
  ];
  
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }
  
  noise2D(x: number, y: number): number {
    // Find unit grid cell
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    // Get relative position in cell
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    // Compute fade curves
    const u = this.fade(x);
    const v = this.fade(y);
    
    // Hash coordinates
    const n00 = this.gradP[X + this.perm[Y]];
    const n01 = this.gradP[X + this.perm[Y + 1]];
    const n10 = this.gradP[X + 1 + this.perm[Y]];
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]];
    
    // Compute dot products
    const dot00 = n00.x * x + n00.y * y;
    const dot01 = n01.x * x + n01.y * (y - 1);
    const dot10 = n10.x * (x - 1) + n10.y * y;
    const dot11 = n11.x * (x - 1) + n11.y * (y - 1);
    
    // Interpolate
    const nx0 = this.lerp(dot00, dot10, u);
    const nx1 = this.lerp(dot01, dot11, u);
    const nxy = this.lerp(nx0, nx1, v);
    
    // Return value in [0, 1] range like p5.js
    return (nxy + 1) * 0.5;
  }
  
  // Get flow field angle from noise (optimized for performance)
  getFlowAngle(x: number, y: number, scale: number = 0.01, time: number = 0): number {
    const noiseValue = this.noise2D(x * scale + time, y * scale);
    return noiseValue * Math.PI * 4; // Full rotation range
  }
}

// Singleton instance for performance
export const perlinNoise = new PerlinNoise();
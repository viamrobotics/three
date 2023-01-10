import { Quaternion } from 'three';

export class R4AA {
  th: number;
  x: number;
  y: number;
  z: number;

  constructor (th = 0, x = 0, y = 0, z = 0) {
    this.th = th;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  toQuat (): Quaternion {
    const sinA = Math.sin(this.th / 2);
    // Ensure that point xyz is on the unit sphere
    this.normalize();

    // Get the unit-sphere components
    const x = this.x * sinA;
    const y = this.y * sinA;
    const z = this.z * sinA;
    const w = Math.cos(this.th / 2);

    return new Quaternion(x, y, z, w);
  }

  normalize () {
    const norm = Math.sqrt((this.x ** 2) + (this.y ** 2) + (this.z ** 2));

    // prevent division by 0
    if (norm === 0) {
      throw new Error('cannot normalize R4AA, divide by zero');
    }

    this.x /= norm;
    this.y /= norm;
    this.z /= norm;
  }
}

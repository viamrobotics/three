import { describe, it } from 'vitest';
import { ViamObject3D } from '../src/object-3d';
import { expect } from 'vitest';

describe('ViamObject3D', () => {
  const object3D = new ViamObject3D();

  it('Updates the rotation when when an orientation vector is modified', () => {
    object3D.orientationVector.th = Math.PI;
    expect(object3D.rotation.z).toBeCloseTo(Math.PI);
    expect(object3D.orientationVector.th).toBeCloseTo(Math.PI);
  });

  it('Updates the orientation vector when rotation is modified', () => {
    object3D.rotation.z = Math.PI;
    expect(object3D.orientationVector.th).toBeCloseTo(Math.PI);
    expect(object3D.rotation.z).toBeCloseTo(Math.PI);
  });
});

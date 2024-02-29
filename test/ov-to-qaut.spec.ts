import { expect, describe, it } from 'vitest';
import { Quaternion } from 'three';
import { OrientationVector } from '../src/main';
import { EPSILON } from '../src/constants';

const isAppxEqual = (q1: Quaternion, q2: Quaternion) => {
  return (
    Math.abs(q1.x) - Math.abs(q2.x) < EPSILON &&
    Math.abs(q1.y) - Math.abs(q2.y) < EPSILON &&
    Math.abs(q1.z) - Math.abs(q2.z) < EPSILON &&
    Math.abs(q1.w) - Math.abs(q2.w) < EPSILON
  );
};

describe('OrientationVector', () => {
  const ov = new OrientationVector();
  const expectedQuat = new Quaternion();
  const actualQuat = new Quaternion();

  it('converts an orientation vector to a quaternion', () => {
    ov.set(0, -1, 0, 1.570_796_326_794_896_6);
    expectedQuat.set(0.707_106_781_186_547_6, 0, 0, 0.707_106_781_186_547_6);
    expect(isAppxEqual(expectedQuat, ov.toQuaternion(actualQuat))).toBe(true);

    ov.set(0, 1, 0, -1.570_796_326_794_896_6);
    expectedQuat.set(-0.707_106_781_186_547_6, 0, 0, 0.707_106_781_186_547_6);
    expect(isAppxEqual(expectedQuat, ov.toQuaternion(actualQuat))).toBe(true);

    ov.set(-0.5376, 0, 0.8432, -1 * Math.PI);
    expectedQuat.set(0, -0.28, 0, 0.96);
    expect(isAppxEqual(expectedQuat, ov.toQuaternion(actualQuat))).toBe(true);

    ov.set(0, 0, 1, -0.567_588_218_416_655_7);
    expectedQuat.set(0, 0, -0.28, 0.96);
    expect(isAppxEqual(expectedQuat, ov.toQuaternion(actualQuat))).toBe(true);

    ov.set(0, 0.5376, 0.8432, -1.570_796_326_794_896_6);
    expectedQuat.set(-0.28, 0, 0, 0.96);
    expect(isAppxEqual(expectedQuat, ov.toQuaternion(actualQuat))).toBe(true);

    ov.set(0, -0.5376, 0.8432, 1.570_796_326_794_896_6);
    expectedQuat.set(0.28, 0, 0, 0.96);
    expect(isAppxEqual(expectedQuat, ov.toQuaternion(actualQuat))).toBe(true);

    ov.set(0, 1, 0, -1 * Math.PI);
    expectedQuat.set(-0.5, -0.5, -0.5, 0.5);
    expect(isAppxEqual(expectedQuat, ov.toQuaternion(actualQuat))).toBe(true);

    ov.set(
      0.504_843_794_294_005_4,
      0.588_984_426_676_339_7,
      0.631_054_742_867_507,
      0.02
    );
    expectedQuat.set(
      -0.175_559_660_254_131_42,
      0.391_983_971_939_798_17,
      0.385_537_548_516_400_1,
      0.816_632_212_270_443
    );
    expect(isAppxEqual(expectedQuat, ov.toQuaternion(actualQuat))).toBe(true);
  });
});

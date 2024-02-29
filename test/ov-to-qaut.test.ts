import { expect, test } from 'vitest';
import { Quaternion } from 'three';
import { OrientationVector } from '../src/main';
import { EPSILON } from '../src/constants';

const ov = new OrientationVector();
const expectedQuat = new Quaternion();
const convertedQuat = new Quaternion();

const areQuaternionsApproxEqual = (q1: Quaternion, q2: Quaternion) => {
  return (
    Math.abs(q1.x) - Math.abs(q2.x) < EPSILON &&
    Math.abs(q1.y) - Math.abs(q2.y) < EPSILON &&
    Math.abs(q1.z) - Math.abs(q2.z) < EPSILON &&
    Math.abs(q1.w) - Math.abs(q2.w) < EPSILON
  );
};

const assertApproxEqual = (
  ovx: number,
  ovy: number,
  ovz: number,
  ovth: number,
  qw: number,
  qx: number,
  qy: number,
  qz: number
) => {
  ov.set(ovx, ovy, ovz, ovth);
  expectedQuat.set(qx, qy, qz, qw);
  ov.toQuaternion(convertedQuat);

  expect(areQuaternionsApproxEqual(convertedQuat, expectedQuat)).toBeTruthy();
};

test('orientation vector to quaternion works', () => {
  assertApproxEqual(
    0,
    -1,
    0,
    1.570_796_326_794_896_6,
    0.707_106_781_186_547_6,
    0.707_106_781_186_547_6,
    0,
    0
  );

  assertApproxEqual(
    0,
    1,
    0,
    -1.570_796_326_794_896_6,
    0.707_106_781_186_547_6,
    -0.707_106_781_186_547_6,
    0,
    0
  );

  assertApproxEqual(-0.5376, 0, 0.8432, -1 * Math.PI, 0.96, 0, -0.28, 0);

  assertApproxEqual(0, 0, 1, -0.567_588_218_416_655_7, 0.96, 0, 0, -0.28);

  assertApproxEqual(
    0,
    0.5376,
    0.8432,
    -1.570_796_326_794_896_6,
    0.96,
    -0.28,
    0,
    0
  );

  assertApproxEqual(
    0,
    -0.5376,
    0.8432,
    1.570_796_326_794_896_6,
    0.96,
    0.28,
    0,
    0
  );

  assertApproxEqual(0, 1, 0, -1 * Math.PI, 0.5, -0.5, -0.5, -0.5);

  assertApproxEqual(
    0.504_843_794_294_005_4,
    0.588_984_426_676_339_7,
    0.631_054_742_867_507,
    0.02,
    0.816_632_212_270_443,
    -0.175_559_660_254_131_42,
    0.391_983_971_939_798_17,
    0.385_537_548_516_400_1
  );
});

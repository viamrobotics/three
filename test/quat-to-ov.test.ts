import { expect, test } from 'vitest';
import * as THREE from 'three';
import { OrientationVector } from '../src/main';
import { EPSILON } from '../src/constants';

const quat = new THREE.Quaternion();
const expectedOv = new OrientationVector();
const convertedOv = new OrientationVector();
const vecA = new THREE.Vector3();
const vecB = new THREE.Vector3();

const areOvsApproxEqual = (ov1: OrientationVector, ov2: OrientationVector) => {
  const vecDiff = vecA
    .set(ov1.x, ov1.y, ov1.z)
    .sub(vecB.set(ov2.x, ov2.y, ov2.z));

  return (
    Math.abs(vecDiff.lengthSq()) < EPSILON &&
    Math.abs(ov1.th) - Math.abs(ov2.th) < EPSILON
  );
};

const assertApproxEqual = (
  qw: number,
  qx: number,
  qy: number,
  qz: number,
  ovx: number,
  ovy: number,
  ovz: number,
  ovth: number
) => {
  quat.set(qx, qy, qz, qw);
  expectedOv.set(ovx, ovy, ovz, ovth);
  convertedOv.setFromQuaternion(quat);

  expect(areOvsApproxEqual(convertedOv, expectedOv)).toBeTruthy();
};

test('quaternion to orientation vector works', () => {
  assertApproxEqual(
    0.707_106_781_186_547_6,
    0.707_106_781_186_547_6,
    0,
    0,
    0,
    -1,
    0,
    1.570_796_326_794_896_6
  );

  assertApproxEqual(
    0.707_106_781_186_547_6,
    -0.707_106_781_186_547_6,
    0,
    0,
    0,
    1,
    0,
    -1.570_796_326_794_896_6
  );

  assertApproxEqual(0.96, 0, -0.28, 0, -0.5376, 0, 0.8432, -1 * Math.PI);

  assertApproxEqual(0.96, 0, 0, -0.28, 0, 0, 1, -0.567_588_218_416_655_7);

  assertApproxEqual(
    0.96,
    -0.28,
    0,
    0,
    0,
    0.5376,
    0.8432,
    -1.570_796_326_794_896_6
  );

  assertApproxEqual(
    0.96,
    0.28,
    0,
    0,
    0,
    -0.5376,
    0.8432,
    1.570_796_326_794_896_6
  );

  assertApproxEqual(0.5, -0.5, -0.5, -0.5, 0, 1, 0, -1 * Math.PI);

  assertApproxEqual(
    0.816_632_212_270_443,
    -0.175_559_660_254_131_42,
    0.391_983_971_939_798_17,
    0.385_537_548_516_400_1,
    0.504_843_794_294_005_4,
    0.588_984_426_676_339_7,
    0.631_054_742_867_507,
    0.02
  );
});

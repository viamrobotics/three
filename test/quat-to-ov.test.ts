import { expect, test } from 'vitest'
import * as THREE from 'three'
import { OrientationVector } from '../src/main'
import { EPSILON } from '../src/constants'

const quat = new THREE.Quaternion()
const expectedOv = new OrientationVector()
const convertedOv = new OrientationVector()

const isOvApproxEqual = (ov1: OrientationVector, ov2: OrientationVector) => {
  return (
    Math.abs(ov1.x) - Math.abs(ov2.x) < EPSILON &&
    Math.abs(ov1.y) - Math.abs(ov2.y) < EPSILON &&
    Math.abs(ov1.z) - Math.abs(ov2.z) < EPSILON &&
    Math.abs(ov1.th) - Math.abs(ov2.th) < EPSILON
  )
}

const assertApproxEqual = (
  qw: number, qx: number, qy: number, qz: number,
  ovx: number, ovy: number, ovz: number, ovth: number
) => {
  quat.set(qx, qy, qz, qw)
  expectedOv.set(ovx, ovy, ovz, ovth)
  convertedOv.setFromQuaternion(quat)

  expect(isOvApproxEqual(convertedOv, expectedOv)).toBeTruthy()
}

test('quaternion to orientation vector works', () => {
  assertApproxEqual(
    0.7071067811865476, 0.7071067811865476, 0.0, 0.0,
    0.0, -1.0, 0.0, 1.5707963267948966
  )

  assertApproxEqual(
    0.7071067811865476, -0.7071067811865476, 0.0, 0.0,
    0.0, 1.0, 0.0, -1.5707963267948966
  )

  assertApproxEqual(
    0.96, 0.0, -0.28, 0.0,
    -0.5376, 0.0, 0.8432, -1.0 * Math.PI
  )

  assertApproxEqual(
    0.96, 0.0, 0.0, -0.28,
    0.0, 0.0, 1.0, -0.5675882184166557,
  )

  assertApproxEqual(
    0.96, -0.28, 0.0, 0.0,
    0.0, 0.5376, 0.8432, -1.5707963267948966
  )

  assertApproxEqual(
    0.96, 0.28, 0.0, 0.0,
    0.0, -0.5376, 0.8432, 1.5707963267948966
  )

  assertApproxEqual(
    0.5, -0.5, -0.5, -0.5,
    0.0, 1.0, 0.0, -1.0 * Math.PI
  )

  assertApproxEqual(
    0.816632212270443, -0.17555966025413142, 0.39198397193979817, 0.3855375485164001,
    0.5048437942940054, 0.5889844266763397, 0.631054742867507, 0.02
  )
})

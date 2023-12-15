import { expect, test } from 'vitest'
import { Quaternion } from 'three'
import { OrientationVector } from '../src/main'
import { EPSILON } from '../src/constants'

const ov = new OrientationVector()
const expectedQuat = new Quaternion()
const convertedQuat = new Quaternion()

const areQuaternionsApproxEqual = (q1: Quaternion, q2: Quaternion) => {
  return (
    Math.abs(q1.x) - Math.abs(q2.x) < EPSILON &&
    Math.abs(q1.y) - Math.abs(q2.y) < EPSILON &&
    Math.abs(q1.z) - Math.abs(q2.z) < EPSILON &&
    Math.abs(q1.w) - Math.abs(q2.w) < EPSILON
  )
}

const assertApproxEqual = (
  ovx: number, ovy: number, ovz: number, ovth: number,
  qw: number, qx: number, qy: number, qz: number, 
) => {
  ov.set(ovx, ovy, ovz, ovth)
  expectedQuat.set(qx, qy, qz, qw)
  ov.toQuaternion(convertedQuat)

  expect(areQuaternionsApproxEqual(convertedQuat, expectedQuat)).toBeTruthy()
}

test('orientation vector to quaternion works', () => {
  assertApproxEqual(
    0.0, -1.0, 0.0, 1.5707963267948966,
    0.7071067811865476, 0.7071067811865476, 0.0, 0.0
  )

  assertApproxEqual(
    0.0, 1.0, 0.0, -1.5707963267948966,
    0.7071067811865476, -0.7071067811865476, 0.0, 0.0
  )

  assertApproxEqual(
    -0.5376, 0.0, 0.8432, -1.0 * Math.PI,
    0.96, 0.0, -0.28, 0.0
  )

  assertApproxEqual(
    0.0, 0.0, 1.0, -0.5675882184166557,
    0.96, 0.0, 0.0, -0.28
  )

  assertApproxEqual(
    0.0, 0.5376, 0.8432, -1.5707963267948966,
    0.96, -0.28, 0.0, 0.0
  )

  assertApproxEqual(
    0.0, -0.5376, 0.8432, 1.5707963267948966,
    0.96, 0.28, 0.0, 0.0
  )

  assertApproxEqual(
    0.0, 1.0, 0.0, -1.0 * Math.PI,
    0.5, -0.5, -0.5, -0.5
  )

  assertApproxEqual(
    0.5048437942940054, 0.5889844266763397, 0.631054742867507, 0.02,
    0.816632212270443, -0.17555966025413142, 0.39198397193979817, 0.3855375485164001
  )
})

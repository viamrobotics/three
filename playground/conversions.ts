import * as THREE from 'three'
import { Units, InputTypes } from './types'
import { rotations } from './rotations'
import { OrientationVector } from '../src/main'

const v3 = new THREE.Vector3()
const quat = new THREE.Quaternion()
const euler = new THREE.Euler()
const m4 = new THREE.Matrix4()
const ov = new OrientationVector()

const toRad = (x: number, unit: Units): number => {
  if (unit === Units.degrees) {
    return x / 180 * Math.PI
  } else {
    return x
  }
}

const toAngle = (x: number, unit: Units): number => {
  if (unit === Units.degrees) {
    return x * 180 / Math.PI
  } else {
    return x
  }
}

const toReal = (x: number): number => {
	if (!Number.isNaN(x) && Number.isFinite(x)) {
		return Number.parseFloat(x.toFixed(7))
	} else {
		return x
	}
}

const toFixedWidth = (x: number): number => {
	if (!Number.isNaN(x) && Number.isFinite(x)) {
		let s = x.toFixed(7)
    if (x >= 0) s = ' ' + s
    return Number.parseFloat(s)
  } else {
		return x
	}
}

export const conversion = (type: InputTypes, units: Units) => {
  if (type === 'ov') {
    ov.set(
      rotations.ov.x,
      rotations.ov.y,
      rotations.ov.z,
      toRad(rotations.ov.w, units)
    )

    quat.copy(ov.toQuaternion(quat))

  } else if (type === 'matrix') {
    const { row1, row2, row3 } = rotations.matrix

    m4.set(
      row1.x, row1.y, row1.z, 1,
      row2.x, row2.y, row2.z, 1,
      row3.x, row3.y, row3.z, 1,
      0, 0, 0, 1
    )

    quat.setFromRotationMatrix(m4)

  } else if (type === 'quaternion') {
    quat.set(
      rotations.quaternion.x,
      rotations.quaternion.y,
      rotations.quaternion.z,
      rotations.quaternion.w
    )

  } else if (type === 'axis angle') {
    const aa = rotations.axisAngle
    const axis = v3
    axis.set(aa.xyz.x,  aa.xyz.y, aa.xyz.z)
    axis.normalize()

    quat.setFromAxisAngle(axis, toRad(aa.angle, units))

  } else if (type === 'axis with angle magnitude') {
    const aa = rotations.axisAngleMagnitude
    const axis = v3
    axis.set(aa.x,  aa.y, aa.z)
  
    const angle = toRad(axis.length(), units)
    axis.normalize()

    quat.setFromAxisAngle(axis, angle)

  } else if (type === 'euler') {
    const eu = rotations.euler

    quat.setFromEuler(euler.set(
      toRad(eu.xyz.x, units),
      toRad(eu.xyz.y, units),
      toRad(eu.xyz.z, units),
      eu.order as THREE.EulerOrder
    ))

  }

  quat.normalize()

  rotations.quaternion.x = toReal(quat.x)
  rotations.quaternion.y = toReal(quat.y)
  rotations.quaternion.z = toReal(quat.z)
  rotations.quaternion.w = toReal(quat.w)

  ov.setFromQuaternion(quat)
  rotations.ov.w = toAngle(ov.th, units)
  rotations.ov.x = ov.x
  rotations.ov.y = ov.y
  rotations.ov.z = ov.z

  m4.makeRotationFromQuaternion(quat)

  {
    const r = m4.elements
    rotations.matrix.row1.x = toFixedWidth(r[0])
    rotations.matrix.row1.y = toFixedWidth(r[4])
    rotations.matrix.row1.z = toFixedWidth(r[8])
    rotations.matrix.row2.x = toFixedWidth(r[1])
    rotations.matrix.row2.y = toFixedWidth(r[5])
    rotations.matrix.row2.z = toFixedWidth(r[9])
    rotations.matrix.row3.x = toFixedWidth(r[2])
    rotations.matrix.row3.y = toFixedWidth(r[6])
    rotations.matrix.row3.z = toFixedWidth(r[10])
  }

  const axis = [0, 0, 0]
  const angle = 2 * Math.acos(quat.w)

  if (1 - (quat.w * quat.w) < 0.000001) {
    axis[0] = quat.x
    axis[1] = quat.y
    axis[2] = quat.z
  } else {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/
    const s = Math.sqrt(1 - (quat.w * quat.w))
    axis[0] = quat.x / s
    axis[1] = quat.y / s
    axis[2] = quat.z / s
  }

  rotations.axisAngle.xyz.x = toReal(axis[0])
  rotations.axisAngle.xyz.y = toReal(axis[1])
  rotations.axisAngle.xyz.z = toReal(axis[2])
  rotations.axisAngle.angle = toReal(toAngle(angle, units))

  rotations.axisAngleMagnitude.x = toReal(toAngle(axis[0] * angle, units))
  rotations.axisAngleMagnitude.y = toReal(toAngle(axis[1] * angle, units))
  rotations.axisAngleMagnitude.z = toReal(toAngle(axis[2] * angle, units))
  
  {
    euler.setFromRotationMatrix(m4, rotations.euler.order as THREE.EulerOrder)
    const [x, y, z] = euler.toArray() as [number, number, number]
    rotations.euler.xyz.x = toReal(toAngle(x, units))
    rotations.euler.xyz.y = toReal(toAngle(y, units))
    rotations.euler.xyz.z = toReal(toAngle(z, units))
  }
}

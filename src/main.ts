import { Euler, Quaternion, Vector3 } from 'three'
import { R4AA } from './r4aa'

const angleEpsilon = 0.0001

const xAxis = new Quaternion(-1, 0, 0, 0)
const zAxis = new Quaternion(0, 0, +1, 0)
const quatA = new Quaternion()
const quatB = new Quaternion()
const quatC = new Quaternion()
const quatD = new Quaternion()
const quatE = new Quaternion()

const vecA = new Vector3()
const vecB = new Vector3()
const vecC = new Vector3()
const vecD = new Vector3()

const r4aa = new R4AA()

const defaultAngleEpsilon = 0.000_01

const anglesToQuat = (dest: Quaternion, angle1: number, angle2: number, angle3: number): Quaternion => {
  const y = [0, 0, 0]
  const x = [0, 0, 0]

  y[0] = Math.sin(angle1 / 2)
  x[0] = Math.cos(angle1 / 2)

  y[1] = Math.sin(angle2 / 2)
  x[1] = Math.cos(angle2 / 2)

  y[2] = Math.sin(angle3 / 2)
  x[2] = Math.cos(angle3 / 2)

  return dest.set(
    (x[0] * y[1] * y[2]) - (y[0] * y[1] * x[2]),
    (x[0] * y[1] * x[2]) + (y[0] * y[1] * y[2]),
    (y[0] * x[1] * x[2]) + (x[0] * x[1] * y[2]),
    (x[0] * x[1] * x[2]) - (y[0] * x[1] * y[2])
  )
}

// See: https://github.com/viamrobotics/rdk/blob/main/spatialmath/orientationVector.go
/**
 * Viam’s orientation vector is a method for describing the orientation of an object in 3D space.
 * It is part of a Pose which also includes the position in 3D space.
 * 
 * The vector extends from the center of the object to another point in the reference frame. This defines the direction something is pointing in.
 */
export class OrientationVector {
  readonly isOrientationVector = true

  /**
   * Describes the angular position around the vector.
   */
  th: number

  /**
   * The vector's x component.
   */
  x: number

  /**
   * The vector's y component.
   */
  y: number

  /**
   * The vector's z component.
   */
  z: number

  constructor (th = 0, x = 0, y = 0, z = 0) {
    this.th = th
    this.x = x
    this.y = y
    this.z = z
  }

  length (): number {
    return Math.sqrt((this.x ** 2) + (this.y ** 2) + (this.z ** 2))
  }

  normalize (): this {
    const length = this.length()

    this.x /= length
    this.y /= length
    this.z /= length

    return this
  }

  set (th = 0, x = 0, y = 0, z = 0): this {
    this.th = th
    this.x = x
    this.y = y
    this.z = z

    return this
  }

  copy (ov: OrientationVector): this {
    this.th = ov.th
    this.x = ov.x
    this.y = ov.y
    this.z = ov.z

    return this
  }

  setFromQuaternion (quaternion: Quaternion): this {
    quatA.copy(quaternion)
    quatB.copy(quaternion)

    // Get the transform of our +X and +Z points
    quatC.copy(quatA)
    quatC.copy(quatB)
    const newX = quatA.multiplyQuaternions(quatA.multiply(xAxis), quatC.conjugate())
    const newZ = quatB.multiplyQuaternions(quatB.multiply(zAxis), quatD.conjugate())
    this.x = newZ.x
    this.y = newZ.y
    this.z = newZ.z

    /*
     * The contents of ov.newX.Kmag are not in radians but we can use angleEpsilon anyway to check how close we are to
     * the pole because it's a convenient small number
     */
    if (1 - Math.abs(newZ.z) > defaultAngleEpsilon) {
      const v1 = vecA.set(newZ.x, newZ.y, newZ.z)
      const v2 = vecB.set(newX.x, newX.y, newX.z)

      // Get the vector normal to the local-x, local-z, origin plane
      const norm1 = v1.cross(v2)

      // Get the vector normal to the global-z, local-z, origin plane
      const norm2 = v1.cross(vecC.set(zAxis.x, zAxis.y, zAxis.z))

      // For theta, find the angle between the planes defined by local-x, global-z, origin and local-x, local-z, origin
      let cosTheta = norm1.dot(norm2) / (norm1.length() * norm2.length())

      // Account for floating point error
      if (cosTheta > 1) {
        cosTheta = 1
      }

      if (cosTheta < -1) {
        cosTheta = -1
      }

      const theta = Math.acos(cosTheta)

      if (theta > defaultAngleEpsilon) {

        /*
         * Acos will always produce a positive number, we need to determine directionality of the angle
         * We rotate newZ by -theta around the newX axis and see if we wind up coplanar with local-x, global-z, origin
         * If so theta is negative, otherwise positive
         * An R4AA is a convenient way to rotate a point by an amount around an arbitrary axis
         */
        const aa = r4aa.set(-theta, this.x, this.y, this.z)
        const q2 = aa.toQuat(quatE)
        const testZ = q2.multiplyQuaternions(q2.multiply(zAxis), q2.conjugate())
        const norm3 = v1.cross(vecD.set(testZ.x, testZ.y, testZ.z))
        const cosTest = norm1.dot(norm3) / (norm1.length() * norm3.length())
        this.th = 1 - cosTest < defaultAngleEpsilon * defaultAngleEpsilon ? -theta : theta
      } else {
        this.th = 0
      }
    } else {

      /*
       * Special case for when we point directly along the Z axis
       * Get the vector normal to the local-x, global-z, origin plane
       */
      this.th = -Math.atan2(newX.y, -newX.x)
      if (newZ.z < 0) {
        this.th = -Math.atan2(newX.y, newX.x)
      }
    }

    return this
  }

  toQuaternion (dest: Quaternion): Quaternion {
    this.normalize()

    // acos(rz) ranges from 0 (north pole) to pi (south pole)
    const lat = Math.acos(this.z)

    /*
     * If we're pointing at the Z axis then lon is 0, theta is the OV theta
     * Euler angles are gimbal locked here but OV allows us to have smooth(er) movement
     * Since euler angles are used to represent a single orientation, but not to move between different ones, this is OK
     */
    let lon = 0
    const theta = this.th

    if (1 - Math.abs(this.z) > angleEpsilon) {

      /*
       * If we are not at a pole, we need the longitude
       * atan x/y removes some sign information so we use atan2 to do it properly
       */
      lon = Math.atan2(this.y, this.x)
    }

    return anglesToQuat(dest, lon, lat, theta)
  }

  toEuler (dest: Euler) {
    return dest.setFromQuaternion(this.toQuaternion(quatA))
  }
}

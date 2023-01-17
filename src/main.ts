import { Euler, Quaternion, Vector3, MathUtils } from 'three'

const EPSILON = 0.0001

const xAxis = new Quaternion(-1, 0, 0, 0)
const zAxis = new Quaternion(0, 0, +1, 0)
const quatA = new Quaternion()
const quatB = new Quaternion()
const quatC = new Quaternion()
const quatE = new Quaternion()
const quatF = new Quaternion()

const vecA = new Vector3()
const vecB = new Vector3()
const vecC = new Vector3()
const vecD = new Vector3()
const vecE = new Vector3()

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

  /**
   * Describes the rotation around the vector.
   */
  th: number

  constructor (x = 0, y = 0, z = 0, th = 0) {
    vecA.set(x, y, z).normalize()
  
    this.x = vecA.x
    this.y = vecA.y
    this.z = vecA.z
    this.th = th
  }

  set (x = 0, y = 0, z = 0, th = 0): this {
    vecA.set(x, y, z).normalize()
  
    this.x = x
    this.y = y
    this.z = z
    this.th = th

    return this
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

  copy (ov: OrientationVector): this {
    this.x = ov.x
    this.y = ov.y
    this.z = ov.z
    this.th = ov.th

    return this
  }

  // setFromQuaternion (quaternion: Quaternion): this {
  //   const conj = quatB.copy(quaternion).conjugate()
  //   const newX = quatA.copy(quaternion).multiply(xAxis).multiply(conj)
  //   const newZ = quatC.copy(quaternion).multiply(zAxis).multiply(conj)
  //   const oVector = vecA.set(newZ.x, newZ.y, newZ.z).normalize()

  //   let theta = 0

  //   if (1 - Math.abs(newZ.z) > EPSILON) {
  //     const newZimag = vecB.set(newZ.x, newZ.y, newZ.z)
  //     const newXimag = vecC.set(newX.x, newX.y, newX.z)
  //     const zImagAxis = vecD.set(0, 0, 1) // Vector3::z_axis() ????

  //     let normal1 = newZimag.cross(newXimag)
  //     let normal2 = newZimag.cross(zImagAxis)
  //     let cosThetaCand = normal1.dot(normal2) / (normal1.norm() * normal2.norm())
  //     let cosTheta = MathUtils.clamp(cosThetaCand, -1, 1)

  //     match cosTheta.acos() {
  //       val if val > ANGLE_ACCEPTANCE => {
  //         let new_z_imag_unit = UnitVector3::new_normalize(new_z_imag);
  //         let rot_quat_unit = UnitQuaternion::from_axis_angle(&new_z_imag_unit, -1.0 * val);
  //         let rot_quat = rot_quat_unit.quaternion();
  //         let z_axis_quat = Quaternion::new(0.0, 0.0, 0.0, 1.0);
  //         let test_z = (rot_quat * z_axis_quat) * rot_quat.conjugate();
  //         let test_z_imag = test_z.imag();

  //         let normal_3 = new_z_imag.cross(&test_z_imag);
  //         let cos_test = normal_1.dot(&normal_3) / (normal_3.norm() * normal_1.norm());
  //         match cos_test {
  //           val2 if (1.0 - val2) < (ANGLE_ACCEPTANCE * ANGLE_ACCEPTANCE) => -1.0 * val,
  //           _ => val
  //         }
  //       },
  //       _ => 0.0
  //     }
  //   } else {
  //     match new_z.k {
  //         val if val < 0.0 => -1.0 * new_x.j.atan2(new_x.i),
  //         _ => -1.0 * new_x.j.atan2(new_x.i * -1.0)
  //     }
  //   }

  //   Self { o_vector, theta }

  //   return this
  // }

  setFromQuaternion (quaternion: Quaternion): this {
    // Get the transform of our +X and +Z points
    const conj = quatC.copy(quaternion).conjugate()
    const newX = quatA.copy(quaternion).multiply(xAxis).multiply(conj)
    const newZ = quatB.copy(quaternion).multiply(zAxis).multiply(conj)
    const oVector = vecE.set(newZ.x, newZ.y, newZ.z).normalize()

    /*
     * The contents of ov.newX.Kmag are not in radians but we can use angleEpsilon anyway to check how close we are to
     * the pole because it's a convenient small number
     */
    if (1 - Math.abs(newZ.z) > EPSILON) {
      const newZimag = vecA.set(newZ.x, newZ.y, newZ.z)
      const newXimag = vecB.set(newX.x, newX.y, newX.z)
      const zImagAxis = vecC.set(zAxis.x, zAxis.y, zAxis.z)

      // Get the vector normal to the local-x, local-z, origin plane
      const normal1 = newZimag.cross(newXimag)

      // Get the vector normal to the global-z, local-z, origin plane
      const normal2 = newZimag.cross(zImagAxis)

      // For theta, find the angle between the planes defined by local-x, global-z, origin and local-x, local-z, origin
      const cosThetaCand = normal1.dot(normal2) / (normal1.length() * normal2.length())
      const cosTheta = MathUtils.clamp(cosThetaCand, -1, 1)
      const theta = Math.acos(cosTheta)

      if (theta > EPSILON) {
        console.log('derp1')
        const newZImagUnit = vecD.copy(newXimag).normalize()
        const rotQuatUnit = quatE.setFromAxisAngle(newZImagUnit, -1.0 * theta)
        const conj = quatF.copy(rotQuatUnit).conjugate()
        const testZ = rotQuatUnit.multiplyQuaternions(rotQuatUnit.multiply(zAxis), conj)
        const normal3 = newZimag.cross(vecD.set(testZ.x, testZ.y, testZ.z))
        const cosTest = normal1.dot(normal2) / (normal3.length() * normal3.length())
        this.th = 1 - cosTest < EPSILON * EPSILON ? -theta : theta
      } else {
        console.log('derp2')
        this.th = 0
      }

    /*
     * Special case for when we point directly along the Z axis
     * Get the vector normal to the local-x, global-z, origin plane
     */
    } else if (newZ.z < 0) {
      this.th = -Math.atan2(newX.y, newX.x)
    } else {
      this.th = -Math.atan2(newX.y, -newX.x)
    }

    this.x = oVector.x
    this.y = oVector.y
    this.z = oVector.z

    return this
  }

  toQuaternion (dest: Quaternion): Quaternion {
    this.normalize()

    const lat = Math.acos(this.z)
    const lon = 1 - Math.abs(this.z) > EPSILON ? Math.atan2(this.y, this.x) : 0

    const s0 = Math.sin(lon / 2)
    const c0 = Math.cos(lon / 2)
    const s1 = Math.sin(lat / 2)
    const c1 = Math.cos(lat / 2)
    const s2 = Math.sin(this.th / 2)
    const c2 = Math.cos(this.th / 2)

    return dest.set(
      (c0 * s1 * s2) - (s0 * s1 * c2),
      (c0 * s1 * c2) + (s0 * s1 * s2),
      (s0 * c1 * c2) + (c0 * c1 * s2),
      (c0 * c1 * c2) - (s0 * c1 * s2),
    )
  }

  toEuler (dest: Euler) {
    return dest.setFromQuaternion(this.toQuaternion(quatA))
  }
}

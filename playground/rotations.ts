export const rotations = {
  ov: { w: 0, x: 0, y: 0, z: 0 },
  quaternion: { x: 0, y: 0, z: 0, w: 1 },
  euler: {
    xyz: { x: 0, y: 0, z: 0 },
    order: 'XYZ'
  },
  matrix: {
    row1: { x: 1, y: 0, z: 0 },
    row2: { x: 0, y: 1, z: 0 },
    row3: { x: 0, y: 0, z: 1 },
  },
  axisAngle: {
    xyz: { x: 0, y: 0, z: 0 },
    angle: 0
  },
  axisAngleMagnitude: { x: 0, y: 0, z: 0 }
}

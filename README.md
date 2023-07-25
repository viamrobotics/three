# @viamrobotics/three
Viam-related utilities for THREE.js

### Orientation Vector
A class for Viam's [Orientation Vector](https://docs.viam.com/internals/orientation-vector/#edit-on-github) rotation type.

This class closely resembles other rotation formats like `THREE.Quaternion` or `THREE.Euler`.

```ts
import * as THREE from 'three'
import { OrientationVector } from '@viamrobotics/three'

const ov = new OrientationVector()
const quat = new THREE.Quaternion()
const euler = new THREE.Euler()

// Common conversions:
ov.toQuaternion(quat)
ov.toEuler(euler)

ov.setFromQuaternion(quat)
```

### ViamObject3D
Extends THREE.Object3D and adds an `.orientationVector` that auto-updates when other rotation formats are updated.

```ts
import { ViamObject3D } from '@viamrobotics/three'
```
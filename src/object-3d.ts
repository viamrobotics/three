/* eslint-disable no-underscore-dangle */

import { Object3D } from 'three';
import { OrientationVector } from './orientation-vector';

const noop = () => {
  /* do nothing */
};

/**
 * Nearly identical to THREE.Object3D, but with an attached orientation vector that auto-updates.
 */
export class ViamObject3D extends Object3D {
  isViamObject3D = true;

  orientationVector: OrientationVector;

  constructor() {
    super();

    const ov = new OrientationVector();
    const ovChangeCallback = () => ov.setFromQuaternion(this.quaternion, false);
    const eulerOldChangeCallback = this.rotation._onChangeCallback;
    const quatOldChangeCallback = this.quaternion._onChangeCallback;

    const quatChangeCallback = () => {
      quatOldChangeCallback();
      ovChangeCallback();
    };

    const eulerChangeCallback = () => {
      eulerOldChangeCallback();
      ovChangeCallback();
    };

    ov._onChange(() => {
      this.quaternion._onChangeCallback = noop;
      this.rotation._onChangeCallback = noop;

      ov.toQuaternion(this.quaternion);
      ov.toEuler(this.rotation);

      this.quaternion._onChangeCallback = quatChangeCallback;
      this.rotation._onChangeCallback = eulerChangeCallback;
    });

    this.quaternion._onChange(quatChangeCallback);
    this.rotation._onChange(eulerChangeCallback);

    this.orientationVector = ov;
  }
}

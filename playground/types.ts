export const enum Units {
  radians,
  degrees,
}

export type InputTypes =
  | 'ov'
  | 'quaternion'
  | 'euler'
  | 'matrix'
  | 'axis angle'
  | 'axis with angle magnitude';

export type Opts = THREE.EulerOrder;

export const orderOptions = ['XYZ', 'YXZ', 'ZXY', 'ZYX', 'YZX', 'XZY'].map(
  (opt) => ({ text: opt.toLowerCase(), value: opt })
);

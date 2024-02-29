import './main.css';
import * as THREE from 'three';
import { useTrzy } from 'trzy';
import { Pane, type InputBindingApi } from 'tweakpane';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import * as RotationPlugin from '@0b5vr/tweakpane-plugin-rotation';
import { conversion } from './conversions';
import { type InputTypes, Units, orderOptions } from './types';
import { rotations } from './rotations';
import { OrientationVector } from '../src/orientation-vector';

const { scene, camera, renderer } = useTrzy();

document.body.append(renderer.domElement);

const loader = new GLTFLoader();

const world = new THREE.Object3D();
// Viam's coordinate system.
world.rotateY(-Math.PI / 2);
world.rotateX(-Math.PI / 2);

scene.add(world);

const gridHelper = new THREE.GridHelper(0.75, 5);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
world.add(axesHelper);

const gltf = await loader.loadAsync('teapot.glb');
const object = gltf.scene;

object.children[0].rotateY(-Math.PI / 2);
object.children[0].rotateX(Math.PI / 2);

const helper = new THREE.ArrowHelper(undefined, undefined, 0.25);
object.add(helper);

scene.add(new THREE.AmbientLight());
scene.add(new THREE.DirectionalLight());

camera.current.position.set(1.5, 1.5, -1.5);
camera.current.lookAt(0, 0, 0);

world.add(object);

const pane = new Pane();
pane.registerPlugin(EssentialsPlugin);
pane.registerPlugin(RotationPlugin);

const inputs: any[] = [];

const options = {
  units: Units.radians,
};

let paused = false;

const update = (key: InputTypes, event) => {
  if (paused) {
    return;
  }

  conversion(key, options.units);

  {
    const q = rotations.quaternion;
    object.quaternion.set(q.x, q.y, q.z, q.w);
  }

  paused = true;

  for (const input of inputs) {
    if (input === event.target) continue;
    input.refresh();
  }

  paused = false;
};

pane.addBinding(object, 'position');
pane.addBlade({ view: 'separator' });

pane
  .addBinding(options, 'units', {
    view: 'radiogrid',
    groupName: 'units',
    size: [2, 1],
    cells: (x: number) => ({
      title: x === 0 ? 'radians' : 'degrees',
      value: x,
    }),

    label: 'units',
  })
  .on('change', (e) => update('quaternion', e));

pane.addBlade({ view: 'separator' });
inputs.push(
  pane
    .addBinding(rotations, 'ov', {
      label: 'orientation vector (th / xyz)',
    })
    .on('change', (e) => update('ov', e))
);
pane.addBlade({ view: 'separator' });
inputs.push(
  pane
    .addBinding(rotations, 'quaternion', { label: 'quaternion (xyz / w)' })
    .on('change', (e) => update('quaternion', e))
);
pane.addBlade({ view: 'separator' });
inputs.push(
  pane
    .addBinding(rotations.euler, 'xyz', { label: 'euler' })
    .on('change', (e) => update('euler', e))
);
inputs.push(
  pane
    .addBinding(rotations.euler, 'order', {
      label: '',
      options: orderOptions,
    })
    .on('change', (e) => update('euler', e))
);
pane.addBlade({ view: 'separator' });
inputs.push(
  pane
    .addBinding(rotations.matrix, 'row1', { label: 'matrix' })
    .on('change', (e) => update('matrix', e))
);
inputs.push(
  pane
    .addBinding(rotations.matrix, 'row2', { label: '' })
    .on('change', (e) => update('matrix', e))
);
inputs.push(
  pane
    .addBinding(rotations.matrix, 'row3', { label: '' })
    .on('change', (e) => update('matrix', e))
);
pane.addBlade({ view: 'separator' });
inputs.push(
  pane
    .addBinding(rotations.axisAngle, 'xyz', { label: 'axis angle' })
    .on('change', (e) => update('axis angle', e))
);
inputs.push(
  pane
    .addBinding(rotations.axisAngle, 'angle', { label: '' })
    .on('change', (e) => update('axis angle', e))
);

import './main.css'
import * as THREE from 'three'
import { scene, camera, lights, renderer, run, composer } from 'three-kit'
import Inspector from 'three-inspect'
import { Pane, type InputBindingApi } from 'tweakpane'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import * as RotationPlugin from '@0b5vr/tweakpane-plugin-rotation'
import { conversion } from './conversions'
import { InputTypes, Units, orderOptions } from './types'
import { rotations } from './rotations'

// new Inspector(THREE, scene, camera, renderer, composer)

const loader = new GLTFLoader()

const world = new THREE.Object3D()

scene.add(world)

const gridHelper = new THREE.GridHelper(0.75, 5)
scene.add(gridHelper)

const axesHelper = new THREE.AxesHelper(5)
world.add(axesHelper)

const gltf = await loader.loadAsync('teapot.glb')
const object = gltf.scene

object.children[0].rotateZ(Math.PI)

const helper = new THREE.ArrowHelper()
object.add(helper)

scene.add(lights.createAmbient(0xffffff, 1))
scene.add(lights.createDirectional())

camera.position.set(1, 1, 1)
camera.lookAt(0, 0, 0)

world.add(object)

const pane = new Pane()
pane.registerPlugin(EssentialsPlugin)
pane.registerPlugin(RotationPlugin)

const inputs: InputBindingApi<unknown, unknown>[] = []

const options = {
  units: Units.radians,
};

let paused = false

const update = (key: InputTypes, event) => {
  if (paused) {
    return
  }

  conversion(key, options.units)

  {
    const q = rotations.quaternion
    object.quaternion.set(q.x, q.y, q.z, q.w)
  }

  paused = true

  for (const input of inputs) {
    if (input === event.target) continue
    input.refresh()
  }

  paused = false
}

pane.addInput(object, 'position')
pane.addSeparator()

pane.addInput(options, 'units', {
  view: 'radiogrid',
  groupName: 'units',
  size: [2, 1],
  cells: (x: number) => ({
    title: x === 0 ? 'radians' : 'degrees',
    value: x,
  }),

  label: 'units',
}).on('change', e => update('quaternion', e));

pane.addSeparator()
inputs.push(
  pane.addInput(rotations, 'ov', { label: 'orientation vector (th / xyz)'}).on('change', e => update('ov', e))
)
pane.addSeparator()
inputs.push(
  pane.addInput(rotations, 'quaternion', { label: 'quaternion (xyz / w)'}).on('change', e => update('quaternion', e))
)
pane.addSeparator()
inputs.push(
  pane.addInput(rotations.euler, 'xyz', { label: 'euler' }).on('change', e => update('euler', e))
)
inputs.push(
  pane.addInput(rotations.euler, 'order', {
    label: '',
    options: orderOptions,
  }).on('change', e => update('euler', e))
)
pane.addSeparator()
inputs.push(
  pane.addInput(rotations.matrix, 'row1', { label: 'matrix' }).on('change', e => update('matrix', e))
)
inputs.push(
  pane.addInput(rotations.matrix, 'row2', { label: '' }).on('change', e => update('matrix', e))
)
inputs.push(
  pane.addInput(rotations.matrix, 'row3', { label: '' }).on('change', e => update('matrix', e))
)
pane.addSeparator()
inputs.push(
  pane.addInput(rotations.axisAngle, 'xyz', { label: 'axis angle' }).on('change', e => update('axis angle', e))
)
inputs.push(
  pane.addInput(rotations.axisAngle, 'angle', { label: '' }).on('change', e => update('axis angle', e))
)

run()

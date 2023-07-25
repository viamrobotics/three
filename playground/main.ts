import './main.css'
import * as THREE from 'three'
import { trzy } from 'trzy'
import { Pane, type InputBindingApi } from 'tweakpane'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import * as RotationPlugin from '@0b5vr/tweakpane-plugin-rotation'
import { conversion } from './conversions'
import { type InputTypes, Units, orderOptions } from './types'
import { rotations } from './rotations'

const { scene, camera, renderer } = trzy()

document.body.append(renderer.domElement)

const loader = new GLTFLoader()

const world = new THREE.Object3D()
// Viam's coordinate system.
world.rotateY(-Math.PI / 2)
world.rotateX(-Math.PI / 2)

scene.add(world)

const gridHelper = new THREE.GridHelper(0.75, 5)
scene.add(gridHelper)

const axesHelper = new THREE.AxesHelper(5)
world.add(axesHelper)

const gltf = await loader.loadAsync('teapot.glb')
const object = gltf.scene

object.children[0].rotateY(-Math.PI / 2)
object.children[0].rotateX(Math.PI / 2)

const helper = new THREE.ArrowHelper(undefined, undefined, 0.25)
object.add(helper)

scene.add(new THREE.AmbientLight())
scene.add(new THREE.DirectionalLight())

camera.current.position.set(1.5, 1.5, -1.5)
camera.current.lookAt(0, 0, 0)

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

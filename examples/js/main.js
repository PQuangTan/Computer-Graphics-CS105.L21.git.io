import * as THREE from '../../build/three.module.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { TeapotGeometry } from '../jsm/geometries/TeapotGeometry.js';
import { GUI } from '../jsm/libs/dat.gui.module.js';
import { TransformControls } from '../jsm/controls/TransformControls.js';

let camera, scene, renderer, gui, control, orbit, mesh, geometry, material, light, texture, plane;
let size = 30;
var data = {
    "model": "Box",
    "surface": "Solid",
    "detail": 5,
    "transform": "None",
    "objectcolor": 0xffffff,
    "lighttype": "None",
    "lightcolor": 0xffffff,
}
init();
render();
animate();

function init() {
	// Renderer
    renderer = new THREE.WebGLRenderer();
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
	renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

	// Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 30000);

    camera.position.set(50, 25, 50);
    camera.lookAt(0, 50, 0);

	// Scene
    scene = new THREE.Scene();
	plane = getPlane(10000);
	plane.rotation.x = -Math.PI/2;
	scene.add(plane);
    scene.add(new THREE.GridHelper(10000, 100, 0x888888, 0x444444));

	// Light
    light = new THREE.PointLight(0xffffff, 3);
    light.castShadow = true;
    light.position.set(100, 100, 100);
	light.add(new THREE.PointLightHelper( light, 15 ))
    scene.add(light);

	// Load Texture
    texture = new THREE.TextureLoader().load('textures/scratch.jpg', render);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

	// Mesh
    geometry = new THREE.BoxGeometry(size, size, size);
    material = new THREE.MeshPhongMaterial({
        color: 'rgb(255, 255, 255)',
    });

	mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
    scene.add(mesh);

    // OrbitControls
    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();
    orbit.addEventListener('change', render);

	// Transform
    control = new TransformControls(camera, renderer.domElement);
    control.addEventListener('change', render);
    control.addEventListener('dragging-changed', function(event) {
        orbit.enabled = !event.value;
    });

    transformMode();
    scene.add(control);

	// GUI

    gui = new GUI();

    let objectFolder = gui.addFolder('Object');
    objectFolder.add(data, 'transform', ['None', 'Translate', 'Scale', 'Rotate']).name('Transform Mode').onChange(transformMode);
    objectFolder.add(data, 'model', ["Box", "Sphere", "Cone", "Cylinder", "Torus", "Knot", "Teapot", "Tetrahedron", "Octahedron", "Dodecahedron", "Icosahedron"]).name('Model').onChange(generateGeometry);
    objectFolder.add(data, 'surface', ["Solid", "Wireframes", "Points", "Texture"]).name('Surface').onChange(generateGeometry);
    objectFolder.addColor( data, 'objectcolor' ).name('Color').onChange(function(value) {mesh.material.color.set(value)});
    
    let cameraFolder = gui.addFolder('Camera');
	cameraFolder.add(camera.position, 'x', -200, 200).name('X');
	cameraFolder.add(camera.position, 'y', -200, 200).name('Y');
	cameraFolder.add(camera.position, 'z', -200, 200).name('Z');
	cameraFolder.add(camera, 'near', 0, 200).name('Near');
	cameraFolder.add(camera, 'far', 0, 50000).name('Far');
	cameraFolder.add(camera, 'fov', 0, 100).name('FOV');

	let lightFolder = gui.addFolder('Light');
	lightFolder.add(light.position, 'x', -200, 200).name('X');
	lightFolder.add(light.position, 'y', -200, 200).name('Y');
	lightFolder.add(light.position, 'z', -200, 200).name('Z');
	lightFolder.add(light, 'intensity', 0, 10).name('Intensity');
    lightFolder.addColor( data, 'lightcolor' ).name('Color').onChange(function(value) {light.color.set(value)});
	lightFolder.open();

	// Resize
    window.addEventListener('resize', onWindowResize);

}

function transformMode() {
    switch (data.transform) {
        case 'Translate':
            if (control.object === undefined) {
                control.attach(mesh)
            }
            control.setMode('translate');
            break;
        case 'Rotate':
            if (control.object === undefined) {
                control.attach(mesh)
            }
            control.setMode('rotate');
            break;
        case 'Scale':
            if (control.object === undefined) {
                control.attach(mesh)
            }
            control.setMode('scale');
            break;
        case 'None':
            control.detach();
            break;
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

function render() {

    renderer.render(scene, camera);

}

function generateGeometry() {
    if (control.object != undefined) {
        control.detach();
    }
    if (mesh != undefined || mesh.parent === scene) {
        scene.remove(mesh);
    }

    geometry = newGeometry(data);
    if (data.surface == "Wireframes") {
        var wireframe = new THREE.WireframeGeometry(geometry);
        mesh = new THREE.LineSegments(wireframe);
    } else if (data.surface == "Points") {
        mesh = new THREE.Points(geometry, new THREE.PointsMaterial({
            color: 'rgb(255, 255, 255)',
            size: 1
        }));
    } else if (data.surface == "Texture") {
        mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
            color: 'rgb(255, 255, 255)',
            map: data.surface === "Texture" ? texture : null
        }));
    } else {
        mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: 'rgb(255, 255, 255)'
        }));
    }
    mesh.castShadow = true;
	scene.add(mesh);
    transformMode();
}

function newGeometry(data) {
    switch (data.model) {
        case "Box":
            return new THREE.BoxGeometry(size, size, size, 2 * data.detail, 2 * data.detail, 2 * data.detail);
        case "Sphere":
            return new THREE.SphereGeometry(size / 1.25, 8 * data.detail, 8 * data.detail);
        case "Cone":
            return new THREE.ConeGeometry(size, size, 16 * data.detail, 16 * data.detail);
        case "Cylinder":
            return new THREE.CylinderGeometry(size / 1.5, size / 1.5, 1.25 * size, 8 * data.detail, 8 * data.detail);
        case "Torus":
            return new THREE.TorusGeometry(size / 2, size / 6, 16 * data.detail, 8 * data.detail);
        case "Knot":
            return new THREE.TorusKnotGeometry(size / 2, size / 6, 16 * data.detail, 8 * data.detail);
        case "Teapot":
            return new TeapotGeometry(size / 1.25, data.detail * 2, true, true, true, true, true);
        case "Tetrahedron":
            return new THREE.TetrahedronGeometry(size, 2 * data.detail);
        case "Octahedron":
            return new THREE.OctahedronGeometry(size, 2 * data.detail);
        case "Dodecahedron":
            return new THREE.DodecahedronGeometry(size, 2 * data.detail);
        case "Icosahedron":
            return new THREE.IcosahedronGeometry(size, data.detail);
    }
}

function animate() {
    requestAnimationFrame(animate);
    orbit.update();
    render();
}

function getPlane(size) {
	let geometry = new THREE.PlaneGeometry(size, size);
	let material = new THREE.MeshPhongMaterial({
		color: 'rgb(120, 120, 120)',
		side: THREE.DoubleSide
	});
	let mesh = new THREE.Mesh(
		geometry,
		material 
	);
	mesh.receiveShadow = true;
	return mesh;
}
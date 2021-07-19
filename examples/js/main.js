import * as THREE from '../../build/three.module.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { TeapotGeometry } from '../jsm/geometries/TeapotGeometry.js';
import { GUI } from '../jsm/libs/dat.gui.module.js';
import { TransformControls } from '../jsm/controls/TransformControls.js';

let camera, scene, renderer, gui, control, orbit, mesh, geometry, material, light, lighthelper, texture, plane, image_path = undefined;
let size = 30;
var data = {
    "model": "Box",
    "surface": "Solid",
    "detail": 5,
    "transform": "None",
    "objectcolor": 0xffffff,
    "lighttype": "AmbientLight",
    "lightcolor": 0xffffff,
    "animation" : "None",
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

    camera.position.set(-70, 70, -70);
    camera.lookAt(0, 50, 0);

    // Scene
    scene = new THREE.Scene();
    plane = getPlane(10000);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
    scene.add(new THREE.GridHelper(10000, 100, 0x888888, 0x444444));
    plane.visible = false;

    // Light
    light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    // Load Texture
    texture = new THREE.TextureLoader().load('textures/scratch.jpg', render);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Mesh
    geometry = new THREE.BoxGeometry(size, size, size);
    material = new THREE.MeshPhongMaterial({
        color: data.objectcolor,
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
    objectFolder.addColor(data, 'objectcolor').name('Color').onChange(function(value) {
        mesh.material.color.set(value)
    });

    let cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(camera.position, 'x', -200, 200).name('X');
    cameraFolder.add(camera.position, 'y', -200, 200).name('Y');
    cameraFolder.add(camera.position, 'z', -200, 200).name('Z');
    cameraFolder.add(camera, 'near', 0, 200).name('Near');
    cameraFolder.add(camera, 'far', 0, 50000).name('Far');
    cameraFolder.add(camera, 'fov', 0, 100).name('FOV');

    let lightFolder = gui.addFolder('Light');
    lightFolder.add(data, 'lighttype', ['AmbientLight', 'PointLight']).name('Light Type').onChange(generateLight);
    lightFolder.addColor(data, 'lightcolor').name('Color').onChange(function(value) {
        light.color.set(value)
    });

    let animationFolder = gui.addFolder('Animation');
    animationFolder.add(data, 'animation', ['None', 'Animation 1', 'Animation 2', 'Animation 3']).name('Animation Model').onChange(animation);

    // Resize
    window.addEventListener('resize', onWindowResize);

}

function transformMode() {
    switch (data.transform) {
        case 'Translate':
            if (control.object == undefined) {
                control.attach(mesh)
            }
            control.setMode('translate');
            break;
        case 'Rotate':
            if (control.object == undefined) {
                control.attach(mesh)
            }
            control.setMode('rotate');
            break;
        case 'Scale':
            if (control.object == undefined) {
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
    animation(data);
    
    renderer.render(scene, camera);

}

function animation(data){
    switch (data.animation) {
        case 'Animation 1':
            return updateAnimation1();
        case 'Animation 2':
            return updateAnimation2();
        case 'Animation 3':
            return updateAnimation3();
        case 'None':
            return undefined;
    }
}

var rangeScence = 400;
function updateAnimation1(){
    mesh.position.x = THREE.MathUtils.randInt(-400,400);
    mesh.position.y = THREE.MathUtils.randInt(-2,300);
    mesh.position.z = THREE.MathUtils.randInt(-400,400);
    mesh.material.color.setHex( Math.random() * 0xffffff )
}

function updateAnimation2(){
    if (mesh.position.x >= rangeScence){
        mesh.position.x = -rangeScence;
    }

    mesh.rotation.y += 0.01;
    mesh.rotation.x += 0.01;
    mesh.rotation.z += 0.01;

    if (mesh.position.x >= -200 && mesh.position.x <= 200){
        //position
        mesh.position.x += 30;

        // rotation
        mesh.rotation.x += 0.1;
        mesh.rotation.x += 0.1;
        mesh.rotation.z += 0.1;

    }
    else{
        mesh.position.x += 0.5;
    }
}

var t = 0;
var count = -1000;
function updateAnimation3() {
    t += 0.01;
    count += 1;
    mesh.rotation.y += 20;

    mesh.position.x = 250*Math.cos(t) + 0;
    mesh.position.z = 250*Math.sin(t) + 0;

    
    if (count <= 0){
        mesh.scale.x += 0.05;
        mesh.scale.y += 0.05;
        mesh.scale.z += 0.05;
    }
    else if (count > 0 && count <= 1000){
        mesh.scale.x -= 0.05;
        mesh.scale.y -= 0.05;
        mesh.scale.z -= 0.05;
    }
    else{
        count = -1000;
    }

}

function generateLight() {
    switch (data.lighttype) {
        case 'AmbientLight':
            if (light.parent == scene) {
                scene.remove(light);
            }
            light = new THREE.AmbientLight(0xffffff);
            scene.add(light);
            plane.visible = false;
            if (lighthelper.parent = scene) {
                scene.remove(lighthelper);
            }
            break;
        case 'PointLight':
            if (light.parent == scene) {
                scene.remove(light);
            }
            light = new THREE.PointLight(0xffffff, 2);
            scene.add(light);
            light.castShadow = true;
            light.position.set(40, 40, 40);
            plane.visible = true;
            lighthelper = new THREE.PointLightHelper(light, 15);
            light.add(lighthelper);
            break;
    }
}

function uploadImg(data,flag){
    var input = document.getElementById('img-path');
    input.addEventListener('change', function() {
        var file = input.files[0];
        image_path = URL.createObjectURL( file );
        generateGeometry();
    });

    // make sure surface is texture
    if (data.surface == "Texture"){
        input.click();
    }
}

function generateGeometry() {
    if (control.object != undefined) {
        control.detach();
    }
    if (mesh != undefined || mesh.parent == scene) {
        scene.remove(mesh);
    }

    geometry = newGeometry(data);
    if (data.surface == "Wireframes") {
        var wireframe = new THREE.WireframeGeometry(geometry);
        mesh = new THREE.LineSegments(wireframe);
    } else if (data.surface == "Points") {
        mesh = new THREE.Points(geometry, new THREE.PointsMaterial({
            color: data.objectcolor,
            size: 1
        }));
    } else if (data.surface == "Texture") {
        var loader = new THREE.TextureLoader();
        loader.setCrossOrigin("Anonymous");
        uploadImg(data);
        // make sure image_paht != none
        if (image_path != undefined ){    
            texture = loader.load(image_path, render);
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
                color: 'rgb(255,255,255)',
                map: data.surface === "Texture" ? texture : null
            }));
        }
    } else {
        mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: data.objectcolor,
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
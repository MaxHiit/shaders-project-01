import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

import { CCapture } from 'ccapture.js-npmfixed';

import testVertexShader from './shaders/test/vertex.glsl';
import testFragmentShader from './shaders/test/fragment.glsl';

/**
 * Base
 */
// Video Capture

let isCapturing = false;
let captureStartTime;

// GUI controller
const controller = {
	startCapture: function () {
		if (!isCapturing) {
			capturer.start();
			isCapturing = true;
			captureStartTime = Date.now(); // reset the capture start time when starting capture
		}
	},
	stopCapture: function () {
		if (isCapturing) {
			capturer.stop();
			capturer.save();
			isCapturing = false;
		}
	}
};

const capturer = new CCapture({
	format: 'webm',
	framerate: 60,
	verbose: true
});

// Debug
const gui = new GUI();

gui.add(controller, 'startCapture').name('Start Capture');
gui.add(controller, 'stopCapture').name('Stop Capture');

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const flagTexture = textureLoader.load('/textures/flag-french.jpg');

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {
	randoms[i] = Math.random();
}

geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

// Material

// Row Shader Material
// const material = new THREE.RawShaderMaterial({
// 	vertexShader: testVertexShader,
// 	fragmentShader: testFragmentShader,
// 	side: THREE.DoubleSide,
// 	uniforms: {
// 		uFrequency: { value: new THREE.Vector2(10, 5) },
// 		uTime: { value: 0 },
// 		uColor: { value: new THREE.Color('orange') },
// 		uTexture: { value: flagTexture }
// 	}
// });

// Shader Material
const material = new THREE.ShaderMaterial({
	vertexShader: testVertexShader,
	fragmentShader: testFragmentShader,
	side: THREE.DoubleSide,
	uniforms: {
		uFrequency: { value: new THREE.Vector2(10, 5) },
		uTime: { value: 0 },
		uColor: { value: new THREE.Color('orange') },
		uTexture: { value: flagTexture }
	}
});

gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01).name('frequencyX');
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01).name('frequencyY');

// Mesh
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0.25, -0.25, 1);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// update material
	material.uniforms.uTime.value = elapsedTime * 3;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Capture frame
	if (isCapturing) {
		capturer.capture(renderer.domElement);
	}

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();

import 'purecss/build/pure-min.css';
import './index.css';

Promise.all([
	import('./three.js'),
	import('./app.js'),

	// PLUGINS
	import('./plugins/color-picker.js'),
	import('./plugins/camera-control.js'),
]).then(([
	{ THREE },
	{ App },

	// PLUGINS
	{ ColorPicker },
	{ CameraControl },
]) => {
	const plugins = [
		ColorPicker,
		CameraControl,
	];

	const app = new App(THREE, plugins);
	// app.init();
	app.render();
	// app.animate();
});

// window.addEventListener( 'resize', onWindowResize, false );
// 
// function onWindowResize(){
// 
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
// 
//     renderer.setSize( window.innerWidth, window.innerHeight );
// 
// }
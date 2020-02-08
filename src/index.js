import 'purecss/build/pure-min.css';
import './styles/flaticon.css';
import './styles/index.css';

const loader = document.getElementById('loader');
const loaderContainer = document.getElementById('loader-container');
const loaderProgress = document.getElementById('loader-progress');

const progressPromise = (promises, tickCallback) => {
  const len = promises.length;
  let progress = 0;
  
  const tick = (promise) => {
    promise.then(() => {
      progress++;
      tickCallback(progress, len);
    });
    return promise;
  }
  
  return Promise.all(promises.map(tick));
}

const assets = [
	// CORE
	import('./three.js'),
	import('./app.js'),

	// LIBS
	import('micromodal/dist/micromodal.min.js'),

	// PLUGINS
	import('./plugins/file-manager/file-manager.js'),
	import('./plugins/tools/index.js'),
	import('./plugins/color-picker.js'),
	import('./plugins/camera-control.js'),
];

const update = (completed, total) => {
	const progressWidth = loaderContainer.clientWidth / total * completed;
  loaderProgress.style.width = `${progressWidth}px`; 
}

progressPromise(assets, update)
	.then(([
		// CORE
		{ THREE },
		{ App },

		// LIBS
		MicroModal,

		// PLUGINS
		{ FileManager },
		{ Tools },
		{ ColorPicker },
		{ CameraControl },
	]) => {
		MicroModal.init();

		const plugins = [
			FileManager,
			Tools,
			ColorPicker,
			CameraControl,
		];

		const app = new App(THREE, plugins);
		app.render();

		loader.style.display = 'none';
	});

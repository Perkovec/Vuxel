import 'purecss/build/pure-min.css';
import 'tippy.js/dist/tippy.css';
import './styles/flaticon.css';
import './styles/index.css';
import './store';

const loader = document.getElementById('loader');
const loaderContainer = document.getElementById('loader-container');
const loaderProgress = document.getElementById('loader-progress');

const progressPromise = (promises, tickCallback) => {
  const len = promises.length;
  let progress = 0;

  const tick = (promise) => {
    promise.then(() => {
      progress += 1;
      tickCallback(progress, len);
    });
    return promise;
  };

  return Promise.all(promises.map(tick));
};

const assets = [
  // CORE
  import('./three.js'),
  import('./app.js'),

  // LIBS
  import('micromodal/dist/micromodal.min.js'),
  import('tippy.js'),
  import('@jaames/iro'),

  // PLUGINS
  import('./plugins/file-manager/file-manager.js'),
  import('./plugins/tools/index.js'),
  import('./plugins/color-picker.js'),
  import('./plugins/camera-control.js'),
];

const update = (completed, total) => {
  const progressWidth = loaderContainer.clientWidth / total * completed;
  loaderProgress.style.width = `${progressWidth}px`;
};

progressPromise(assets, update)
  .then(([
    // CORE
    { THREE },
    { App },

    // LIBS
    MicroModal,
    tippy,
    iro,

    // PLUGINS
    { FileManager },
    { Tools },
    { ColorPicker },
    { CameraControl },
  ]) => {
    MicroModal.init();
    window.tippy = tippy.default;
    window.iro = iro.default;

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

import { store } from './store';

export class App {
  constructor(THREE, plugins) {
    this.THREE = THREE;
    this.objects = [];
    this.sceneObjects = [];
    this.isShiftDown = false;
    this.editorContainer = document.getElementById('editor');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    const axesHelper = new THREE.AxesHelper(2);
    axesHelper.position.addScalar(0.1);
    this.scene.add(axesHelper);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.camera = new THREE.PerspectiveCamera(
      45, this.editorContainer.clientWidth / this.editorContainer.clientHeight,
      1, 10000,
    );
    this.camera.position.set(1000, 1000, 1000);
    this.camera.lookAt(0, 0, 0);

    const gridHelper = new THREE.GridHelper(1000, 20);
    this.scene.add(gridHelper);

    this.createLight();
    this.createGround();

    window.addEventListener('resize', () => this.onWindowResize(), false);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.editorContainer.clientWidth, this.editorContainer.clientHeight);
    this.editorContainer.appendChild(this.renderer.domElement);
    this.rect = this.renderer.domElement.getBoundingClientRect();

    this.pluginsInstances = {};

    const pluginsConfig = {
      THREE,
      renderer: this.renderer,
      camera: this.camera,
      render: this.render.bind(this),
      scene: this.scene,
      sceneObjects: this.sceneObjects,
      objects: this.objects,
      plugins: this.pluginsInstances,
      rect: this.rect,
      store,
    };

    plugins.forEach((Plugin) => {
      this.pluginsInstances[Plugin.meta.name] = new Plugin(pluginsConfig);
    });
    store.dispatch('@init/plugins');
  }

  createLight() {
    const { THREE } = this;

    const ambientLight = new THREE.AmbientLight(0x606060);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    this.scene.add(directionalLight);
  }

  createGround() {
    const { THREE } = this;
    const geometry = new THREE.PlaneBufferGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);

    this.plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    this.scene.add(this.plane);
    this.objects.push(this.plane);
  }

  onWindowResize() {
    this.camera.aspect = this.editorContainer.clientWidth / this.editorContainer.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.editorContainer.clientWidth, this.editorContainer.clientHeight);
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

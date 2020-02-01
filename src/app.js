export class App {
  constructor(THREE, plugins) {
    this.THREE = THREE;
    this.objects = [];
    this.isShiftDown = false;
    this.editorContainer = document.getElementById('editor');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    const axesHelper = new THREE.AxesHelper(2);
    axesHelper.position.addScalar(0.1);
    this.scene.add(axesHelper);

    this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

    this.camera = new THREE.PerspectiveCamera(45, this.editorContainer.clientWidth / this.editorContainer.clientHeight, 1, 10000);
		this.camera.position.set(1000, 1000, 1000);
    this.camera.lookAt(0, 0, 0);
    
    const gridHelper = new THREE.GridHelper(1000, 20);
    this.scene.add(gridHelper);

    this.createLight();
    this.createGround();
    this.createCubes();

    window.addEventListener('resize', () => this.onWindowResize(), false);

    this.editorContainer.addEventListener('mousemove', event => this.onDocumentMouseMove(event), false);
		this.editorContainer.addEventListener('mousedown', event => this.onDocumentMouseDown(event), false);
		document.addEventListener('keydown', event => this.onDocumentKeyDown(event), false);
    document.addEventListener('keyup', event => this.onDocumentKeyUp(event), false);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
	  this.renderer.setSize(this.editorContainer.clientWidth, this.editorContainer.clientHeight);
    this.editorContainer.appendChild(this.renderer.domElement);
    this.rect = this.renderer.domElement.getBoundingClientRect();
    
    const pluginsConfig = {
      THREE,
      brushMaterial: this.cubeMaterial,
      renderer: this.renderer,
      camera: this.camera,
      render: this.render.bind(this),
    }

    plugins.forEach(Plugin => {
      new Plugin(pluginsConfig);
    });
  }

  createLight() {
    const THREE = this.THREE;

    const ambientLight = new THREE.AmbientLight(0x606060);
		this.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff);
		directionalLight.position.set(1, 0.75, 0.5).normalize();
		this.scene.add(directionalLight);
  }

  createCubes() {
    const THREE = this.THREE;

    const rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
		const	rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
		this.rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
		this.scene.add(this.rollOverMesh);

		this.cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
		this.cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  }

  createGround() {
    const THREE = this.THREE;
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
  }

  onDocumentMouseMove(event) {
    event.preventDefault();

    this.mouse.set(
      ((event.clientX - this.rect.left) / this.editorContainer.clientWidth) * 2 - 1,
      -((event.clientY - this.rect.top) / this.editorContainer.clientHeight) * 2 + 1
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.objects);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
      this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    }

    this.render();
  }

  onDocumentMouseDown(event) {
    event.preventDefault();
    const THREE = this.THREE;

    this.mouse.set(
      ((event.clientX - this.rect.left) / this.editorContainer.clientWidth) * 2 - 1,
      -((event.clientY - this.rect.top) / this.editorContainer.clientHeight) * 2 + 1
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.objects);
    if (intersects.length > 0) {
      const intersect = intersects[0];

      // delete cube
      if (this.isShiftDown) {
        if (intersect.object !== this.plane) {
          this.scene.remove(intersect.object);
          this.objects.splice(this.objects.indexOf(intersect.object), 1);
        }
      } else {
        // create cube
        const voxel = new THREE.Mesh(this.cubeGeo, this.cubeMaterial.clone());
        voxel.position.copy(intersect.point).add(intersect.face.normal);
        voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        this.scene.add(voxel);

        this.objects.push(voxel);
      }
      this.render();
    }
  }

  onDocumentKeyDown(event) {
    switch (event.keyCode) {
      case 16: this.isShiftDown = true; break;
    }
  }

  onDocumentKeyUp(event) {
    switch (event.keyCode) {
      case 16: this.isShiftDown = false; break;
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

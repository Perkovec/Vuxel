export class SingleVoxel {
  constructor(configs) {
    const { THREE } = configs;
    this.THREE = THREE;

    this.scene = configs.scene;
    this.renderer = configs.renderer;
    this.camera = configs.camera;
    this.objects = configs.objects;
    this.sceneObjects = configs.sceneObjects;
    this.render = configs.render;
    this.rect = configs.rect;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    const rollOverMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      opacity: 0.5,
      transparent: true,
      visible: false,
    });
    this.rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);

    this.cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    this.mainMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

    this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
  }

  init() {
    this.scene.add(this.rollOverMesh);

    this.renderer.domElement.addEventListener('mousemove', this.onDocumentMouseMove, false);
    this.renderer.domElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
  }

  destroy() {
    this.scene.remove(this.rollOverMesh);

    this.renderer.domElement.removeEventListener('mousemove', this.onDocumentMouseMove, false);
    this.renderer.domElement.removeEventListener('mousedown', this.onDocumentMouseDown, false);
  }

  onDocumentMouseMove(event) {
    event.preventDefault();

    this.mouse.set(
      ((event.clientX - this.rect.left) / this.renderer.domElement.clientWidth) * 2 - 1,
      -((event.clientY - this.rect.top) / this.renderer.domElement.clientHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects([...this.objects, ...this.sceneObjects]);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      this.rollOverMesh.material.visible = true;
      this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
      this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    } else {
      this.rollOverMesh.material.visible = false;
    }

    this.render();
  }

  onDocumentMouseDown(event) {
    event.preventDefault();
    const { THREE } = this;

    this.mouse.set(
      ((event.clientX - this.rect.left) / this.renderer.domElement.clientWidth) * 2 - 1,
      -((event.clientY - this.rect.top) / this.renderer.domElement.clientHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects([...this.objects, ...this.sceneObjects]);
    if (intersects.length > 0) {
      const intersect = intersects[0];

      const voxel = new THREE.Mesh(this.cubeGeo, this.mainMaterial.clone());
      voxel.position.copy(intersect.point).add(intersect.face.normal);
      voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
      this.scene.add(voxel);

      this.sceneObjects.push(voxel);

      this.render();
    }
  }
}

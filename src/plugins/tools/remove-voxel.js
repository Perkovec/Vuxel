export class RemoveVoxel {
  meta = {
    alt: 'Remove single voxel (E)',
    key: 'E',
  }

  constructor(configs) {
    const { THREE } = configs;
    this.THREE = THREE;

    this.scene = configs.scene;
    this.renderer = configs.renderer;
    this.camera = configs.camera;
    this.sceneObjects = configs.sceneObjects;
    this.render = configs.render;
    this.rect = configs.rect;

    this.enabled = true;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    const rollOverMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
      visible: false,
    });
    this.rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);

    this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
  }

  enable() {
    this.enabled = true;
    this.rollOverMesh.material.visible = true;
  }

  disable() {
    this.enabled = false;
    this.rollOverMesh.material.visible = false;
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
    if (this.enabled === false) return;
    event.preventDefault();

    this.mouse.set(
      ((event.clientX - this.rect.left) / this.renderer.domElement.clientWidth) * 2 - 1,
      -((event.clientY - this.rect.top) / this.renderer.domElement.clientHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.sceneObjects);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      this.rollOverMesh.material.visible = true;
      this.rollOverMesh.position.copy(intersect.object.position);
    } else {
      this.rollOverMesh.material.visible = false;
    }

    this.render();
  }

  onDocumentMouseDown(event) {
    if (this.enabled === false) return;
    event.preventDefault();

    this.mouse.set(
      ((event.clientX - this.rect.left) / this.renderer.domElement.clientWidth) * 2 - 1,
      -((event.clientY - this.rect.top) / this.renderer.domElement.clientHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.sceneObjects);
    if (intersects.length > 0) {
      const intersect = intersects[0];

      this.scene.remove(intersect.object);
      this.sceneObjects.splice(this.sceneObjects.indexOf(intersect.object), 1);

      this.render();
    }
  }
}

export class PaintBrush {
  meta = {
    alt: 'Paint brush (P)',
    key: 'P',
  }

  constructor(configs) {
    const { THREE } = configs;
    this.THREE = THREE;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.objects = configs.objects;
    this.sceneObjects = configs.sceneObjects;
    this.renderer = configs.renderer;
    this.render = configs.render;
    this.rect = configs.rect;
    this.camera = configs.camera;

    this.mousePressed = false;

    this.mainMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

    this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
    this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);
  }

  init() {
    this.renderer.domElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
  }

  destroy() {
    this.renderer.domElement.removeEventListener('mousedown', this.onDocumentMouseDown, false);
  }

  setColor(event) {
    this.mouse.set(
      ((event.clientX - this.rect.left) / this.renderer.domElement.clientWidth) * 2 - 1,
      -((event.clientY - this.rect.top) / this.renderer.domElement.clientHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects([...this.objects, ...this.sceneObjects]);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      intersect.object.material.color = this.mainMaterial.color.clone();
      this.render();
    }
  }

  onDocumentMouseMove(event) {
    event.preventDefault();
    if (this.mousePressed) {
      this.setColor(event);
    }
  }

  onDocumentMouseDown(event) {
    event.preventDefault();

    if (event.button === 0) { // 0 - left mouse button
      this.renderer.domElement.addEventListener('mousemove', this.onDocumentMouseMove, false);
      this.renderer.domElement.addEventListener('mouseup', this.onDocumentMouseUp, false);
      this.mousePressed = true;
      this.setColor(event);
    }
  }

  onDocumentMouseUp(event) {
    event.preventDefault();

    this.renderer.domElement.removeEventListener('mousemove', this.onDocumentMouseMove, false);
    this.renderer.domElement.removeEventListener('mouseup', this.onDocumentMouseUp, false);

    this.mousePressed = false;
  }
}

export class MultipleVoxels {
  meta = {
    alt: 'Place multiple voxels (M)',
    key: 'M',
  }

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

    this.enabled = true;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    const rollOverMaterial = new THREE.LineDashedMaterial({
      color: 0x000000,
      dashSize: 5,
      gapSize: 5,
      linewidth: 1,
    });
    this.rollOverMesh = new THREE.LineSegments(
      new THREE.EdgesGeometry(rollOverGeo), rollOverMaterial,
    );
    this.rollOverMesh.computeLineDistances();

    this.cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    this.mainMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

    this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);

    this.start = null;
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
    this.render();
  }

  onDocumentMouseMove(event) {
    if (this.enabled === false) return;
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
      if (!this.start) {
        this.rollOverMesh.material.visible = true;
        this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
      } else {
        const currentPosition = new THREE.Vector3();
        currentPosition.copy(intersect.point).add(intersect.face.normal);
        currentPosition.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        const size = this.sizeFromVectors(this.start, currentPosition);
        const rollOverGeo = new THREE.BoxBufferGeometry(size.x, size.y, size.z);
        this.rollOverMesh.geometry = new THREE.EdgesGeometry(rollOverGeo);
        this.rollOverMesh.position.copy(this.centerBetweenVectors(this.start, currentPosition));
        this.rollOverMesh.computeLineDistances();
      }
    }

    this.render();
  }

  onDocumentMouseDown(event) {
    if (this.enabled === false) return;
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

      if (!this.start) {
        this.start = new THREE.Vector3();
        this.start.copy(intersect.point).add(intersect.face.normal);
        this.start.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
      } else if (!this.end) {
        const end = new THREE.Vector3();
        end.copy(intersect.point).add(intersect.face.normal);
        end.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        const size = new THREE.Vector3();

        size.subVectors(end, this.start);
        size.set(Math.abs(size.x), Math.abs(size.y), Math.abs(size.z));
        size.addScalar(50);

        this.placeVoxels(this.start, end, size);
        this.start = null;

        const rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
        this.rollOverMesh.geometry = new THREE.EdgesGeometry(rollOverGeo);
        this.rollOverMesh.computeLineDistances();

        this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

        this.render();
      }
    }
  }

  placeVoxels(start, end, commonSize) {
    const { THREE } = this;

    const xSegments = commonSize.x / 50;
    const ySegments = commonSize.y / 50;
    const zSegments = commonSize.z / 50;

    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const minZ = Math.min(start.z, end.z);
    for (let x = 0; x < xSegments; x += 1) {
      for (let y = 0; y < ySegments; y += 1) {
        for (let z = 0; z < zSegments; z += 1) {
          const voxel = new THREE.Mesh(this.cubeGeo, this.mainMaterial.clone());
          voxel.position.copy(new THREE.Vector3(minX + x * 50, minY + y * 50, minZ + z * 50));
          this.scene.add(voxel);

          this.sceneObjects.push(voxel);
        }
      }
    }
  }

  sizeFromVectors(a, b) {
    const { THREE } = this;
    const size = new THREE.Vector3();
    size.subVectors(b, a);
    size.set(Math.abs(size.x), Math.abs(size.y), Math.abs(size.z));
    size.addScalar(50);
    return size;
  }

  centerBetweenVectors(a, b) {
    let dir = b.clone().sub(a);
    const len = dir.length();
    dir = dir.normalize().multiplyScalar(len * 0.5);
    return a.clone().add(dir);
  }
}

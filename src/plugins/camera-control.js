/* BASED ON https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js */
import { AbstractPlugin } from '../core/plugin.abstract';

export class CameraControl extends AbstractPlugin {
  static meta = {
    name: 'camera-control',
  };

  constructor(configs) {
    super(configs);
    const { THREE } = configs;
    this.THREE = THREE;

    this.enabled = false;
    this.render = configs.render;
    this.camera = configs.camera;
    this.domElement = configs.renderer.domElement;

    this.target = new THREE.Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    this.enableZoom = true;
    this.zoomSpeed = 1.0;

    this.enableRotate = true;
    this.rotateSpeed = 1.0;

    this.enablePan = true;
    this.panSpeed = 1.0;
    this.screenSpacePanning = false; // if true, pan in screen-space
    this.keyPanSpeed = 7.0; // pixels moved per arrow key push

    this.enableKeys = true;
    this.keys = {
      LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40,
    };

    this.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.camera.position.clone();
    this.zoom0 = this.camera.zoom;


    // ---------------
    //    INTERNALS
    // ---------------
    this._spherical = new THREE.Spherical();
    this._sphericalDelta = new THREE.Spherical();

    this._scale = 1;
    this._panOffset = new THREE.Vector3();

    this._zoomChanged = false;
    this._EPS = 0.000001;

    this.panLeft = this.panLeft();
    this.panUp = this.panUp();
    this.pan = this.pan();
    this.update = this.update();

    this._STATE = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6,
    };
    this._state = this._STATE.NONE;
    this._touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    this._rotateStart = new THREE.Vector2();
    this._rotateEnd = new THREE.Vector2();
    this._rotateDelta = new THREE.Vector2();

    this._panStart = new THREE.Vector2();
    this._panEnd = new THREE.Vector2();
    this._panDelta = new THREE.Vector2();

    this._dollyStart = new THREE.Vector2();
    this._dollyEnd = new THREE.Vector2();
    this._dollyDelta = new THREE.Vector2();


    // ------------
    //    EVENTS
    // ------------
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.domElement.addEventListener('contextmenu', this.onContextMenu, false);
    this.domElement.addEventListener('mousedown', this.onMouseDown, false);
    this.domElement.addEventListener('wheel', this.onMouseWheel, false);
    this.domElement.addEventListener('keydown', this.onKeyDown, false);

    if (this.domElement.tabIndex === -1) {
      this.domElement.tabIndex = 0;
    }

    this.update();
    this.render();
  }

  getPolarAngle() {
    return this._spherical.phi;
  }

  getAzimuthalAngle() {
    return this._spherical.theta;
  }

  update() {
    const { THREE } = this;

    const offset = new THREE.Vector3();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      this.camera.up,
      new THREE.Vector3(0, 1, 0),
    );
    const quatInverse = quat.clone().inverse();

    const lastPosition = new THREE.Vector3();
    const lastQuaternion = new THREE.Quaternion();

    return () => {
      const { position } = this.camera;
      offset.copy(position).sub(this.target);

      offset.applyQuaternion(quat);

      this._spherical.setFromVector3(offset);

      this._spherical.theta += this._sphericalDelta.theta;
      this._spherical.phi += this._sphericalDelta.phi;

      this._spherical.theta = Math.max(
        this.minAzimuthAngle,
        Math.min(this.maxAzimuthAngle, this._spherical.theta),
      );
      this._spherical.phi = Math.max(
        this.minPolarAngle,
        Math.min(this.maxPolarAngle, this._spherical.phi),
      );
      this._spherical.makeSafe();

      this._spherical.radius *= this._scale;
      this._spherical.radius = Math.max(
        this.minDistance,
        Math.min(this.maxDistance, this._spherical.radius),
      );

      this.target.add(this._panOffset);

      offset.setFromSpherical(this._spherical);
      offset.applyQuaternion(quatInverse);

      position.copy(this.target).add(offset);
      this.camera.lookAt(this.target);

      this._sphericalDelta.set(0, 0, 0);
      this._panOffset.set(0, 0, 0);

      this._scale = 1;

      if (
        this._zoomChanged
        || lastPosition.distanceToSquared(this.camera.position) > this._EPS
        || 8 * (1 - lastQuaternion.dot(this.camera.quaternion)) > this._EPS
      ) {
        lastPosition.copy(this.camera.position);
        lastQuaternion.copy(this.camera.quaternion);
        this._zoomChanged = false;

        return true;
      }

      return false;
    };
  }

  dispose() {
    this.domElement.removeEventListener('contextmenu', this.onContextMenu, false);
    this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
    this.domElement.removeEventListener('wheel', this.onMouseWheel, false);

    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);

    this.domElement.removeEventListener('keydown', this.onKeyDown, false);
  }

  onMouseDown(event) {
    if (this.enabled === false) return;
    event.preventDefault();
    const { THREE } = this;

    if (this.domElement.focus) {
      this.domElement.focus();
    } else {
      window.focus();
    }

    let mouseAction;
    switch (event.button) {
      case 0:
        mouseAction = this.mouseButtons.LEFT;
        break;

      case 1:
        mouseAction = this.mouseButtons.MIDDLE;
        break;

      case 2:
        mouseAction = this.mouseButtons.RIGHT;
        break;

      default:
        mouseAction = -1;
    }

    switch (mouseAction) {
      case THREE.MOUSE.DOLLY:
        if (this.enableZoom === false) return;

        this.handleMouseDownDolly(event);

        this._state = this._STATE.DOLLY;
        break;

      case THREE.MOUSE.ROTATE:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enablePan === false) return;

          this.handleMouseDownPan(event);

          this._state = this._STATE.PAN;
        } else {
          if (this.enableRotate === false) return;

          this.handleMouseDownRotate(event);

          this._state = this._STATE.ROTATE;
        }

        break;

      case THREE.MOUSE.PAN:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate === false) return;

          this.handleMouseDownRotate(event);

          this._state = this._STATE.ROTATE;
        } else {
          if (this.enablePan === false) return;
          this.handleMouseDownPan(event);

          this._state = this._STATE.PAN;
        }

        break;

      default:
        this._state = this._STATE.NONE;
    }

    if (this._state !== this._STATE.NONE) {
      document.addEventListener('mousemove', this.onMouseMove, false);
      document.addEventListener('mouseup', this.onMouseUp, false);
    }
  }

  onMouseMove(event) {
    if (this.enabled === false) return;
    event.preventDefault();

    switch (this._state) {
      case this._STATE.ROTATE:
        if (this.enableRotate === false) return;

        this.handleMouseMoveRotate(event);
        break;

      case this._STATE.DOLLY:
        if (this.enableZoom === false) return;

        this.handleMouseMoveDolly(event);
        break;

      case this._STATE.PAN:
        if (this.enablePan === false) return;

        this.handleMouseMovePan(event);
        break;

      default:
        break;
    }
  }

  onMouseUp() {
    if (this.enabled === false) return;
    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);

    this._state = this._STATE.NONE;
  }

  onMouseWheel(event) {
    if (
      this.enabled === false
      || this.enableZoom === false
      || (this._state !== this._STATE.NONE && this._state !== this._STATE.ROTATE)
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.handleMouseWheel(event);
  }

  onKeyDown(event) {
    if (this.enabled === false || this.enableKeys === false || this.enablePan === false) return;

    this.handleKeyDown(event);
  }

  onContextMenu(event) {
    if (this.enabled === false) return;
    event.preventDefault();
  }

  handleMouseDownDolly(event) {
    this._dollyStart.set(event.clientX, event.clientY);
  }

  handleMouseDownPan(event) {
    this._panStart.set(event.clientX, event.clientY);
  }

  handleMouseDownRotate(event) {
    this._rotateStart.set(event.clientX, event.clientY);
  }

  handleMouseMoveRotate(event) {
    this._rotateEnd.set(event.clientX, event.clientY);
    this._rotateDelta
      .subVectors(this._rotateEnd, this._rotateStart)
      .multiplyScalar(this.rotateSpeed);

    const element = this.domElement;

    this.rotateLeft(2 * Math.PI * this._rotateDelta.x / element.clientHeight); // yes, height
    this.rotateUp(2 * Math.PI * this._rotateDelta.y / element.clientHeight);

    this._rotateStart.copy(this._rotateEnd);

    this.update();
    this.render();
  }

  handleMouseMoveDolly(event) {
    this._dollyEnd.set(event.clientX, event.clientY);
    this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart);

    if (this._dollyDelta.y > 0) {
      this.dollyIn(this.getZoomScale());
    } else if (this._dollyDelta.y < 0) {
      this.dollyOut(this.getZoomScale());
    }

    this._dollyStart.copy(this._dollyEnd);

    this.update();
    this.render();
  }

  handleMouseMovePan(event) {
    this._panEnd.set(event.clientX, event.clientY);
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed);

    this.pan(this._panDelta.x, this._panDelta.y);

    this._panStart.copy(this._panEnd);

    this.update();
    this.render();
  }

  handleMouseWheel(event) {
    if (event.deltaY < 0) {
      this.dollyOut(this.getZoomScale());
    } else if (event.deltaY > 0) {
      this.dollyIn(this.getZoomScale());
    }

    this.update();
    this.render();
  }

  handleKeyDown(event) {
    let needsUpdate = false;

    switch (event.keyCode) {
      case this.keys.UP:
        this.pan(0, this.keyPanSpeed);
        needsUpdate = true;
        break;

      case this.keys.BOTTOM:
        this.pan(0, -this.keyPanSpeed);
        needsUpdate = true;
        break;

      case this.keys.LEFT:
        this.pan(this.keyPanSpeed, 0);
        needsUpdate = true;
        break;

      case this.keys.RIGHT:
        this.pan(-this.keyPanSpeed, 0);
        needsUpdate = true;
        break;

      default:
        break;
    }

    if (needsUpdate) {
      event.preventDefault();

      this.update();
      this.render();
    }
  }

  rotateLeft(angle) {
    this._sphericalDelta.theta -= angle;
  }

  rotateUp(angle) {
    this._sphericalDelta.phi -= angle;
  }

  getZoomScale() {
    return 0.95 ** this.zoomSpeed;
  }

  dollyIn(dollyScale) {
    if (this.camera.isPerspectiveCamera) {
      this._scale /= dollyScale;
    } else if (this.camera.isOrthographicCamera) {
      this.camera.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.camera.zoom * dollyScale),
      );
      this.camera.updateProjectionMatrix();
      this._zoomChanged = true;
    } else {
      console.warn('WARNING: camera-control encountered an unknown camera type - dolly/zoom disabled.');
      this.enableZoom = false;
    }
  }

  dollyOut(dollyScale) {
    if (this.camera.isPerspectiveCamera) {
      this._scale *= dollyScale;
    } else if (this.camera.isOrthographicCamera) {
      this.camera.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.camera.zoom / dollyScale),
      );
      this.camera.updateProjectionMatrix();
      this._zoomChanged = true;
    } else {
      console.warn('WARNING: camera-control encountered an unknown camera type - dolly/zoom disabled.');
      this.enableZoom = false;
    }
  }

  pan() {
    const { THREE } = this;
    const offset = new THREE.Vector3();

    return (deltaX, deltaY) => {
      const element = this.domElement;

      if (this.camera.isPerspectiveCamera) {
        // perspective
        const { position } = this.camera;
        offset.copy(position).sub(this.target);
        let targetDistance = offset.length();

        targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);

        this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.camera.matrix);
        this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.camera.matrix);
      } else if (this.camera.isOrthographicCamera) {
        // orthographic
        this.panLeft(
          deltaX * (this.camera.right - this.camera.left) / this.camera.zoom / element.clientWidth,
          this.camera.matrix,
        );
        this.panUp(
          deltaY * (this.camera.top - this.camera.bottom) / this.camera.zoom / element.clientHeight,
          this.camera.matrix,
        );
      } else {
        console.warn('WARNING: camera-control encountered an unknown camera type - pan disabled.');
        this.enablePan = false;
      }
    };
  }

  panLeft() {
    const { THREE } = this;
    const v = new THREE.Vector3();

    return (distance, objectMatrix) => {
      v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
      v.multiplyScalar(-distance);

      this._panOffset.add(v);
    };
  }

  panUp() {
    const { THREE } = this;
    const v = new THREE.Vector3();

    return (distance, objectMatrix) => {
      if (this.screenSpacePanning === true) {
        v.setFromMatrixColumn(objectMatrix, 1);
      } else {
        v.setFromMatrixColumn(objectMatrix, 0);
        v.crossVectors(this.camera.up, v);
      }

      v.multiplyScalar(distance);

      this._panOffset.add(v);
    };
  }
}

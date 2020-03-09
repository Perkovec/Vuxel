export class CameraControl {
  meta = {
    alt: 'Camera control (C)',
    key: 'C',
  }

  constructor(configs) {
    this.cameraControl = configs.plugins['camera-control'];
  }

  enable() {
    this.cameraControl.enabled = true;
  }

  disable() {
    this.cameraControl.enabled = false;
  }

  init() {
    this.cameraControl.enabled = true;
  }

  destroy() {
    this.cameraControl.enabled = false;
  }
}

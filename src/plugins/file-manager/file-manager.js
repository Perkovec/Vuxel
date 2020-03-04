import { exporter } from './exporter';
import { loader } from './loader';

export class FileManager {
  static meta = {
    name: 'file-manager',
  };

  constructor(configs) {
    this.configs = configs;

    const menuItems = document.querySelectorAll('.plugin-file-manager');
    menuItems.forEach((item) => {
      item.addEventListener('click', (event) => this.dispatchEvent(event, item.dataset.event));
    });

    this.fakeLink = document.createElement('a');
    this.fakeLink.style.display = 'none';
    document.body.appendChild(this.fakeLink);

    this.fakeInput = document.createElement('input');
    this.fakeInput.type = 'file';
    this.fakeInput.accept = '.vxl';
    this.fakeInput.style.display = 'none';
    document.body.appendChild(this.fakeInput);

    this.fakeInput.addEventListener('change', (event) => this.fileSelected(event));
  }

  dispatchEvent(event, eventName) {
    switch (eventName) {
      case 'new':
        this.handleNew();
        break;
      case 'save':
        this.handleSave();
        break;
      case 'open':
        this.handleOpen();
        break;
      default:
        break;
    }
  }

  clearScene() {
    const { scene } = this.configs;
    const { sceneObjects } = this.configs;

    scene.remove(...sceneObjects);
    sceneObjects.splice(0, sceneObjects.length);
  }

  handleNew() {
    if (window.confirm('Are you sure you want to create a new file?')) {
      this.clearScene();
      this.configs.render();
    }
  }

  handleSave() {
    const data = exporter(this.configs.sceneObjects);

    const output = JSON.stringify(data, null, 2);
    this.fakeLink.href = URL.createObjectURL(new Blob([output], { type: 'text/plain' }));
    this.fakeLink.download = 'scene.vxl';
    this.fakeLink.click();
  }

  handleOpen() {
    this.fakeInput.click();
  }

  fileSelected(event) {
    const { files } = event.target;
    const { THREE } = this.configs;
    const { scene } = this.configs;
    const { sceneObjects } = this.configs;

    if (files && files.length) {
      const reader = new FileReader();
      reader.readAsText(files[0]);

      reader.onload = () => {
        this.clearScene();

        const data = loader(THREE, reader.result);
        data.forEach((voxel) => {
          scene.add(voxel);
          sceneObjects.push(voxel);
        });

        this.configs.render();
      };
    }

    event.target.value = null;
  }
}

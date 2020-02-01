export class ColorPicker {
  constructor(configs) {
    this.configs = configs;

    this.colorInput = document.getElementById('brush-color-input');

    this.presets = document.querySelectorAll('.brush-color');

    this.colorInput.value = '#' + this.configs.brushMaterial.color.getHexString();

    this.presets.forEach(preset => {
      preset.addEventListener('click', () => {
        this.setBrushColor(preset.dataset.color);
        this.colorInput.value = preset.dataset.color;
      });
    });

    this.colorInput.addEventListener('input', ev => this.setBrushColor(ev.target.value));
  }

  setBrushColor(color) {
    this.configs.brushMaterial.color.setStyle(color);
  }
}
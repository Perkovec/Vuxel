import { AbstractPlugin } from '../core/plugin.abstract';

export class ColorPicker extends AbstractPlugin {
  static meta = {
    name: 'color-picker',
  };

  constructor(configs) {
    super(configs);
    this.plugins = configs.plugins;

    this.avaliableTools = ['single_voxel', 'paint_brush', 'multiple_voxels'];

    this.colorPicker = new window.iro.ColorPicker('#iro-color-picker', {
      width: 240,
      layout: [
        {
          component: window.iro.ui.Box,
        },
        {
          component: window.iro.ui.Slider,
          options: {
            sliderType: 'hue',
          },
        },
      ],
    });
    this.colorPicker.on('input:change', (color) => this.onChangeColor(color));

    this.colorInput = document.getElementById('brush-color-input');
    this.presets = document.querySelectorAll('.brush-color');
    this.containers = document.querySelectorAll('[data-plugin-color-picker]');

    if (this.plugins.tools) {
      if (this.avaliableTools.includes(this.plugins.tools.currentToolName)) {
        const color = this.plugins.tools.currentTool.mainMaterial.color.getHexString();
        this.colorInput.value = `#${color}`;
        this.colorPicker.color.hexString = `#${color}`;
      }
      this.setupListeners();
    } else {
      console.warn('Color picker plugin could not find Tools plugin.');
      this.hide();
    }

    this.presets.forEach((preset) => {
      preset.addEventListener('click', () => {
        this.setBrushColor(preset.dataset.color);
        this.colorInput.value = preset.dataset.color;
        this.colorPicker.color.hexString = preset.dataset.color;
      });
    });

    this.colorInput.addEventListener('input', (ev) => this.setBrushColor(ev.target.value));
  }

  hide() {
    this.containers.forEach((container) => {
      container.style.display = 'none';
    });
  }

  show() {
    this.containers.forEach((container) => {
      container.style.display = 'block';
    });
  }

  onChangeColor(color) {
    this.setBrushColor(color.hexString);
    this.colorInput.value = color.hexString;
  }

  setupListeners() {
    const toolsPlugin = this.plugins.tools;

    toolsPlugin.on('tool_initialized', (toolName, tool) => {
      if (this.avaliableTools.includes(toolName)) {
        const color = tool.mainMaterial.color.getHexString();
        this.colorInput.value = `#${color}`;
        this.colorPicker.color.hexString = color;
        this.show();
      } else {
        this.hide();
      }
    });
  }

  setBrushColor(color) {
    this.plugins.tools.currentTool.mainMaterial.color.setStyle(color);
  }
}

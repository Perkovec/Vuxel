import { AbstractPlugin } from '../../core/plugin.abstract';
import { SingleVoxel } from './single-voxel';
import { RemoveVoxel } from './remove-voxel';
import { CameraControl } from './camera-control';
import { PaintBrush } from './paint-brush';

export class Tools extends AbstractPlugin {
  static meta = {
    name: 'tools',
  };

  onInit() {
    this.toolInstances = {
      single_voxel: new SingleVoxel(this.configs),
      remove_voxel: new RemoveVoxel(this.configs),
      camera_control: new CameraControl(this.configs),
      paint_brush: new PaintBrush(this.configs),
    };

    this.tools = document.querySelectorAll('.tool-item');
    this.currentTool = null;
    this.currentToolName = null;

    this.tools.forEach((tool) => {
      const toolName = tool.dataset.tool;
      tool.addEventListener('click', () => {
        this.setTool(tool);
      });

      const toolInstance = this.toolInstances[toolName];
      if (toolInstance && toolInstance.meta && toolInstance.meta.alt) {
        window.tippy(tool, {
          delay: [500, 250],
          placement: 'top',
          content: toolInstance.meta.alt,
        });
      }
    });

    this.setTool(this.tools[0]);
  }

  disable() {
    if (this.currentTool && this.currentTool.disable) {
      this.currentTool.disable();
    }
  }

  enable() {
    if (this.currentTool && this.currentTool.enable) {
      this.currentTool.enable();
    }
  }

  setTool(tool) {
    const toolName = tool.dataset.tool;

    const currentToolEl = document.querySelector('.tool-item.active');
    if (currentToolEl) {
      currentToolEl.classList.remove('active');
    }

    if (this.currentTool && this.currentTool.destroy) {
      this.currentTool.destroy();
      this.currentToolName = null;
      this.emit('tool_destroyed');
    }

    this.currentTool = this.toolInstances[toolName];
    this.currentToolName = toolName;
    if (this.currentTool && this.currentTool.init) {
      tool.classList.add('active');
      this.currentTool.init();
      this.emit('tool_initialized', toolName, this.currentTool);
    }
  }
}

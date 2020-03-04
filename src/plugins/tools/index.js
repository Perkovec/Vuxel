import EventEmitter from 'event-lite';
import { SingleVoxel } from './single-voxel';
import { RemoveVoxel } from './remove-voxel';

export class Tools extends EventEmitter {
  static meta = {
    name: 'tools',
  };

  constructor(configs) {
    super();
    this.configs = configs;

    this.toolInstances = {
      single_voxel: new SingleVoxel(configs),
      remove_voxel: new RemoveVoxel(configs),
    };

    this.tools = document.querySelectorAll('.tool-item');
    this.currentTool = null;
    this.currentToolName = null;

    this.tools.forEach((tool) => {
      tool.addEventListener('click', () => {
        this.setTool(tool.dataset.tool);
      });
    });

    this.setTool(this.tools[0].dataset.tool);
  }

  setTool(toolName) {
    if (this.currentTool && this.currentTool.destroy) {
      this.currentTool.destroy();
      this.currentToolName = null;
      this.emit('tool_disabled');
    }

    this.currentTool = this.toolInstances[toolName];
    this.currentToolName = toolName;
    if (this.currentTool && this.currentTool.init) {
      this.currentTool.init();
      this.emit('tool_enabled', toolName, this.currentTool);
    }
  }
}

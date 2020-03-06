import EventEmitter from 'event-lite';

export class AbstractPlugin extends EventEmitter {
  constructor(configs) {
    super();
    this.configs = configs;

    configs.store.on('@init/plugins', () => {
      this.onInit();
    });
  }

  onInit() {}
}

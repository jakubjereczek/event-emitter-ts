type EventMap = {
  [key: string]: any;
}
type EventNames<T extends EventMap> = keyof T & string;
type EventReceiver<T> = (params: T) => void;

class Emittable<T extends EventMap> {
  private listeners: {
    [K in keyof T]?: Array<EventReceiver<T[K]>>;
  } = {};

  public addEventListener<K extends EventNames<T>>(
    eventName: K,
    fn: EventReceiver<T[K]>
  ) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(fn);
  }

  public removeEventListener<K extends EventNames<T>>(
    eventName: K,
    fn: EventReceiver<T[K]>
  ) {
    const eventListeners = this.listeners[eventName];
    if (eventListeners) {
      this.listeners[eventName] = eventListeners.filter(listener => listener !== fn);
    }
  }

  public emit<K extends EventNames<T>>(eventName: K, params: T[K]) {
    const eventListeners = this.listeners[eventName];
    if (eventListeners) {
      eventListeners.forEach(listener => {
        listener(params);
      });
    }
  }
}

// An example:
type PlayerEventMap = {
  load: boolean;
  start: {
    timestamp: number;
    bitrate: number;
  };
  stop: number;
};

class Player extends Emittable<PlayerEventMap> {
  private isError: boolean = false;

  constructor() {
    super();
    this.emit('load', true);
    this.onPlay();
  }

  private onPlay() {
    setInterval(() => {
      if (!this.isError) {
        const startEventParams = {
          timestamp: new Date().valueOf(),
          bitrate: 0,
        };
        this.emit('start', startEventParams);
      }
    }, 1000);
    setTimeout(() => {
      this.isError = true;
      this.onStop();
    }, 10000);
  }

  private onStop() {
    const stopEventParams = new Date().valueOf();
    this.emit('stop', stopEventParams);
  }
}

const player = new Player();

player.addEventListener('start', (params) => {
  console.debug('onStart', params);
});

player.addEventListener('stop', (params) => {
  console.debug('onStop', params);
});

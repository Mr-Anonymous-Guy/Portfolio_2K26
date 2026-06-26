import Emitter from './Emitter';
import { gsap } from 'gsap';

type TickerCallbackEntry = {
  callback: Function;
  context: any;
};

class Ticker {
  callbacks: TickerCallbackEntry[];
  delta: number;
  private tickBound: ((time: number, delta: number) => void) | null;
  private initialized: boolean;

  /**
   * Constructor
   */
  constructor () {
    this.callbacks = [];
    this.delta = 0;
    this.tickBound = null;
    this.initialized = false;
  }

  /**
   * Init
   */
  init () {
    if (this.initialized) return;
    this.initialized = true;
    this.tickBound = this.tick.bind(this);
    gsap.ticker.add(this.tickBound);
  }

  /**
   * Tick
   */
  tick(time: number, delta: number) {
    this.delta = delta;

    // Shallow copy of active callbacks and clear the queue
    const list = [...this.callbacks];
    this.callbacks = [];

    list.forEach((object) => {
      if (object) {
        object.callback.apply(object.context);
      }
    });

    Emitter.emit('tick', time * 1000);
  }

  /**
   * Next tick
   */
  nextTick (callback: Function, context: any) {
    this.callbacks.push({
      callback,
      context
    });
  }

  /**
   * Destroy
   */
  destroy() {
    if (!this.initialized) return;
    if (this.tickBound) {
      gsap.ticker.remove(this.tickBound);
      this.tickBound = null;
    }
    this.callbacks = [];
    this.initialized = false;
  }
}

export default new Ticker();

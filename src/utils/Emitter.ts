type CallbackEntry = {
  cb: Function;
  context: any;
  once: boolean;
};

class Emitter {
  private events: Record<string, CallbackEntry[]> = {};

  /**
   * Constructor
   */
  constructor () {
    this.events = {};
  }

  /**
   * Attach handler to event
   * @param {String} name Event name
   * @param {Function} callback Handler function
   * @param {Object} context Context
   * @param {Boolean} once Call handler only once
   */
  on(name: string, callback: Function, context: any, once = false) {
    if (!this.events[name]) {
      this.events[name] = [];
    }

    let exists = false;
    this.events[name].forEach((object) => {
      if (object.cb === callback && object.context === context) {
        exists = true;
        return;
      }
    });
    if (exists) {
      return;
    }

    this.events[name].push({
      cb: callback,
      context: context,
      once: once
    });
  }

  /**
   * Single event handler
   * @param {String} name Event name
   * @param {Function} callback Handler function
   * @param {Object} context Context
   */
  once (name: string, callback: Function, context: any) {
    this.on(name, callback, context, true);
  }

  /**
   * Emit event
   * @param {String} name Event Name
   */
  emit (name: string, ...args: any[]) {
    const data = args;

    if (this.events[name]) {
      // Create a shallow copy to prevent mutation issues if a listener calls off() mid-emit
      const list = [...this.events[name]];
      list.forEach((object) => {
        if (object) {
          object.cb.apply(object.context, data);

          if (object.once) {
            const idx = this.events[name].indexOf(object);
            if (idx !== -1) {
              this.events[name].splice(idx, 1);
            }
          }
        }
      });
    }
  }

  /**
   * Detach handler from event
   * @param {String} name Event name
   * @param {Function} callback Handler function
   * @param {Object} context Context
   */
  off (name: string, callback: Function, context: any) {
    if (this.events[name]) {
      this.events[name] = this.events[name].filter(
        (object) => !(object.cb === callback && object.context === context)
      );
    }
  }
}

export default new Emitter();

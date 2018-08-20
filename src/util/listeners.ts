import { Disposable } from '../types';

/**
 * @internal
 */
export class Listeners<F extends Function> extends Set<F> {

  constructor() {
    super();
  }

  register(listener: F): Disposable {
    this.add(listener);
    return {
      dispose: () => this.delete(listener),
    };
  }

}

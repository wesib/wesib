import { Disposable } from '../types';

/**
 * @internal
 */
export class Listeners<F extends Function> {

  readonly all = new Set<F>();

  add(listener: F): Disposable {
    this.all.add(listener);
    return {
      dispose: () => this.all.delete(listener),
    };
  }

  forEach(action: (listener: F) => void) {
    this.all.forEach(action);
  }

}

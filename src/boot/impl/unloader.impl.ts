import { itsEach, overArray } from 'a-iterable';
import { eventSupply } from 'fun-events';

/**
 * @internal
 */
export class Unloader {

  private readonly _unloads: (() => void)[] = [];
  readonly supply = eventSupply(() => {
    itsEach(
        overArray(this._unloads).reverse(),
        unload => unload(),
    );
    this._unloads.length = 0;
  });

  add(unload: () => void): () => void {
    this._unloads.push(unload);
    return unload;
  }

}

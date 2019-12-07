import { itsEach, overArray } from 'a-iterable';

/**
 * @internal
 */
export class Unloader {

  private readonly _unloads: (() => void)[] = [];

  add(unload: () => void): () => void {
    this._unloads.push(unload);
    return unload;
  }

  unload() {
    itsEach(
        overArray(this._unloads).reverse(),
        unload => unload(),
    );
  }
}

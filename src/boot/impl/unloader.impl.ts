import { EventSupply, eventSupply } from '@proc7ts/fun-events';
import { noop, valueProvider } from '@proc7ts/primitives';
import { itsEach, reverseArray } from '@proc7ts/push-iterator';

/**
 * @internal
 */
export interface Unloader {
  readonly supply: EventSupply;
  add(adder: () => () => void): () => void;
}

const doNotAdd = valueProvider(noop);

/**
 * @internal
 */
export function newUnloader(): Unloader {

  const unloads: (() => void)[] = [];
  let add = (adder: () => () => void): () => void => {

    const unload = adder();

    unloads.push(unload);

    return unload;
  };
  const supply = eventSupply(() => {
    add = doNotAdd;
    itsEach(
        reverseArray(unloads),
        unload => unload(),
    );
    unloads.length = 0;
  });

  return {
    supply,
    add(adder) {
      return add(adder);
    },
  };
}

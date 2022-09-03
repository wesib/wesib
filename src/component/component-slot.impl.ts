import {
  AfterEvent,
  AfterEvent__symbol,
  digOn_,
  mapAfter,
  onceOn,
  OnEvent,
  trackValue,
} from '@proc7ts/fun-events';
import { noop, valueProvider } from '@proc7ts/primitives';
import { neverSupply, Supply } from '@proc7ts/supply';
import { ComponentContext } from './component-context';
import { ComponentSlot } from './component-slot';

interface ComponentSlot$Provider<T extends object> {
  get(): ComponentContext<T> | undefined;
  unbind(): void;
  rebind(): ComponentContext<T> | undefined;
  drop(): void;
}

const ComponentSlot$empty: ComponentSlot$Provider<any> = {
  get: noop,
  unbind: noop,
  rebind: noop,
  drop: noop,
};

/**
 * @internal
 */
export class ComponentSlot$<T extends object> implements ComponentSlot<T> {

  readonly _provider = trackValue<ComponentSlot$Provider<T>>(
    ComponentSlot$empty as ComponentSlot$Provider<T>,
  );

  readonly read: AfterEvent<[ComponentContext<T>?]>;
  readonly whenReady: OnEvent<[ComponentContext<T>]>;

  constructor() {
    this.read = this._provider.read.do(mapAfter(provider => provider.get()));
    this.whenReady = this.read.do(
      digOn_(ctx => ctx && ctx.whenReady),
      onceOn,
    );
  }

  get context(): ComponentContext<T> | undefined {
    return this._provider.it.get();
  }

  [AfterEvent__symbol](): AfterEvent<[ComponentContext<T>?]> {
    return this.read;
  }

  bind(context: ComponentContext<T>): void {
    this._provider.it.drop();
    this._provider.it = ComponentSlot$known(this, context);
  }

  bindBy(binder: ComponentSlot.Binder<T>): void {
    this._provider.it.drop();
    this._provider.it = ComponentSlot$bound(this, binder);
  }

  unbind(): void {
    this._provider.it.unbind();
  }

  rebind(): ComponentContext<T> | undefined {
    return this.context || this._provider.it.rebind();
  }

}

function ComponentSlot$known<T extends object>(
  slot: ComponentSlot$<T>,
  context: ComponentContext<T>,
): ComponentSlot$Provider<T> {
  context.supply.whenOff(() => {
    if (slot.context === context) {
      slot.unbind();
    }
  });

  const get = (): ComponentContext<T> | undefined => context;

  return {
    get,
    unbind() {
      slot._provider.it = ComponentSlot$empty;
    },
    rebind: get,
    drop: noop,
  };
}

function ComponentSlot$bound<T extends object>(
  slot: ComponentSlot$<T>,
  binder: ComponentSlot.Binder<T>,
): ComponentSlot$Provider<T> {
  let supply = neverSupply();
  let getContext: () => ComponentContext<T> | undefined = noop;
  const get = (): ComponentContext<T> | undefined => getContext();
  const newSupply = (): Supply => (supply = new Supply(() => {
      getContext = noop;
    }));
  let bind = (context: ComponentContext<T>): Supply => {
    getContext = valueProvider(context);
    context.supply.whenOff(() => {
      if (slot.context === context) {
        slot.unbind();
      }
    });

    return newSupply();
  };
  const drop = (): void => {
    bind = _ => neverSupply();
    supply.off();
  };
  const unbind = (): void => {
    supply.off();
    slot._provider.it = {
      get,
      unbind,
      rebind,
      drop,
    };
  };

  const bindContext = (): void => binder({
      bind: context => bind(context),
    });

  getContext = () => {
    bindContext();

    // Subsequent bind calls update the component provider
    bind = context => {
      supply.off();
      getContext = valueProvider(context);
      slot._provider.it = {
        get,
        unbind,
        rebind,
        drop,
      };

      return newSupply();
    };

    return getContext();
  };

  const rebind = (): ComponentContext<T> | undefined => {
    bindContext();

    return getContext();
  };

  return {
    get,
    unbind,
    rebind,
    drop,
  };
}

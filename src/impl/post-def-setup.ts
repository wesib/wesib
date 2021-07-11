import { EventEmitter, onAny, OnEvent, onEventBy, supplyOn, trackValue, valueOn } from '@proc7ts/fun-events';
import { AbstractClass, asis, hasOwnProperty, superClassOf } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { ComponentDef__symbol } from '../component';
import { ComponentClass, DefinitionSetup } from '../component/definition';

export function onPostDefSetup(
    componentType: ComponentClass,
    supply: Supply,
): OnEvent<[DefinitionSetup]> {

  const { on } = postDefSetup(componentType);

  return onEventBy(receiver => {
    on({
      supply: receiver.supply.needs(supply),
      receive(ctx, setup) {

        const whenReady = setup.whenReady.do(supplyOn(supply));
        const whenComponent = setup.whenComponent.do(supplyOn(supply));

        receiver.receive(ctx, {
          get componentType() {
            return setup.componentType;
          },
          get whenReady() {
            return whenReady;
          },
          get whenComponent() {
            return whenComponent;
          },
          perDefinition(asset) {
            return setup.perDefinition(asset).needs(supply);
          },
          perComponent(asset) {
            return setup.perComponent(asset).needs(supply);
          },
        });
      },
    });
  });
}

interface PostDefSetup<T extends object = any> {
  readonly on: OnEvent<[DefinitionSetup<T>]>;
  send(setup: DefinitionSetup): void;
  setup(setup: DefinitionSetup<T>): void;
}

const PostDefSetup__symbol = (/*#__PURE__*/ Symbol('PostDefSetup'));

interface PostDefComponentClass<T extends object> extends AbstractClass<T> {
  [PostDefSetup__symbol]?: PostDefSetup<T>;
}

export function postDefSetup<T extends object>(componentType: PostDefComponentClass<T>): PostDefSetup<T> {
  if (hasOwnProperty(componentType, PostDefSetup__symbol)) {
    return componentType[PostDefSetup__symbol] as PostDefSetup<T>;
  }

  const tracker = trackValue<DefinitionSetup<T>>();
  const emitter = new EventEmitter<[DefinitionSetup]>();
  const onSetup: OnEvent<[DefinitionSetup<T>]> = tracker.read.do(valueOn(asis));
  const on = onAny(onSetup, emitter);
  const superType = superClassOf(componentType, type => ComponentDef__symbol in type);

  if (superType) {

    const superPostDefSetup = postDefSetup(superType);

    on(setup => superPostDefSetup.send(setup));
  }

  const result: PostDefSetup<T> = {
    on,
    send(setup) {
      emitter.send(setup);
    },
    setup(setup) {
      tracker.it = setup;
    },
  };

  Reflect.defineProperty(componentType, PostDefSetup__symbol, { value: result });

  return result;
}

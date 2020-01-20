import { nextArgs, nextSkip } from 'call-thru';
import { EventEmitter, onAny, OnEvent, onEventBy, trackValue } from 'fun-events';
import { superClassOf } from '../../common';
import { ComponentDef__symbol } from '../../component';
import { ComponentClass, DefinitionSetup } from '../../component/definition';
import { Unloader } from './unloader.impl';

/**
 * @internal
 */
export function onPostDefSetup(
    componentType: ComponentClass,
    unloader: Unloader,
): OnEvent<[DefinitionSetup]> {

  const { on } = postDefSetup(componentType);

  return onEventBy(receiver => {
    on({
      supply: receiver.supply.needs(unloader.supply),
      receive(ctx, setup) {

        const whenReady = setup.whenReady.tillOff(unloader.supply);
        const whenComponent = setup.whenComponent.tillOff(unloader.supply);

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
          perDefinition(spec) {
            return unloader.add(() => setup.perDefinition(spec));
          },
          perComponent(spec) {
            return unloader.add(() => setup.perComponent(spec));
          },
        });
      },
    });
  });
}

/**
 * @internal
 */
export interface PostDefSetup<T extends object = any> {
  readonly on: OnEvent<[DefinitionSetup<T>]>;
  send(setup: DefinitionSetup): void;
  setup(setup: DefinitionSetup<T>): void;
}

const PostDefSetup__symbol = (/*#__PURE__*/ Symbol('post-def-setup'));

/**
 * @internal
 */
export function postDefSetup<T extends object>(componentType: ComponentClass<T>): PostDefSetup<T> {
  // eslint-disable-next-line no-prototype-builtins
  if (componentType.hasOwnProperty(PostDefSetup__symbol)) {
    return (componentType as any)[PostDefSetup__symbol];
  }

  const tracker = trackValue<DefinitionSetup<T>>();
  const emitter = new EventEmitter<[DefinitionSetup]>();
  const onSetup: OnEvent<[DefinitionSetup<T>]> = tracker.read.thru(setup => setup ? nextArgs(setup) : nextSkip());
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

  Object.defineProperty(componentType, PostDefSetup__symbol, { value: result });

  return result;
}

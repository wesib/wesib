import { nextArgs, nextSkip } from 'call-thru';
import { OnEvent, onEventBy, trackValue } from 'fun-events';
import { Unloader } from '../../boot/impl';
import { ComponentDef } from '../../component';
import { ComponentClass, DefinitionSetup } from '../../component/definition';

/**
 * @internal
 */
export function onFeaturedDefSetup(
    componentType: ComponentClass,
    unloader: Unloader,
): OnEvent<[DefinitionSetup]> {

  const onSetup = featuredDefSetup(componentType);

  return onEventBy(receiver => {
    onSetup({
      supply: receiver.supply.needs(unloader.supply),
      receive(ctx, setup) {

        const whenReady = setup.whenReady.tillOff(unloader.supply);

        receiver.receive(ctx, {
          get componentType() {
            return setup.componentType;
          },
          get whenReady() {
            return whenReady;
          },
          perDefinition(spec) {
            return unloader.add(setup.perDefinition(spec));
          },
          perComponent(spec) {
            return unloader.add(setup.perComponent(spec));
          },
        });
      },
    });
  });

}

const FeaturedDefSetup__symbol = /*#__PURE__*/ Symbol('featured-def-setup');

function featuredDefSetup(componentType: ComponentClass): OnEvent<[DefinitionSetup]> {
  if (componentType.hasOwnProperty(FeaturedDefSetup__symbol)) {
    return (componentType as any)[FeaturedDefSetup__symbol];
  }

  const tracker = trackValue<DefinitionSetup>();
  const onSetup: OnEvent<[DefinitionSetup]> = tracker.read.thru(setup => setup ? nextArgs(setup) : nextSkip());

  Object.defineProperty(componentType, FeaturedDefSetup__symbol, { value: onSetup });
  ComponentDef.define(componentType, {
    setup(setup) {
      tracker.it = setup;
    },
  });

  return onSetup;
}

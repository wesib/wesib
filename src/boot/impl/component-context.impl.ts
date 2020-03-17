import { nextArgs, nextSkip } from 'call-thru';
import { ContextRegistry } from 'context-values';
import {
  EventEmitter,
  EventReceiver,
  eventSupply,
  EventSupply,
  EventSupply__symbol,
  eventSupplyOf,
  OnEvent,
  trackValue,
} from 'fun-events';
import { ComponentContext, ComponentContext__symbol, ComponentEvent } from '../../component';
import { ComponentClass } from '../../component/definition';
import { WhenComponent } from './when-component.impl';

const enum ComponentStatus {
  Building,
  Ready,
  Off,
  On,
}

/**
 * @internal
 */
export abstract class ComponentContext$<T extends object> extends ComponentContext<T> {

  readonly get: ComponentContext<T>['get'];
  private _status = trackValue<ComponentStatus>(ComponentStatus.Building);
  private readonly _destructionReason = trackValue<[any] | undefined>();

  constructor(
      readonly element: any,
      readonly componentType: ComponentClass<T>,
      createRegistry: () => ContextRegistry<ComponentContext<T>>,
      readonly elementSuper: (name: PropertyKey) => any,
  ) {
    super();

    const registry = createRegistry();

    registry.provide({ a: ComponentContext, is: this });
    this.get = registry.newValues().get;

    eventSupplyOf(this._status).whenOff(reason => this._destructionReason.it = [reason]);
  }

  get component(): T {
    throw new Error('The component is not constructed yet. Consider to use a `whenReady()` callback');
  }

  get connected(): boolean {
    return this._status.it === ComponentStatus.On;
  }

  get [EventSupply__symbol](): EventSupply {
    return eventSupplyOf(this._status);
  }

  whenReady(): OnEvent<[this]>;
  whenReady(receiver: EventReceiver<[this]>): EventSupply;
  whenReady(receiver?: EventReceiver<[this]>): OnEvent<[this]> | EventSupply {
    return (this.whenReady = this._status.read().thru(sts => sts ? nextArgs(this) : nextSkip()).once().F)(receiver);
  }

  whenOn(): OnEvent<[EventSupply]>;
  whenOn(receiver: EventReceiver<[EventSupply]>): EventSupply;
  whenOn(receiver?: EventReceiver<[EventSupply]>): OnEvent<[EventSupply]> | EventSupply {
    return (this.whenOn = this._status.read().thru_(
        status => {
          if (status !== ComponentStatus.On) {
            return nextSkip();
          }

          const offSupply = eventSupply();

          this.whenOff().once(() => offSupply.off()).cuts(offSupply);

          return nextArgs(offSupply);
        },
    ).F)(receiver);
  }

  whenOff(): OnEvent<[]>;
  whenOff(receiver: EventReceiver<[]>): EventSupply;
  whenOff(receiver?: EventReceiver<[]>): EventSupply | OnEvent<[]> {
    return (this.whenOff = this._status.read().thru_(
        sts => sts === ComponentStatus.Off ? nextArgs() : nextSkip(),
    ).F)(receiver);
  }

  whenDestroyed(): OnEvent<[any]>;
  whenDestroyed(receiver: EventReceiver<[any]>): EventSupply;
  whenDestroyed(receiver?: EventReceiver<[any]>): OnEvent<[any]> | EventSupply {
    return (this.whenDestroyed = this._destructionReason.read().thru(
        reason => reason ? nextArgs(reason[0]) : nextSkip(),
    ).once().F)(receiver);
  }

  destroy(reason?: any): void {
    this._status.done(reason);
  }

  _createComponent(
      whenComponent: WhenComponent<T>,
      components: EventEmitter<[ComponentContext]>,
  ): this {

    let lastRev = 0;

    this.whenDestroyed(() => removeElement(this));

    Object.defineProperty(this.element, ComponentContext__symbol, { value: this });

    whenComponent.readNotifier.once(notifier => lastRev = notifier(this, lastRev));
    this.whenOn(supply => {
      whenComponent.readNotifier.to({
        supply,
        receive: (_, notifier) => {
          lastRev = notifier(this, lastRev);
        },
      });
    });
    components.send(this);

    const component = newComponent(this.componentType, this);

    Object.defineProperty(this, 'component', {
      configurable: true,
      enumerable: true,
      value: component,
    });

    this._status.it = ComponentStatus.Ready;

    return this;
  }

  _connect(connect: boolean): void {
    this._status.it = connect ? ComponentStatus.On : ComponentStatus.Off;
  }

  _created(): void {
    this.whenOn().once(
        () => this.dispatchEvent(new ComponentEvent('wesib:component', { bubbles: true })),
    );
  }

}

/**
 * Creates new component of the given type.
 *
 * It makes component context available under `[ComponentContext__symbol]` key in constructed component.
 * The component context is also available inside component constructor by temporarily assigning it to component
 * prototype.
 *
 * @typeparam T  A type of component.
 * @param type  Component class constructor.
 * @param context  Target component context.
 */
function newComponent<T extends object>(type: ComponentClass<T>, context: ComponentContext<T>): T {

  const proto = type.prototype as any;
  const prevContext = proto[ComponentContext__symbol];

  proto[ComponentContext__symbol] = context;
  try {

    const component = new type(context);

    Object.defineProperty(component, ComponentContext__symbol, { value: context });

    return component;
  } finally {
    proto[ComponentContext__symbol] = prevContext;
  }
}

function removeElement(context: ComponentContext): void {

  const { element, mount } = context;

  if (mount) {
    mount.connected = false; // Disconnect mounted element
  }

  const parentNode: Element = element.parentElement;

  if (parentNode) {
    parentNode.removeChild(element);
  }
}

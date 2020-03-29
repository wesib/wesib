import { nextArg, nextArgs, nextSkip, valueProvider } from '@proc7ts/call-thru';
import {
  EventReceiver,
  eventSupply,
  EventSupply,
  EventSupply__symbol,
  eventSupplyOf,
  OnEvent,
  trackValue,
} from '@proc7ts/fun-events';
import { ComponentContext, ComponentContext__symbol, ComponentEvent } from '../../component';
import { ComponentClass } from '../../component/definition';
import { DefinitionContext$ } from './definition-context.impl';

const enum ComponentStatus {
  Building,
  Ready,
  Connected,
}

/**
 * @internal
 */
export abstract class ComponentContext$<T extends object> extends ComponentContext<T> {

  readonly get: ComponentContext<T>['get'];
  private _status = trackValue<ComponentStatus>(ComponentStatus.Building);

  constructor(
      readonly _definitionContext: DefinitionContext$<T>,
      readonly element: any,
      readonly elementSuper: (name: PropertyKey) => any,
  ) {
    super();

    const registry = _definitionContext._newComponentRegistry();

    registry.provide({ a: ComponentContext, is: this });
    this.get = registry.newValues().get;
  }

  get componentType(): ComponentClass<T> {
    return this._definitionContext.componentType;
  }

  get component(): T {
    return this._component();
  }

  get connected(): boolean {
    return this._status.it === ComponentStatus.Connected && !eventSupplyOf(this).isOff;
  }

  get [EventSupply__symbol](): EventSupply {
    return eventSupplyOf(this._status);
  }

  _component(): T {
    throw new TypeError('Component is not constructed yet. Consider to use a `whenReady()` callback');
  }

  whenReady(): OnEvent<[this]>;
  whenReady(receiver: EventReceiver<[this]>): EventSupply;
  whenReady(receiver?: EventReceiver<[this]>): OnEvent<[this]> | EventSupply {
    return (this.whenReady = this._status.read().thru(sts => sts ? nextArgs(this) : nextSkip()).once().F)(receiver);
  }

  whenConnected(): OnEvent<[this]>;
  whenConnected(receiver: EventReceiver<[this]>): EventSupply;
  whenConnected(receiver?: EventReceiver<[this]>): OnEvent<[this]> | EventSupply {
    return (this.whenConnected = this._status.read().thru_(
        status => status === ComponentStatus.Connected ? nextArg(this) : nextSkip(),
    ).once().F)(receiver);
  }

  destroy(reason?: any): void {
    try {
      this._status.done(reason);
    } finally {
      delete (this.component as any)[ComponentContext__symbol];
      delete this.element[ComponentContext__symbol];
      this._component = componentDestroyed;
      removeElement(this.element);
    }
  }

  _createComponent(): this {

    const whenComponent = this._definitionContext._whenComponent;

    let lastRev = 0;

    this.element[ComponentContext__symbol] = this;
    whenComponent.readNotifier.once(notifier => lastRev = notifier(this, lastRev));
    this.whenConnected(() => {
      whenComponent.readNotifier.to({
        supply: eventSupply().needs(this),
        receive: (_, notifier) => {
          lastRev = notifier(this, lastRev);
        },
      });
    });
    this._definitionContext._elementBuilder.components.send(this);

    const component = newComponent(this);

    this._component = valueProvider(component);
    this._status.it = ComponentStatus.Ready;

    return this;
  }

  _connect(): void {
    this._status.it = ComponentStatus.Connected;
  }

  _created(): void {
    this.whenConnected(
        () => this.dispatchEvent(new ComponentEvent('wesib:component', { bubbles: true })),
    );
  }

}

function newComponent<T extends object>(context: ComponentContext<T>): T {

  const type = context.componentType;
  const proto = type.prototype as any;
  const prevContext = proto[ComponentContext__symbol];

  proto[ComponentContext__symbol] = context;
  try {

    const component = new type(context);

    (component as any)[ComponentContext__symbol] = context;

    return component;
  } finally {
    proto[ComponentContext__symbol] = prevContext;
  }
}

function removeElement(element: Element): void {

  const { parentNode } = element;

  if (parentNode) {
    parentNode.removeChild(element);
  }
}

function componentDestroyed(): never {
  throw new TypeError('Component destroyed already');
}

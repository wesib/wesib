import { onceOn, OnEvent, trackValue, valueOn_ } from '@proc7ts/fun-events';
import { Supply, valueProvider } from '@proc7ts/primitives';
import { ComponentContext, ComponentContext__symbol, ComponentContextHolder, ComponentEvent } from '../../component';
import { ComponentClass } from '../../component/definition';
import { newComponent } from '../../component/definition/component.impl';
import { DefinitionContext$ } from './definition-context.impl';

const enum ComponentStatus {
  Building,
  Ready,
  Built,
  Settled,
  Connected,
}

/**
 * @internal
 */
export abstract class ComponentContext$<T extends object> extends ComponentContext<T> {

  readonly whenReady: OnEvent<[this]>;
  readonly whenSettled: OnEvent<[this]>;
  readonly whenConnected: OnEvent<[this]>;
  readonly get: ComponentContext<T>['get'];
  private _status = trackValue<ComponentStatus>(ComponentStatus.Building);

  constructor(
      readonly _definitionContext: DefinitionContext$<T>,
      readonly element: any,
  ) {
    super();

    this.whenReady = this._status.read.do(
        valueOn_(status => !!status && this),
        onceOn,
    );
    this.whenSettled = this._status.read.do(
        valueOn_(status => status >= ComponentStatus.Settled && this),
        onceOn,
    );
    this.whenConnected = this._status.read.do(
        valueOn_(status => status >= ComponentStatus.Connected && this),
        onceOn,
    );

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

  get settled(): boolean {
    return this._status.it >= ComponentStatus.Settled && !this.supply.isOff;
  }

  get connected(): boolean {
    return this._status.it >= ComponentStatus.Connected && !this.supply.isOff;
  }

  get supply(): Supply {
    return this._status.supply;
  }

  _component(): T {
    throw new TypeError('Component is not constructed yet. Consider to use a `whenReady()` callback');
  }

  settle(): void {
    if (this._status.it === ComponentStatus.Built) {
      // Prevent settling until exiting custom element constructor
      this._status.it = ComponentStatus.Settled;
    }
  }

  destroy(reason?: any): void {
    try {
      this._status.supply.off(reason);
    } finally {
      delete (this.component as ComponentContextHolder)[ComponentContext__symbol];
      delete (this.element as ComponentContextHolder)[ComponentContext__symbol];
      this._component = componentDestroyed;
      removeElement(this.element);
    }
  }

  _createComponent(): this {

    const whenComponent = this._definitionContext._whenComponent;

    let lastRev = 0;

    (this.element as ComponentContextHolder)[ComponentContext__symbol] = valueProvider(this);
    whenComponent.readNotifier.do(onceOn)(notifier => lastRev = notifier(this, lastRev));
    this.whenConnected(() => {
      whenComponent.readNotifier({
        supply: new Supply().needs(this),
        receive: (_, notifier) => {
          lastRev = notifier(this, lastRev);
        },
      });
    });
    this._definitionContext._elementBuilder.components.send(this);

    const component = newComponent(this);

    this._component = valueProvider(component);
    this._status.it = ComponentStatus.Ready; // Issue `whenReady` event

    return this;
  }

  _connect(): void {
    this._status.it = ComponentStatus.Connected;
  }

  _created(): void {
    if (this._status.it < ComponentStatus.Built) { // Mounted component can be connected already
      this._status.it = ComponentStatus.Built; // Can settle now
    }
    this.whenConnected(
        () => this.dispatchEvent(new ComponentEvent('wesib:component', { bubbles: true })),
    );
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

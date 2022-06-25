import { OnDomEvent } from '@frontmeans/dom-events';
import { CxBuilder, CxPeerBuilder } from '@proc7ts/context-builder';
import { CxAccessor, CxEntry, cxEvaluated, cxScoped } from '@proc7ts/context-values';
import { AfterEvent, onceOn, OnEvent, StatePath } from '@proc7ts/fun-events';
import { valueProvider } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { BootstrapContext } from '../boot';
import {
  ComponentContext,
  ComponentContext__symbol,
  ComponentEventDispatcher,
  ComponentInstance,
  ContentRoot,
  StateUpdater,
} from '../component';
import { ComponentClass } from '../component/definition';
import { newComponent } from '../component/definition/component.impl';
import { ComponentStatus } from './component-status';
import { DefinitionContext$ } from './definition-context';

export const PerComponentCxPeer: CxEntry<CxPeerBuilder<ComponentContext>> = {
  perContext: (/*#__PURE__*/ cxScoped(
      BootstrapContext,
      (/*#__PURE__*/ cxEvaluated(_target => new CxPeerBuilder())),
  )),
  toString: (): string => '[PerComponentCxPeer]',
};

export abstract class ComponentContext$<T extends object> implements ComponentContext<T> {

  readonly updateState: StateUpdater;
  private readonly _status: ComponentStatus<this>;

  protected constructor(
      readonly _defContext: DefinitionContext$<T>,
      readonly _builder: CxBuilder<ComponentContext<T>>,
      readonly element: unknown,
      readonly get: CxAccessor,
  ) {
    this.updateState = <TValue>(key: StatePath, newValue: TValue, oldValue: TValue): void => {
      this.get(StateUpdater)(key, newValue, oldValue);
    };
    this._status = new ComponentStatus(this);
    this.supply.whenOff(() => {
      delete this.component[ComponentContext__symbol];
      this._component = componentDestroyed;
    });
  }

  get componentType(): ComponentClass<T> {
    return this._defContext.componentType;
  }

  get component(): ComponentInstance<T> {
    return this._component();
  }

  abstract mounted: boolean;

  get supply(): Supply {
    return this._builder.supply;
  }

  get ready(): boolean {
    return this._status.isReady();
  }

  get onceReady(): OnEvent<[this]> {
    return this._status.onceReady();
  }

  get whenReady(): OnEvent<[this]> {
    return this._status.whenReady();
  }

  get settled(): boolean {
    return this._status.isSettled();
  }

  get onceSettled(): OnEvent<[this]> {
    return this._status.onceSettled();
  }

  get whenSettled(): OnEvent<[this]> {
    return this._status.whenSettled();
  }

  get connected(): boolean {
    return this._status.isConnected();
  }

  get onceConnected(): OnEvent<[this]> {
    return this._status.onceConnected();
  }

  get whenConnected(): OnEvent<[this]> {
    return this._status.whenConnected();
  }

  get readStatus(): AfterEvent<[this]> {
    return this._status.read();
  }

  get contentRoot(): ContentRoot {
    return this.get(ContentRoot);
  }

  _component(): T {
    throw new TypeError('Component is not constructed yet. Consider to use a `whenReady()` callback');
  }

  settle(): void {
    this._status.settle();
  }

  on<TEvent extends Event>(type: string): OnDomEvent<TEvent> {
    return this.get(ComponentEventDispatcher).on(type);
  }

  dispatchEvent(event: Event): void {
    this.get(ComponentEventDispatcher).dispatch(event);
  }

  _createComponent(): this {

    const whenComponent = this._defContext._whenComponent;

    let lastRev = 0;

    whenComponent.readNotifier.do(onceOn)(notifier => lastRev = notifier(this, lastRev));
    this.whenConnected(() => {
      whenComponent.readNotifier({
        supply: new Supply().needs(this),
        receive: (_, notifier) => {
          lastRev = notifier(this, lastRev);
        },
      });
    });
    this._defContext._elementBuilder.components.send(this);

    const component = newComponent(this);

    this._component = valueProvider(component);
    this._status.ready();

    return this;
  }

  _connect(): void {
    this._status.connect();
  }

  _created(): void {
    this._status.create();
  }

}

export class ComponentContext$Mounted<T extends object> extends ComponentContext$<T> {

  static create<T extends object>(
      defContext: DefinitionContext$<T>,
      element: unknown,
  ): ComponentContext$Mounted<T> {
    return defContext._newComponentContext(
        (get, builder) => new ComponentContext$Mounted<T>(
            defContext,
            builder,
            element,
            get,
        ),
    );
  }

  get mounted(): true {
    return true;
  }

}

function componentDestroyed(): never {
  throw new TypeError('Component destroyed already');
}

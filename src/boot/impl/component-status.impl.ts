import { AfterEvent, filterOn_, mapAfter_, onceOn, OnEvent, onEventBy, trackValue } from '@proc7ts/fun-events';
import { Supply, valueProvider } from '@proc7ts/primitives';
import { ComponentContext } from '../../component';

const enum ComponentStatusValue {
  Building,
  Ready,
  Settled,
  Connected,
}

/**
 * @internal
 */
export class ComponentStatus<TCtx extends ComponentContext> {

  private readonly _val = trackValue<ComponentStatusValue>(ComponentStatusValue.Building);
  private _canSettle: 0 | 1 = 0;

  constructor(private readonly _ctx: TCtx) {
  }

  get supply(): Supply {
    return this._val.supply;
  }

  read(): AfterEvent<[TCtx]> {
    return (this.read = valueProvider(this._val.read.do(
        mapAfter_(valueProvider(this._ctx)),
    )))();
  }

  isReady(): boolean {
    return !!this._val.it && !this._val.supply.isOff;
  }

  onceReady(): OnEvent<[TCtx]> {
    return (this.onceReady = valueProvider(this.read().do(
        ComponentStatus$once(({ ready }) => ready),
    )))();
  }

  whenReady(): OnEvent<[TCtx]> {
    return (this.whenReady = valueProvider(this.onceReady().do(
        onceOn,
    )))();
  }

  isSettled(): boolean {
    return this._val.it >= ComponentStatusValue.Settled && !this._val.supply.isOff;
  }

  onceSettled(): OnEvent<[TCtx]> {
    return (this.onceSettled = valueProvider(this.read().do(
        ComponentStatus$once(({ settled }) => settled),
    )))();
  }

  whenSettled(): OnEvent<[TCtx]> {
    return (this.whenSettled = valueProvider(this.onceSettled().do(
        onceOn,
    )))();
  }

  isConnected(): boolean {
    return this._val.it >= ComponentStatusValue.Connected && !this._val.supply.isOff;
  }

  onceConnected(): OnEvent<[TCtx]> {
    return (this.onceConnected = valueProvider(this.read().do(
        // Filtering is enough, as there is no status after "connected"
        filterOn_(({ connected }) => connected),
    )))();
  }

  whenConnected(): OnEvent<[TCtx]> {
    return (this.whenConnected = valueProvider(this.onceConnected().do(
        onceOn,
    )))();
  }

  ready(): void {
    this._val.it = ComponentStatusValue.Ready;
  }

  settle(): void {
    if (this._canSettle && this._val.it < ComponentStatusValue.Settled) {
      // Prevent settling until exiting custom element constructor
      this._val.it = ComponentStatusValue.Settled;
    }
  }

  connect(): void {
    this._val.it = ComponentStatusValue.Connected;
  }

  create(): void {
    this._canSettle = 1; // Can settle now
  }

}

function ComponentStatus$once<TCtx extends ComponentContext>(
    test: (context: TCtx) => boolean,
): (input: OnEvent<[TCtx]>) => OnEvent<[TCtx]> {
  return input => onEventBy(receiver => {

      let value = false;

      input({
        supply: receiver.supply,
        receive(eventCtx, componentCtx) {

          const newValue = test(componentCtx);

          if (newValue && !value) {
            value = newValue;
            receiver.receive(eventCtx, componentCtx);
          }
        },
      });
    });
}

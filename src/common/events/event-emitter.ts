import { EventConsumer, EventInterest, EventProducer } from './event-producer';

/**
 * Event emitter.
 *
 * This is a handy implementation of event producer along with methods for emitting events. It manages a list of
 * registered event consumers, and removes them from the list once they lose their interest (i.e. `EventInterest.off()`
 * method is called on returned event interest instance).
 *
 * @param <E> An event type. This is a list of event consumer parameter types.
 * @param <R> Event processing result. This is a type of event consumer result.
 */
export class EventEmitter<C extends EventConsumer<any[], any>> implements Iterable<C> {

  /**
   * @internal
   */
  private readonly _consumers = new Set<C>();

  /**
   * Call this method to start event consumption.
   *
   * This is an `EventProducer` implementation. Consumers registered with it will be notified on emitted events.
   */
  readonly on: EventProducer<C> = (consumer => {
    if (this._consumers.has(consumer)) {
      return EventInterest.none;
    }
    this._consumers.add(consumer);
    return {
      off: () => {
        this._consumers.delete(consumer);
      },
    };
  });

  /**
   * The number of registered event consumers.
   */
  get consumers(): number {
    return this._consumers.size;
  }

  [Symbol.iterator](): IterableIterator<C> {
    return this._consumers[Symbol.iterator]();
  }

  /**
   * Performs the given `action` for each registered consumer in order of their registration.
   *
   * Same as `Array.forEach()`.
   *
   * @param action An action to perform on each event consumer. This is a function
   * accepting an event consumer as its only argument.
   */
  forEach(action: (consumer: C) => void) {
    this._consumers.forEach(action);
  }

  /**
   * Notifies all consumers on the given event.
   *
   * The event processing results are ignored by this method.
   *
   * @param event An event represented by function call arguments.
   */
  notify(...event: Parameters<C>): void {
    for (const consumer of this) {
      consumer(...event);
    }
  }

  /**
   * Applies a function against an accumulator and each registered consumer in order of their registration
   * to reduce consumers to a single value.
   *
   * Same as `Array.reduce()`.
   *
   * @param reducer A function to apply the value returned from the previous `reducer` call and to each registered
   * consumer.
   * @param initialValue Initial value passed to the first `reducer` call.
   */
  reduce<T>(reducer: (prev: T, consumer: C) => T, initialValue: T): T {

    let value = initialValue;

    this.forEach(consumer => {
      value = reducer(value, consumer);
    });

    return value;
  }

  /**
   * Removes all registered event consumers.
   *
   * After this method call they won't be notified on events any more.
   */
  clear() {
    this._consumers.clear();
  }

}

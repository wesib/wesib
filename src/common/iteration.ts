/**
 * An iterable which elements order can be reversed.
 */
export interface ReverseableIterable<S> extends Iterable<S> {

  /**
   * Constructs an iterable containing this iterable's elements in reverse order.
   *
   * @return Reversed iterable instance.
   */
  reverse(): Iterable<S>;

}

import { ComponentMount } from '../../component';
import { ComponentContext$ } from './component-context.impl';
import { DefinitionContext$ } from './definition-context.impl';

class ComponentMount$<T extends object> extends ComponentMount<T> {

  constructor(readonly context: ComponentContext$<T>) {
    super();
  }

  get connected(): boolean {
    return this.context.connected;
  }

  set connected(value: boolean) {
    this.context._connect(value);
  }

  checkConnected(): boolean {

    const el: Element = this.context.element;
    const doc = el.ownerDocument;

    return this.connected = doc != null && doc.contains(el);
  }

}

/**
 * @internal
 */
export class MountComponentContext$<T extends object> extends ComponentContext$<T> {

  readonly mount: ComponentMount<T>;

  constructor(
      definitionContext: DefinitionContext$<T>,
      element: any,
  ) {
    super(definitionContext, element, key => element[key]);
    this.mount = new ComponentMount$<T>(this);
  }

}

import { CustomHTMLElementClass } from '@frontmeans/dom-primitives';

/**
 * @category Testing
 * @experimental
 */
export class MockElement {

  readonly ownerDocument: Document;
  private readonly _target: CustomHTMLElementClass;
  private readonly _attributes: { [name: string]: string | null } = {};

  constructor({ ownerDocument = document }: { ownerDocument?: Document } = {}) {
    this.ownerDocument = ownerDocument;
    this._target = new.target as unknown as CustomHTMLElementClass;
  }

  getRootNode(): Node {
    return this.ownerDocument;
  }

  getAttribute(name: string): string | null {

    const value = this._attributes[name];

    return value != null ? value : null;
  }

  setAttribute(name: string, value: string): void {

    const oldValue = this.getAttribute(name);

    this._attributes[name] = value;

    const observedAttributes = this._target.observedAttributes as string[];

    if (observedAttributes && observedAttributes.includes(name)) {
      this.attributeChangedCallback(name, oldValue, value);
    }
  }

  attributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string): void {
    /* no callback */
  }

  dispatchEvent(_event: Event): boolean {
    return true;
  }

  addEventListener(_type: string, _listener: EventListener): void {
    // noop
  }

  removeEventListener(_type: string, _listener: EventListener): void {
    // noop
  }

}

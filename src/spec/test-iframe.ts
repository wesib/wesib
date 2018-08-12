export class TestIframe {

  private _element!: HTMLIFrameElement;

  async create(): Promise<this> {
    this._element = document.createElement('iframe');

    const result = new Promise<any>((resolve, reject) => {
      this.element.addEventListener('error', reject);
      this.element.addEventListener('abort', reject);
      this.element.addEventListener('load', resolve);
    });

    this._element.setAttribute('src', 'base/src/spec/empty.html');

    document.body.appendChild(this._element);

    await result;

    return this;
  }

  get element(): HTMLIFrameElement {
    return this._element;
  }

  get window(): Window {
    return this.element.contentWindow!;
  }

  get document(): Document {
    return this.element.contentDocument!;
  }

  remove() {
    this.element.remove();
  }

}

export class PromiseResolver<T = any> {

  readonly promise: Promise<T>;
  private _resolve!: (value: T) => void;
  private _reject!: (error: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(value: T) {
    this._resolve(value);
  }

  reject(error: any) {
    this._reject(error);
  }

}

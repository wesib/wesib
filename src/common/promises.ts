/**
 * @module @wesib/wesib
 */
/**
 * @category Utility
 */
export class PromiseResolver<T = void> {

  readonly promise: Promise<T>;
  private _resolve!: (value: T) => void;
  private _reject!: (error: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(value: T): void {
    this._resolve(value);
  }

  reject(error: any): void {
    this._reject(error);
  }

}

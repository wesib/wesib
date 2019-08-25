import { PromiseResolver } from './promises';

describe('common', () => {
  describe('PromiseResolver', () => {

    let resolver: PromiseResolver<number>;

    beforeEach(() => {
      resolver = new PromiseResolver();
    });

    it('resolves the promise', async () => {
      resolver.resolve(123);

      expect(await resolver.promise).toBe(123);
    });
    it('rejects the promise', async () => {

      const error = new Error('error!');

      resolver.reject(error);
      expect(await resolver.promise.catch(e => e)).toBe(error);
    });
  });
});

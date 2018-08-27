import { PromiseResolver } from './promises';

describe('util/promises', () => {
  describe('PromiseResolver', () => {

    let resolver: PromiseResolver<string>;

    beforeEach(() => {
      resolver = new PromiseResolver();
    });

    it('resolves promise', async () => {

      const value = 'value';

      resolver.resolve(value);

      expect(await resolver.promise).toBe(value);
    });
    it('rejects promise', async () => {

      const error = new Error('Rejected!');

      resolver.reject(error);

      expect(await resolver.promise.catch(err => err)).toBe(error);
    });
  });
});

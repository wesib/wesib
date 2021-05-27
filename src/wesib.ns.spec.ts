import { describe, expect, it } from '@jest/globals';
import { Wesib__NS } from './wesib.ns';

describe('Wesib__NS', () => {
  it('has Wesib URL', () => {
    expect(Wesib__NS.url).toBe('https://wesib.github.io/ns');
  });
  it('has `b` namespace alias', () => {
    expect(Wesib__NS.alias).toBe('b');
  });
});

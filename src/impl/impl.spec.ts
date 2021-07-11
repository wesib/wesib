import { describe, expect, it } from '@jest/globals';
import { BootstrapContextBuilder } from './bootstrap-context-builder';
import { PerComponentCxPeer } from './component-context';
import { PerDefinitionCxPeer } from './definition-context';

describe('boot', () => {
  describe('BootstrapContextBuilder', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(BootstrapContextBuilder)).toBe('[BootstrapContextBuilder]');
      });
    });
  });

  describe('PerDefinitionCxPeer', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(PerDefinitionCxPeer)).toBe('[PerDefinitionCxPeer]');
      });
    });
  });

  describe('PerComponentCxPeer', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(PerComponentCxPeer)).toBe('[PerComponentCxPeer]');
      });
    });
  });
});

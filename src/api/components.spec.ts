import { WebComponent } from '../decorators';
import { ComponentRegistry } from '../element/component-registry';
import { Components, ComponentsOpts, createComponents } from './components';
import Spy = jasmine.Spy;
import SpyObj = jasmine.SpyObj;

describe('api/components', () => {

  let opts: ComponentsOpts;
  let createRegistrySpy: Spy;
  let registrySpy: SpyObj<ComponentRegistry>;
  let comps: Components;

  beforeEach(() => {
    opts = { window: 'components window' as any };
    registrySpy = jasmine.createSpyObj('componentRegistry', ['define', 'whenDefined']);
    createRegistrySpy = spyOn(ComponentRegistry, 'create').and.returnValue(registrySpy);
    comps = createComponents(opts);
  });

  describe('createComponent', () => {
    it('constructs component registry', () => {
      expect(createRegistrySpy).toHaveBeenCalledWith(opts);
    });
  });
  describe('Components', () => {
    it('proxies define() method', () => {
      registrySpy.define.and.returnValue(HTMLDivElement);

      @WebComponent({ name: 'test-component', extend: { name: 'div', type: HTMLDivElement } })
      class TestComponent {}

      expect(comps.define(TestComponent)).toBe(HTMLDivElement);
      expect(registrySpy.define).toHaveBeenCalledWith(TestComponent);
    });
    it('proxies whenDefined() method', () => {

      const promise = Promise.resolve<any>('abc');

      registrySpy.whenDefined.and.returnValue(promise);

      @WebComponent({ name: 'test-component', extend: { name: 'div', type: HTMLDivElement } })
      class TestComponent {}

      expect(comps.whenDefined(TestComponent)).toBe(promise);
      expect(registrySpy.whenDefined).toHaveBeenCalledWith(TestComponent);
    });
  });
});

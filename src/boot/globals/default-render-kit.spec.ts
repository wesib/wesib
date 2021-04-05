import { drekContextOf } from '@frontmeans/drek';
import { NamespaceAliaser, NamespaceDef, newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { immediateRenderScheduler } from '@frontmeans/render-scheduler';
import { Feature } from '../../feature';
import { bootstrapComponents } from '../bootstrap';
import { DefaultNamespaceAliaser } from './default-namespace-aliaser';
import { DefaultRenderKit } from './default-render-kit';
import { DefaultRenderScheduler } from './default-render-scheduler';

describe('boot', () => {
  describe('DefaultRenderKit', () => {

    let doc: Document;

    beforeEach(() => {
      doc = document.implementation.createHTMLDocument('test');
    });

    let nsAlias: NamespaceAliaser;
    let scheduler: DefaultRenderScheduler;
    let renderKit: DefaultRenderKit;

    beforeEach(async () => {
      nsAlias = jest.fn(newNamespaceAliaser());
      scheduler = jest.fn(immediateRenderScheduler);

      @Feature({
        setup(setup) {
          setup.provide({ a: DefaultNamespaceAliaser, is: nsAlias });
          setup.provide({ a: DefaultRenderScheduler, is: scheduler });
        },
      })
      class TestFeature {}

      const bsContext = await bootstrapComponents(TestFeature).whenReady;

      renderKit = bsContext.get(DefaultRenderKit);
    });

    it('initializes document rendering context with `DefaultNamespaceAliaser`', () => {

      const drCtx = renderKit.contextOf(doc.createElement('div'));
      const ns = new NamespaceDef('uri:test:ns');

      drCtx.nsAlias(ns);
      expect(nsAlias).toHaveBeenCalledWith(ns);
    });
    it('initializes document rendering context with `DefaultRenderScheduler`', () => {

      const drCtx = renderKit.contextOf(doc.createElement('div'));

      drCtx.scheduler();
      expect(scheduler).toHaveBeenCalledTimes(1);
    });
    it('initializes document rendering context only once', () => {
      renderKit.contextOf(doc.createElement('div'));

      const newNsAlias = jest.fn(newNamespaceAliaser());

      drekContextOf(doc).update({ nsAlias: newNsAlias });

      const drCtx = renderKit.contextOf(doc);
      const ns = new NamespaceDef('uri:test:ns');

      drCtx.nsAlias(ns);
      expect(newNsAlias).toHaveBeenCalledWith(ns);
      expect(nsAlias).not.toHaveBeenCalled();
    });
  });
});

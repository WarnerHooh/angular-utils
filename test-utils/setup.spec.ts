import { TestBed, async, inject, TestModuleMetadata } from '@angular/core/testing';

const resetTestingModule = TestBed.resetTestingModule,
  preventAngularFromResetting = () =>
    (TestBed.resetTestingModule = () => TestBed);
const allowAngularToReset = () =>
  (TestBed.resetTestingModule = resetTestingModule);

export const setUpTestBed = (moduleDef: TestModuleMetadata) => {
  const cache = {};

  beforeAll(done =>
    (async () => {
      resetTestingModule();
      preventAngularFromResetting();
      TestBed.configureTestingModule(moduleDef);
      await TestBed.compileComponents();

      moduleDef.providers.forEach(provider => {
        if (provider instanceof Function) {
          const service = TestBed.get(provider);
          const name = provider.name;

          // tslint:disable-next-line:forin
          for (const m in service) {
            // cache the methods of service avoid the infection among every it
            if (cache[name] === undefined) {
              cache[name] = {};
            }
            cache[name][m] = service[m];
          }
        }
      });

      // prevent Angular from resetting testing module
      TestBed.resetTestingModule = () => TestBed;
    })()
      .then(done)
      .catch(done.fail),
  );

  const providers = moduleDef.providers.filter(p => p instanceof Function);

  // reset cached methods of services
  afterEach(
    inject([...providers], (...services) => {
      services.forEach(service => {
        const cached = cache[service.constructor.name];
        // tslint:disable-next-line:forin
        for (const i in cached) {
          service[i] = cached[i];
        }
      });
    }),
  );

  afterAll(() => allowAngularToReset());
};

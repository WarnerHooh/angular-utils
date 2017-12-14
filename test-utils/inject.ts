import { inject as _inject } from '@angular/core/testing';

export const inject = new Proxy(_inject, {
  apply(target, ctx, args) {
    if (args.length !== 2) {
      throw new Error('invalid arguments of inject.');
    }
    const [tokens, fn] = args;
    if (tokens instanceof Array) {
      const params = tokens.map(token => Reflect.construct(token, []));
      const _fn = () => {
        fn.apply(null, params);
      };
      return _inject.apply(ctx, [tokens, _fn]);
    }

    return _inject.apply(ctx, args);
  },
});

import { useEffect } from 'react';
import _ from 'lodash';

/**
 * wraps useEffect so that it can be used with async functions. the callback passed to useEffect cannot return a
 * promise, so this is a workaround.
 * @param effect an async function which returns a promise
 * @param dependencies an array of dependencies which useEffect will take as it's second argument, for specifying which
 * props you want to watch for changes.
 * @param destroy clean up function which will be returned from useEffect. is provided with the promise returned from
 * effect() as an argument
 */
export const useAsyncEffect = (
  effect: () => Promise<void>,
  dependencies?: Array<unknown>,
  destroy?: (arg0: Promise<void>) => void,
) => {
  useEffect(() => { // eslint-disable-line consistent-return
    const promise = effect();
    if (_.isFunction(destroy)) {
      return destroy(promise);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
import { ApiDataAfterRehydrateAction } from './index';
/**
 * Call this after you've re-hydrated the store when using redux-persist or any other method of persisting and restoring
 * the entire apiData state. This is needed to reset loading statuses.
 * @return {{type: string}}
 */

export const afterRehydrate = (): ApiDataAfterRehydrateAction => ({
    type: 'API_DATA_AFTER_REHYDRATE'
});
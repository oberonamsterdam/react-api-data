export interface AfterRehydrateAction {
    type: 'API_DATA_AFTER_REHYDRATE';
}

/**
 * Call this after you've re-hydrated the store when using redux-persist or any other method of persisting and restoring
 * the entire apiData state. This is needed to reset loading statuses.
 */
export const afterRehydrate = (): AfterRehydrateAction => ({
    type: 'API_DATA_AFTER_REHYDRATE'
});
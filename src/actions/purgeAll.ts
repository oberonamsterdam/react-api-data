export interface PurgeAllAction {
    type: 'PURGE_ALL_API_DATA';
}

/**
 * Remove all the requests and entities but keep the configurations. This can be usefull when creating a log out feature.
 * @example
 * dispatch(purgeAll());
 */
export const purgeAll = (): PurgeAllAction => ({
    type: 'PURGE_ALL_API_DATA',
});

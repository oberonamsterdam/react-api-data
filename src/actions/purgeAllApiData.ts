
export interface PurgeAllApiDataAction {
    type: 'PURGE_ALL_API_DATA';
}

/**
 * Remove all the requests and entities but keep the configurations. This can be usefull when creating a log out feature.
 * @example
 * dispatch(purgeAllApiData());
 */
export const purgeAllApiData = (): PurgeAllApiDataAction => ({
    type: 'PURGE_ALL_API_DATA',
});
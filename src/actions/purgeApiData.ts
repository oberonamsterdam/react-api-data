
export interface PurgeApiDataAction {
    type: 'PURGE_API_DATA';
}

/**
 * Remove all the requests and entities but keep the configurations. This can be usefull when creating a log out feature.
 * @return {{type: string}}
 * @example
 * dispatch(purgeApiData());
 */
export const purgeApiData = (): PurgeApiDataAction => ({
    type: 'PURGE_API_DATA',
});
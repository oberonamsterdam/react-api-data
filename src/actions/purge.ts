
export interface PurgeAction {
    type: 'PURGE_API_DATA';
}

/**
 * Remove all the requests and entities but keep the configurations. This can be usefull when creating a log out feature.
 * @example
 * dispatch(purge());
 */
export const purge = (): PurgeAction => ({
    type: 'PURGE_API_DATA',
});
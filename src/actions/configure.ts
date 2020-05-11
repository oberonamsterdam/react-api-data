import { EndpointConfig, GlobalConfig } from '../types';

export interface ConfigureAction {
    type: 'CONFIGURE_API_DATA';
    payload: {
        globalConfig: GlobalConfig,
        endpointConfig: {
            [endpointKey: string]: EndpointConfig,
        }
    };
}
/**
 * Register your global and endpoint configurations. Make sure you do this before you mount any components using
 * withApiData.
 */

export const configure = (
    globalConfig: GlobalConfig,
    endpointConfig: { [endpointKey: string]: EndpointConfig }
): ConfigureAction => ({
    type: 'CONFIGURE_API_DATA',
    payload: {
        globalConfig,
        endpointConfig
    }
});
import { ApiDataEndpointConfig, ApiDataGlobalConfig } from './index';
import { Action } from './reducer';
/**
 * Register your global and endpoint configurations. Make sure you do this before you mount any components using
 * withApiData.
 */
export const configureApiData = (globalConfig: ApiDataGlobalConfig, endpointConfig: { [endpointKey: string]: ApiDataEndpointConfig }): Action => ({
    type: 'CONFIGURE_API_DATA',
    payload: {
        globalConfig,
        endpointConfig
    }
});
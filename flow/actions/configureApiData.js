// @flow
import type { ApiDataEndpointConfig, ApiDataGlobalConfig } from '../index';

export interface ConfigureApiDataAction {
  type: 'CONFIGURE_API_DATA';
  payload: {
    globalConfig: ApiDataGlobalConfig,
    endpointConfig: {
      [endpointKey: string]: ApiDataEndpointConfig
    }
  };
}

export var configureApiData: (
  globalConfig: ApiDataGlobalConfig,
  endpointConfig: {
    [endpointKey: string]: ApiDataEndpointConfig
  }
) => ConfigureApiDataAction;

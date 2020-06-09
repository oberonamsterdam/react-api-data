// @flow
import type { EndpointConfig, GlobalConfig } from '../types';

export type ConfigureAction = {
  type: 'CONFIGURE_API_DATA';
  payload: {
    globalConfig: GlobalConfig,
    endpointConfig: {
      [endpointKey: string]: EndpointConfig
    }
  };
}

declare export var configure: (
  globalConfig: GlobalConfig,
  endpointConfig: {
    [endpointKey: string]: EndpointConfig
  }
) => ConfigureAction;

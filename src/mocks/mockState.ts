import { getRequestKey } from '../helpers/getRequestKey';
import { EndpointConfig, GlobalConfig, NetworkStatus, EndpointParams } from '../types';

const setPostRequestProperties = (requestProperties: any) => ({
    ...requestProperties,
    body: JSON.stringify(requestProperties.body),
});

const setPostHeaders = (headers: any) => ({
    ...headers,
    'Content-Type': 'application/json',
});

export default (
    binding: string,
    hasRequest?: boolean,
    params?: { [bindingKey: string]: EndpointParams },
    networkStatus?: NetworkStatus,
    config: Partial<EndpointConfig> = {},
    globalConfig: Partial<GlobalConfig> = {},
    lastCall = Date.now(),
    instanceId = ''
): any => ({
    globalConfig,
    endpointConfig: {
        [binding]: {
            url: 'mockAction.get',
            setHeaders: config.method === 'POST' ? setPostHeaders : null,
            setRequestProperties: config.method === 'POST' ? setPostRequestProperties : null,
            ...config,
        },
        getMoreData: {},
    },
    requests: hasRequest
        ? {
              [getRequestKey(binding, params?.[binding] ?? {}, instanceId)]: {
                  networkStatus,
                  lastCall,
                  duration: 0,
              },
          }
        : {},
    entities: {},
});

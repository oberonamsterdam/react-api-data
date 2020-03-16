import { getRequestKey } from '../helpers/getRequestKey';
import { State } from '../reducer';

export const setPostRequestProperties = (requestProperties: any) => ({
    ...requestProperties,
    body: JSON.stringify(requestProperties.body)
});

export const setPostHeaders = (headers: any) => ({
    ...headers,
    'Content-Type': 'application/json',
});

export const getState: any = (binding: string, hasRequest?: boolean, params?: any, networkStatus?: string, method?: string, cacheDuration?: number, beforeSuccess?: () => void, afterSuccess?: () => void, timeout?: number) => (
{
    globalConfig: {},
    endpointConfig: {[binding]: {
        url: 'mockAction',
        method: method ? method : 'GET',
        setHeaders: method && method === 'POST' ? setPostHeaders : null,
        setRequestProperties: method && method === 'POST' ? setPostRequestProperties : null,
        cacheDuration: cacheDuration ? cacheDuration : null,
        beforeSuccess,
        afterSuccess,
        timeout
    },
        getMoreData: {

        }
    },
    requests: hasRequest ? {
        [getRequestKey(binding, params[binding])]: {
            networkStatus,
            lastCall: 10,
            duration: 0,
        }
    } : {},
    entities: {
    }
}
);

export interface ConfigureBinding {
    name: string;
    params: any;
    networkStatus: string;
    method?: string;
    autoTrigger?: boolean;
    cacheDuration?: number;
    beforeSuccess?: () => void;
    afterSuccess?: () => void;
    timeout?: number;
}

const getEndpointConfig = (bindings: ConfigureBinding[]) => bindings.reduce((obj: any, binding: ConfigureBinding) => {
    obj[binding.name] = {
        url: `${binding.name}.${binding.method ? binding.method.toLowerCase() : 'get'}`,
        method: binding.method ? binding.method : 'GET',
        setHeaders: binding.method && binding.method === 'POST' ? setPostHeaders : null,
        setRequestProperties: binding.method && binding.method === 'POST',
        setPostRequestProperties: null,
        cacheDuration: binding.cacheDuration ? binding.cacheDuration : null,
        beforeSuccess: binding.beforeSuccess,
        afterSuccess: binding.beforeSuccess,
        timeout: binding.timeout
    };
    return obj;
},
                                                                            {});

const getRequests = (bindings: ConfigureBinding[]) => bindings.reduce((obj: any, binding: ConfigureBinding) => {
    obj[getRequestKey(binding.name, binding.params)] = {
        networkStatus: binding.networkStatus,
        lastCall: 10,
        duration: 0,
    };
    return obj;
},
                                                                      {});

export const setMockedStoreConfig = (bindings: ConfigureBinding[]): State => ({
    globalConfig: {},
    endpointConfig: getEndpointConfig(bindings),
    requests: getRequests(bindings),
    entities: {}
});

export const getProps: any = (binding: string, hasRequest: boolean, params?: any, networkStatus?: any) => (
{
    apiData: getState(binding, hasRequest, params, networkStatus),
    params
}
);

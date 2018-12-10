import { getRequestKey } from '../helpers/getRequestKey';

const setPostRequestProperties = (requestProperties: any) => ({
    ...requestProperties,
    body: JSON.stringify(requestProperties.body)
});

const setPostHeaders = (headers: any) => ({
    ...headers,
    'Content-Type': 'application/json',
});

export const getState: any = (binding: string, params?: any, networkStatus?: any, method?: string) => (
{
    globalConfig: {},
    endpointConfig: {[getRequestKey(binding, params[binding])]: {
        url: 'mockAction.get',
        method: method ? method : 'GET',
        setHeaders: method && method === 'POST' ? setPostHeaders : null,
        setRequestProperties: method && method === 'POST' ? setPostRequestProperties : null
    }
    },
    requests: {
        [getRequestKey(binding, params[binding])]: {
            networkStatus,
            lastCall: Date.now(),
            duration: 0,
        }
    },
    entities: {

    }
}
);

export const getProps: any = (binding: string, params?: any, networkStatus?: any) => (
{
    apiData: getState(binding, params, networkStatus),
    params
}
);
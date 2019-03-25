import { getRequestKey } from '../helpers/getRequestKey';
import { ApiDataEndpointConfig } from '../index';

const setPostRequestProperties = (requestProperties: any) => ({
    ...requestProperties,
    body: JSON.stringify(requestProperties.body)
});

const setPostHeaders = (headers: any) => ({
    ...headers,
    'Content-Type': 'application/json',
});

export default (binding: string, hasRequest?: boolean, params?: any, networkStatus?: any, config: Partial<ApiDataEndpointConfig> = {}): any => ({
    globalConfig: {},
    endpointConfig: {
        [binding]: {
            url: 'mockAction.get',
            setHeaders: config.method === 'POST' ? setPostHeaders : null,
            setRequestProperties: config.method === 'POST' ? setPostRequestProperties : null,
            ...config,
        },
        getMoreData: {

        }
    },
    requests: hasRequest ? {
        [getRequestKey(binding, params[binding])]: {
            networkStatus,
            lastCall: Date.now(),
            duration: 0,
        }
    } : {},
    entities: {

    }
});


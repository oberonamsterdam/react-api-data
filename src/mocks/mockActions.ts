import { getRequestKey } from '../helpers/getRequestKey';

export const getState: any = (binding: string, hasRequest: boolean, params?: any, networkStatus?: any) => ({
    globalConfig: {},
    endpointConfig: {[getRequestKey(binding, params[binding])]: {
        url: '',
        method: 'GET'
    }
    },
    requests: hasRequest ? {
        [getRequestKey(binding, params[binding])]: {
            networkStatus,
            lastCall: Date.now(),
            duration: 0,
        }
    } : {},
    entities: {}
});

export const getProps: any = (binding: string, hasRequest: boolean, params?: any, networkStatus?: any) => ({
    apiData: getState(binding, hasRequest, params, networkStatus),
    params
});
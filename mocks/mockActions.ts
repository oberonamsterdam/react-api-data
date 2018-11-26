import { getRequestKey } from '../src/helpers/getRequestKey';

export const getState: any = (binding: string, params?: any, networkStatus?: any, method?: string) => (
{
    globalConfig: {},
    endpointConfig: {[getRequestKey(binding, params[binding])]: {
        url: '',
        method: method ? method : 'GET'
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
import { getRequestKey } from '../src/helpers/getRequestKey';

const getState: any = (binding: string, params?: any, networkStatus?: any) => (
{
    globalConfig: {},
    endpointConfig: {[getRequestKey(binding, params[binding])]: {
        url: '',
        method: 'GET'
    }
    },
    requests: {
        [getRequestKey(binding, params[binding])]: {
            networkStatus,
            lastCall: Date.now(),
            duration: 0,
        }
    },
    entities: {}
}
);

export const getProps: any = (binding: string, params?: any, networkStatus?: any) => (
{
    apiData: getState(binding, params, networkStatus),
    params
}
);
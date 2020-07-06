import { State } from '../reducer';
import { EndpointParams } from '../types';
import { getApiDataRequest } from './getApiDataRequest';

export const getLoadingState = (apiDataState: State, endpointKey: string, params?: EndpointParams, instanceId: string = ''): boolean => {
    const config = apiDataState.endpointConfig[endpointKey];

    if (!config) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`apiData.getResult: configuration of endpoint ${endpointKey} not found.`);
        }
        return false;
    }

    const request = getApiDataRequest(apiDataState, endpointKey, params, instanceId);

    if (!request) {
        return false;
    }

    return request.networkStatus === 'loading';
};
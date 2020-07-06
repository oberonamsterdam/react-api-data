import { State } from '../reducer';
import { EndpointParams } from '../types';
import { getApiDataRequest } from './getApiDataRequest';

/**
 * Get the result data of a failed endpoint, or undefined if the request did not fail. This value is automatically
 * bound when using {@link withApiData}.
 */
export const getFailedData = (apiDataState: State, endpointKey: string, params?: EndpointParams, instanceId: string = ''): any | any[] | void => {
    const config = apiDataState.endpointConfig[endpointKey];

    if (!config) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`apiData.getResult: configuration of endpoint ${endpointKey} not found.`);
        }
        return;
    }

    const request = getApiDataRequest(apiDataState, endpointKey, params, instanceId);

    if (!request) {
        return;
    }

    return request.networkStatus === 'failed'
        ? request.errorBody
        : undefined;
};
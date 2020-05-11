import { denormalize } from 'normalizr';
import { ApiDataState } from '../reducer';
import { EndpointParams } from '../types';
import { getApiDataRequest } from './getApiDataRequest';

/**
 * Get the de-normalized result data of an endpoint, or undefined if not (yet) available. This value is automatically
 * bound when using {@link withApiData}.
 */
export const getResultData = (
    apiDataState: ApiDataState,
    endpointKey: string,
    params?: EndpointParams,
    instanceId: string = ''
): any | any[] | void => {
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
        ? undefined
        : request.result && (
            config.responseSchema
                ? denormalize(request.result, config.responseSchema, apiDataState.entities)
                : request.result
        );
};

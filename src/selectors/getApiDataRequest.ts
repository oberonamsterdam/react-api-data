import { State } from '../reducer';
import { getRequestKey } from '../helpers/getRequestKey';
import { EndpointParams, Request } from '../types';

/**
 * Selector to manually get a {@link ApiDataRequest}. This value is automatically bind when using {@link withApiData}.
 * This selector can be useful for tracking request status when a request is triggered manually, like a POST after a
 * button click.
 */

export const getApiDataRequest = (
    apiDataState: State,
    endpointKey: string,
    params?: EndpointParams,
    instanceId: string = ''
): Request | undefined => apiDataState.requests[getRequestKey(endpointKey, params, instanceId)];

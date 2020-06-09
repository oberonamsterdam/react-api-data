import { State } from '../reducer';
import { getRequestKey } from '../helpers/getRequestKey';
import { EndpointParams, DataRequest } from '../types';

/**
 * Selector to manually get a {@link Request}. This value is automatically bind when using {@link withApiData}.
 * This selector can be useful for tracking request status when a request is triggered manually, like a POST after a
 * button click.
 */

export const getRequest = (state: State, endpointKey: string, params?: EndpointParams, instanceId: string = ''): DataRequest | undefined =>
    state.requests[getRequestKey(endpointKey, params, instanceId)];
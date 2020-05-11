import { EndpointParams } from '../types';
import { getRequestKey } from '../helpers/getRequestKey';

export interface InvalidateRequestAction {
    type: 'INVALIDATE_API_DATA_REQUEST';
    payload: {
        requestKey: string;
    };
}

/**
 * Invalidates the result of a request, settings it's status back to 'ready'. Use for example after a POST, to invalidate
 * a GET list request, which might need to include the newly created entity.
 */

export const invalidateRequest = (
    endpointKey: string,
    params?: EndpointParams,
    instanceId: string = ''
): InvalidateRequestAction => ({
    type: 'INVALIDATE_API_DATA_REQUEST',
    payload: {
        requestKey: getRequestKey(endpointKey, params, instanceId),
    },
});

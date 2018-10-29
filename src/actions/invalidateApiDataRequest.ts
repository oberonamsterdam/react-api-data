import { InvalidateApiDataRequestAction } from './index';
import { EndpointParams } from '../index';
import { getRequestKey } from '../helpers/getRequestKey';

/**
 * Invalidates the result of a request, settings it's status back to 'ready'. Use for example after a POST, to invalidate
 * a GET list request, which might need to include the newly created entity.
 */

export const invalidateApiDataRequest = (endpointKey: string, params?: EndpointParams): InvalidateApiDataRequestAction => ({
    type: 'INVALIDATE_API_DATA_REQUEST',
    payload: {
        requestKey: getRequestKey(endpointKey, params)
    }
});
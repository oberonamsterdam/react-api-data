import { invalidateRequest } from './invalidateRequest';
import { EndpointParams } from '../types';
import { getRequestKey } from '../helpers/getRequestKey';

describe('invalidateRequest action creator', () => {
    test('should set up invalidateRequest action object with the correct type and payload', () => {

        // Set up fake endpoint key & params.
        const endpointKey = 'getData';
        const params: EndpointParams = {
            myData: 'all',
        };

        const action = invalidateRequest(endpointKey, params);

        expect(action).toEqual({
            type: 'INVALIDATE_API_DATA_REQUEST',
            payload: {
                requestKey: getRequestKey(endpointKey, params),
            },
        });
    });

    test('should set up invalidateApiDataRequest action object with the correct type and payload for an Instance', () => {
        // Set up fake endpoint key & params.
        const endpointKey = 'getData';
        const params: EndpointParams = {
            myData: 'all',
        };

        const action = invalidateRequest(endpointKey, params, 'primary');

        expect(action).toEqual({
            type: 'INVALIDATE_API_DATA_REQUEST',
            payload: {
                requestKey: getRequestKey(endpointKey, params, 'primary'),
            },
        });
    });
});

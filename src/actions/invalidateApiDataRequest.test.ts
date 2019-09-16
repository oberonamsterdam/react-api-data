import { invalidateApiDataRequest } from './invalidateApiDataRequest';
import { EndpointParams } from '../index';
import { getRequestKey } from '../helpers/getRequestKey';

describe('invalidateApiDataRequest action creator', () => {

    test('should set up invalidateApiDataRequest action object with the correct type and payload', () => {

        // Set up fake endpoint key & params.
        const endpointKey = 'getData';
        const params: EndpointParams = {
            myData: 'all'
        };

        const action = invalidateApiDataRequest(endpointKey, params);

        expect(action).toEqual({
            type: 'INVALIDATE_API_DATA_REQUEST',
            payload: {
                requestKey: getRequestKey(endpointKey, params)
            }
        });
    });

    test('should set up invalidateApiDataRequest action object with the correct type and payload for an Instance', () => {

        // Set up fake endpoint key & params.
        const endpointKey = 'getData';
        const params: EndpointParams = {
            myData: 'all'
        };

        const action = invalidateApiDataRequest(endpointKey, params, 'primary');

        expect(action).toEqual({
            type: 'INVALIDATE_API_DATA_REQUEST',
            payload: {
                requestKey: getRequestKey(endpointKey, params, 'primary')
            }
        });
    });
});
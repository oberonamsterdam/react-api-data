import { purgeRequest } from './purgeRequest';
import { EndpointParams } from '../index';
import { getRequestKey } from '../helpers/getRequestKey';

describe('purgeRequestRequest action creator', () => {
    test('should set up purgeRequest action object with the correct type and payload', () => {
        // Set up fake endpoint key & params.
        const endpointKey = 'getData';
        const params: EndpointParams = {
            myData: 'all',
        };

        const action = purgeRequest(endpointKey, params);

        expect(action).toEqual({
            type: 'PURGE_API_DATA_REQUEST',
            payload: {
                requestKey: getRequestKey(endpointKey, params),
            },
        });
    });

    test('should set up purgeRequest action object with the correct type and payload for an Instance', () => {
        // Set up fake endpoint key & params.
        const endpointKey = 'getData';
        const params: EndpointParams = {
            myData: 'all',
        };

        const action = purgeRequest(endpointKey, params, 'primary');

        expect(action).toEqual({
            type: 'PURGE_API_DATA_REQUEST',
            payload: {
                requestKey: getRequestKey(endpointKey, params, 'primary'),
            },
        });
    });

    test('should set up purgeRequest action object with the correct type and payload no params and no instance', () => {
        // Set up fake endpoint key & params.
        const endpointKey = 'getData';

        const action = purgeRequest(endpointKey);

        expect(action).toEqual({
            type: 'PURGE_API_DATA_REQUEST',
            payload: {
                requestKey: getRequestKey(endpointKey),
            },
        });
    });
});

import { cacheExpired } from './cacheExpired';
import { EndpointConfig, Request } from '../types';

describe('check wether the cacheExpired function works correctly', () => {

    test('should return true if the current Date - lastCall property is greater than the cacheDuration', () => {

        // Set up config and request objects.
        const endpointConfig: EndpointConfig = {
            url: 'https://myapi.org/myData',
            method: 'GET',
            cacheDuration: 6000
        };

        const request: Request = {
            networkStatus: 'failed',
            lastCall: 6000,
            duration: 12000,
            endpointKey: 'getData',
            url: 'https://myapi.org/myData',
        };

        const action = cacheExpired(endpointConfig, request);

        expect(action).toBe(true);
    });

    test('should return false if the current Date - lastCall property is smaller than the cacheDuration', () => {

        // Set up config and request objects.
        const endpointConfig: EndpointConfig = {
            url: 'https://myapi.org/myData',
            method: 'GET',
            cacheDuration: 6000
        };

        const request: Request = {
            networkStatus: 'failed',
            lastCall: Date.now() + 1,
            duration: 12000,
            endpointKey: 'getData',
            url: 'https://myapi.org/myData',
        };

        const action = cacheExpired(endpointConfig, request);

        expect(action).toBe(false);
    });
});
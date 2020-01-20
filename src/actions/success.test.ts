import { success } from './success';

import { normalize, schema } from 'normalizr';

describe('Success action creator', () => {

    test('should set up the SuccessAction action object without transformResponseBody and normalizedData provided', () => {
        // Set up a fake config object for the endpointConfig parameter.
        const config = {
            url: 'https://myapi.org/myData',
            method: 'GET',
            cacheDuration: 60000
        };

        // Set up a fake response object for the response parameter.
        const response = {
            ok: false,
            redirected: false,
            data: 'test-data',
            statusText: 'Not Found',
            url: 'https://myapi.org/myData'
        };

        // @ts-ignore
        const action = success('getData', config, response, {data: 'json'});

        expect(action).toEqual({
            type: 'API_DATA_SUCCESS',
            payload: {
                requestKey: 'getData',
                response,
                responseBody: {data: 'json'},
                normalizedData: undefined
            }
        });
    });

    test('should set up the SuccessAction action object and call normalize successfully', () => {
        // Set up a fake response object for the response parameter.
        const response = {
            ok: false,
            redirected: false,
            data: 'test-data',
            statusText: 'Not Found',
            url: 'https://myapi.org/myData'
        };

        // Set up a fake body argument to be normalizd.
        const body: any = [
            {
                id: '123',
                data: 'json'
            },
            {
                id: '456',
                data: 'json'
            }
        ];

        // Set up schema.
        const dataSchema = new schema.Entity('data');
        const dataListSchema = [dataSchema];

        // Set up a fake config object for the endpointConfig parameter.
        const config = {
            url: 'https://myapi.org/myData',
            method: 'GET',
            cacheDuration: 60000,
            responseSchema: dataListSchema
        };

        // @ts-ignore
        const action = success('getData', config, response, body);

        expect(action).toEqual({
            type: 'API_DATA_SUCCESS',
            payload: {
                requestKey: 'getData',
                response,
                responseBody: body,
                normalizedData: normalize(body, config.responseSchema)
            }
        });
    });

    test('should not return an invalid SuccessAction action object', () => {
        // Set up a fake response object for the response parameter.
        const response = {
            ok: false,
            redirected: false,
            data: 'test-data',
            statusText: 'Not Found',
            url: 'https://myapi.org/myData'
        };

        // Set up a fake body argument to be normalizd.
        const body1: any = [
            {
                id: '123',
                data: 'json'
            },
            {
                id: '456',
                data: 'json'
            }
        ];

        // Set up a fake body argument to be normalizd.
        const body2: any = [
            {
                id: 'abc',
                data: 'json'
            },
            {
                id: 'def',
                data: 'json'
            }
        ];

        // Set up schema.
        const dataSchema = new schema.Entity('data');
        const dataListSchema = [dataSchema];

        // Set up a fake config object for the endpointConfig parameter.
        const config = {
            url: 'https://myapi.org/myData',
            method: 'GET',
            cacheDuration: 60000,
            responseSchema: dataListSchema
        };

        // @ts-ignore
        const action = success('getData', config, response, body1);

        expect(action).not.toEqual({
            type: 'API_DATA_SUCCESS',
            payload: {
                requestKey: 'getData',
                response,
                responseBody: body2,
                normalizedData: normalize(body1, config.responseSchema)
            }
        });
    });
});
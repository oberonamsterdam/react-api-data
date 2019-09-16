import { schema } from 'normalizr';

import { getResultData } from './getResultData';
// import { getApiDataRequest } from './getApiDataRequest';
import { getRequestKey } from '../helpers/getRequestKey';

import { ApiDataState } from '../reducer';

describe('getResultData should return the resultData of a given Endpoint', () => {
    const apiDataState: ApiDataState = {
        globalConfig: {
            timeout: 6000
        },
        endpointConfig: {
            getData: {
                url: 'https://myapi.org/myData',
                method: 'GET',
            }
        },
        requests: {
            [getRequestKey('getData', { id: 'one' })]: {
                networkStatus: 'success',
                lastCall: Date.now(),
                duration: 6000,
                endpointKey: 'getData',
                result: { mobilePhone: 'Iphone', provider: 'Ben' },
                url: 'https://myapi.org/myData',
            },
            [getRequestKey('getData', { id: 'two' }, 'primary')]: {
                networkStatus: 'success',
                lastCall: Date.now(),
                duration: 6000,
                endpointKey: 'getData',
                result: { mobilePhone: 'Samsung', provider: 'T-Mobile' },
                url: 'https://myapi.org/myData',
            }
        },
        entities: {
            users: {
                '123abc': 'oberon'
            }
        }
    };

// Set up request.

    test('should equal the result object form the apiDataState', () => {
        const result = getResultData(apiDataState, 'getData', { id: 'one' });
        expect(result).toEqual({ mobilePhone: 'Iphone', provider: 'Ben' });
    });

    test('should return undefined because parram no found', () => {
        const result = getResultData(apiDataState, 'getData', { id: 'two' });
        expect(result).toBeUndefined();
    });

    test('should return undefined when there is no config, dev const, request, or request.result provided', () => {
        const result = getResultData(apiDataState, 'getData', { id: 'one' });
        expect(result).toEqual({ mobilePhone: 'Iphone', provider: 'Ben' });
    });

    test('should return undefined when there is no config, dev const, request, or request.result provided', () => {
        const result = getResultData(apiDataState, 'this endpointKey does not exist');

        expect(result).toBeUndefined();
    });

    test('should equal the result object form the apiDataState when empty string is passed as instanceId', () => {
        const result = getResultData(apiDataState, 'getData', { id: 'one' }, '');
        expect(result).toEqual({ mobilePhone: 'Iphone', provider: 'Ben' });
    });

    test('should return undefined when an unknown instanceId is entered', () => {
        const result = getResultData(apiDataState, 'getData', { id: 'one' }, 'otherInstance');
        expect(result).toBeUndefined();
    });
    
    test('should equal the result object form the apiDataState when an known instanceId is entered', () => {
        const result = getResultData(apiDataState, 'getData', { id: 'two' }, 'primary');
        expect(result).toEqual({ mobilePhone: 'Samsung', provider: 'T-Mobile' });
    });

    test('should call console.warn if there is no config and NODE_ENV is set to development', () => {

    // @ts-ignore
        process.env.NODE_ENV = 'development';

        const consoleSpy = jest.spyOn(global.console, 'warn');

        getResultData(apiDataState, 'triggerWarning endpointKey');

        expect(consoleSpy).toHaveBeenCalled();
    });

    test('should return the result of the request if there is no responseSchema in the config', () => {

        const apiDataState2: ApiDataState = {
            globalConfig: {
                timeout: 6000
            },
            endpointConfig: {
                getData: {
                    url: 'https://myapi.org/myData',
                    method: 'GET'
                }
            },
            requests: {
                [getRequestKey('getData')]: {
                    networkStatus: 'success',
                    lastCall: Date.now(),
                    duration: 6000,
                    endpointKey: 'getData',
                    result: 1,
                    url: 'https://myapi.org/myData',
                }
            },
            entities: {
                users: {
                    '123abc': 'oberon'
                },
                articles: {
                    1: {
                        id: 1,
                        comments: [1, 2],
                    },
                },
                comments: {
                    1: {
                        id: 1,
                        content: 'Comment 1',
                    }, 2: {
                        id: 2,
                        content: 'Comment 2',
                    }
                }
            }
        };

        const result = getResultData(apiDataState2, 'getData');

        expect(result).toEqual(1);
    });

    test('should return denormalized result data', () => {

        const commentsSchema = new schema.Entity('comments');
        const articlesSchema = new schema.Entity('articles', {
            comments: [commentsSchema]
        });

        const apiDataState3: ApiDataState = {
            globalConfig: {
                timeout: 6000
            },
            endpointConfig: {
                getData: {
                    url: 'https://myapi.org/myData',
                    method: 'GET',
                    responseSchema: articlesSchema
                }
            },
            requests: {
                [getRequestKey('getData')]: {
                    networkStatus: 'success',
                    lastCall: Date.now(),
                    duration: 6000,
                    endpointKey: 'getData',
                    result: 1,
                    url: 'https://myapi.org/myData',
                }, [getRequestKey('getData', { id: 'one' })]: {
                    networkStatus: 'success',
                    lastCall: Date.now(),
                    duration: 6000,
                    endpointKey: 'getData',
                    url: 'https://myapi.org/myData',
                }
            },
            entities: {
                users: {
                    '123abc': 'oberon'
                },
                articles: {
                    1: {
                        id: 1,
                        comments: [1, 2],
                    },
                },
                comments: {
                    1: {
                        id: 1,
                        content: 'Comment 1',
                    }, 2: {
                        id: 2,
                        content: 'Comment 2',
                    }
                }
            }
        };

        const result = getResultData(apiDataState3, 'getData');

        expect(result).toEqual({
            id: 1,
            comments: [
                {
                    id: 1,
                    content: 'Comment 1',
                },
                {
                    id: 2,
                    content: 'Comment 2',
                }
            ]
        });
    });
});
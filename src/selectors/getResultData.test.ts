import { schema } from 'normalizr';

import { getResultData } from './getResultData';
// import { getApiDataRequest } from './getApiDataRequest';
import { getRequestKey } from '../helpers/getRequestKey';

import { ApiDataState } from '../reducer';

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
            endpointKey: 'getData'
        }
    },
    entities: {
        users: {
            '123abc': 'oberon'
        }
    }
};

// Set up request.
// const request = getApiDataRequest(apiDataState, 'getData', { id: 'one' });

test('should return undefined when there is no config, dev const, request, or request.result provided', () => {

    const result = getResultData(apiDataState, 'this endpointKey does not exist');

    expect(result).toBeUndefined();
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
                method: 'GET',
            }
        },
        requests: {
            [getRequestKey('getData')]: {
                networkStatus: 'success',
                lastCall: Date.now(),
                duration: 6000,
                endpointKey: 'getData',
                result: 1
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

    // TODO: Fix this expect.
    // expect(result).toEqual(request.result);

    expect(result).toEqual({
        id: 1,
        comments: [
            {   id: 1,
                content: 'Comment 1',
            },
            {
                id: 2,
                content: 'Comment 2',
            }
        ]
    });
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
                result: 1
            }, [getRequestKey('getData', { id: 'one' })]: {
                networkStatus: 'success',
                lastCall: Date.now(),
                duration: 6000,
                endpointKey: 'getData'
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
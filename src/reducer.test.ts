import reducer, {
    addEntities,
    ApiDataState,
    ClearApiDataAction,
    defaultState,
    FetchApiDataAction,
    recoverNetworkStatuses,
} from './reducer';
import { setPostHeaders, setPostRequestProperties } from './mocks/mockActions';
import { ConfigureApiDataAction } from './actions/configureApiData';
import { getRequestKey } from './helpers/getRequestKey';
import { ApiDataSuccessAction } from './actions/apiDataSuccess';
import { ApiDataFailAction } from './actions/apiDataFail';
import { InvalidateApiDataRequestAction } from './actions/invalidateApiDataRequest';
import { PurgeAllApiDataAction } from './actions/purgeAllApiData';
import { ApiDataAfterRehydrateAction } from './actions/afterRehydrate';
import { schema } from 'normalizr';
import { purgeRequest } from './actions/purgeRequest';
import { getApiDataRequest } from './selectors/getApiDataRequest';

const getMockRequest = (requestKey: string) => ({
    [requestKey]: {
        networkStatus: 'success',
        lastCall: 1000,
        duration: 0,
        result: { articles: { 1: { id: 1, data: 'json', comments: ['nice'] } } },
        response: {
            body: { id: 1, data: 'json' },
            ok: true,
            redirected: false,
            status: 200,
            statusText: 'ok',
        },
        endpointKey: 'postData',
        url: 'www.postdate.post',
    },
});

// mock current date for lastCall/duration testing
const MOCK_NOW = 5000;
global.Date.now = () => MOCK_NOW;

test('recoverNetworkStatuses should return a new requests map with loading states reset to ready', () => {
    const input = {
        a: {
            networkStatus: 'ready',
        },
        b: {
            networkStatus: 'loading',
        },
        c: {
            networkStatus: 'success',
        },
        d: {
            networkStatus: 'failed',
        },
        e: {
            networkStatus: 'loading',
            lastCall: 123,
        },
    } as any;

    const output = recoverNetworkStatuses(input);

    expect(output).not.toBe(input);
    expect(output).toEqual({
        a: {
            networkStatus: 'ready',
        },
        b: {
            networkStatus: 'ready',
        },
        c: {
            networkStatus: 'success',
        },
        d: {
            networkStatus: 'failed',
        },
        e: {
            networkStatus: 'ready',
            lastCall: 123,
        },
    });
});

const postDataSchema = new schema.Entity('postData');

const initialState: ApiDataState = {
    globalConfig: {
        setHeaders: setPostHeaders,
        setRequestProperties: setPostRequestProperties,
    },
    endpointConfig: {
        getData: {
            url: 'www.getdata.get',
            method: 'GET',
            timeout: 1000,
        },
        postData: {
            url: 'www.postdate.post',
            method: 'POST',
            responseSchema: postDataSchema,
        },
    },
    requests: {},
    entities: {},
};

describe('CONFIGURE_API_DATA', () => {
    test('initial state gets configured correctly', () => {
        const action: ConfigureApiDataAction = {
            type: 'CONFIGURE_API_DATA',
            payload: {
                globalConfig: {
                    setHeaders: setPostHeaders,
                    setRequestProperties: setPostRequestProperties,
                },
                endpointConfig: {
                    getData: {
                        url: 'www.getdata.get',
                        method: 'GET',
                        timeout: 1000,
                    },
                    postData: {
                        url: 'www.postdate.post',
                        method: 'POST',
                        responseSchema: postDataSchema,
                    },
                },
            },
        };
        expect(reducer(defaultState, action)).toEqual(initialState);
    });
});

const updatedState: ApiDataState = {
    ...initialState,
    requests: {
        [getRequestKey('postData')]: {
            networkStatus: 'ready',
            lastCall: 1000,
            duration: 0,
            endpointKey: 'postData',
            url: 'www.postdate.post',
        },
    },
};

describe('FETCH_API_DATA', () => {
    test('new stat is correct', () => {
        const params = { id: 'one' };
        const action: FetchApiDataAction = {
            type: 'FETCH_API_DATA',
            payload: {
                endpointKey: 'getData',
                requestKey: getRequestKey('getData', params),
                params,
                url: 'www.getdata.get',
            },
        };
        const newState = {
            ...updatedState,
            requests: {
                [getRequestKey('getData', params)]: {
                    networkStatus: 'loading',
                    lastCall: MOCK_NOW,
                    duration: 0,
                    endpointKey: 'getData',
                    params,
                    url: 'www.getdata.get',
                },
                [getRequestKey('postData')]: {
                    networkStatus: 'ready',
                    lastCall: 1000,
                    duration: 0,
                    endpointKey: 'postData',
                    url: 'www.postdate.post',
                },
            },
        };
        expect(reducer(updatedState, action)).toEqual(newState);
    });
});

describe('API_DATA_SUCCESS', () => {
    test('new state is correct', () => {
        const requestKey = getRequestKey('postData');
        // @ts-ignore struggle faking the Response object from fetch. For test it is sufficient like this.
        const action: ApiDataSuccessAction = {
            type: 'API_DATA_SUCCESS',
            payload: {
                requestKey,
                response: {
                    // @ts-ignore
                    body: { data: 'json', extraData: 'moreJson' },
                    ok: true,
                    redirected: false,
                    status: 200,
                    statusText: 'ok',
                },
                responseBody: { data: 'json', extraData: 'moreJson' },
            },
        };

        const resultState = reducer(updatedState, action);

        expect(resultState).toEqual({
            ...updatedState,
            requests: {
                [requestKey]: {
                    networkStatus: 'success',
                    lastCall: 1000,
                    duration: MOCK_NOW - 1000,
                    result: { data: 'json', extraData: 'moreJson' },
                    response: {
                        body: { data: 'json', extraData: 'moreJson' },
                        ok: true,
                        redirected: false,
                        status: 200,
                        statusText: 'ok',
                    },
                    errorBody: undefined,
                    endpointKey: 'postData',
                    url: 'www.postdate.post',
                },
            },
        });
    });
});

describe('API_DATA_SUCCESS with payload entity', () => {
    test('new state is correct', () => {
        // @ts-ignore struggle faking the Response object from fetch. For test it is sufficient like this.
        const action: ApiDataSuccessAction = {
            type: 'API_DATA_SUCCESS',
            payload: {
                requestKey: getRequestKey('postData'),
                response: {
                    // @ts-ignore
                    body: { id: 1, data: 'json' },
                    ok: true,
                    redirected: false,
                    status: 200,
                    statusText: 'ok',
                },
                responseBody: { id: 1, data: 'json' },
                normalizedData: {
                    entities: { articles: { 1: { id: 1, data: 'json', comments: ['nice'] } } },
                    // @ts-ignore
                    result: { articles: { 1: { id: 1, data: 'json', comments: ['nice'] } } },
                },
            },
        };

        const newState = {
            ...updatedState,
            requests: {
                [getRequestKey('postData')]: {
                    networkStatus: 'success',
                    lastCall: 1000,
                    duration: Date.now() - 1000,
                    result: { articles: { 1: { id: 1, data: 'json', comments: ['nice'] } } },
                    response: {
                        body: { id: 1, data: 'json' },
                        ok: true,
                        redirected: false,
                        status: 200,
                        statusText: 'ok',
                    },
                    errorBody: undefined,
                    endpointKey: 'postData',
                    url: 'www.postdate.post',
                },
            },
            entities: { articles: { 1: { id: 1, data: 'json', comments: ['nice'] } } },
        };
        expect(reducer(updatedState, action)).toEqual(newState);
    });
});

describe('API_DATA_FAIL', () => {
    test('new state is correct', () => {
        const action: ApiDataFailAction = {
            type: 'API_DATA_FAIL',
            payload: {
                requestKey: getRequestKey('postData'),
                // @ts-ignore
                response: {
                    // @ts-ignore
                    body: { data: 'json', extraData: 'moreJson' },
                    ok: true,
                    redirected: false,
                    status: 200,
                    statusText: 'ok',
                },
                errorBody: 'oopsie',
            },
        };

        const newState = {
            ...updatedState,
            requests: {
                [getRequestKey('postData')]: {
                    networkStatus: 'failed',
                    lastCall: 1000,
                    duration: Date.now() - 1000,
                    response: {
                        body: { data: 'json', extraData: 'moreJson' },
                        ok: true,
                        redirected: false,
                        status: 200,
                        statusText: 'ok',
                    },
                    errorBody: 'oopsie',
                    result: undefined,
                    endpointKey: 'postData',
                    url: 'www.postdate.post',
                },
            },
        };
        expect(reducer(updatedState, action)).toEqual(newState);
    });
});

const invalidateAbleState: ApiDataState = {
    ...initialState,
    requests: {
        [getRequestKey('postData')]: {
            networkStatus: 'success',
            lastCall: 1000,
            duration: 0,
            endpointKey: 'postData',
            url: 'www.postdate.post',
        },
    },
};

describe('INVALIDATE_API_DATA_REQUEST', () => {
    test('new state is correct', () => {
        const action: InvalidateApiDataRequestAction = {
            type: 'INVALIDATE_API_DATA_REQUEST',
            payload: {
                requestKey: getRequestKey('postData'),
            },
        };

        const newState = {
            ...invalidateAbleState,
            requests: {
                [getRequestKey('postData')]: {
                    networkStatus: 'ready',
                    lastCall: 1000,
                    duration: 0,
                    endpointKey: 'postData',
                    url: 'www.postdate.post',
                },
            },
        };
        expect(reducer(invalidateAbleState, action)).toEqual(newState);
    });
});

describe('PURGE_API_DATA_REQUEST', () => {
    test('new state is correct', () => {
        const getRequestKeys = [getRequestKey('A'), getRequestKey('B', { paramA: 'a' }), getRequestKey('B')];

        const purgeState: ApiDataState = {
            ...initialState,
            // @ts-ignore struggle faking the Response object from fetch. For test it is sufficient like this.
            requests: {
                [getRequestKeys[0]]: getMockRequest(getRequestKeys[0]),
                [getRequestKeys[1]]: getMockRequest(getRequestKeys[1]),
                [getRequestKeys[2]]: getMockRequest(getRequestKeys[2]),
            },
        };

        let newState = reducer(purgeState, purgeRequest('A'));
        expect(getApiDataRequest(newState, 'A')).toBeUndefined();
        expect(getApiDataRequest(newState, 'B', { paramA: 'a' })).toEqual(purgeState.requests[getRequestKeys[1]]);
        expect(getApiDataRequest(newState, 'B')).toEqual(purgeState.requests[getRequestKeys[2]]);
        newState = reducer(newState, purgeRequest('B'));
        expect(getApiDataRequest(newState, 'A')).toBeUndefined();
        expect(getApiDataRequest(newState, 'B', { paramA: 'a' })).toEqual(purgeState.requests[getRequestKeys[1]]);
        expect(getApiDataRequest(newState, 'B')).toBeUndefined();
        newState = reducer(newState, purgeRequest('B', { paramA: 'a' }));
        expect(getApiDataRequest(newState, 'A')).toBeUndefined();
        expect(getApiDataRequest(newState, 'B', { paramA: 'a' })).toBeUndefined();
        expect(getApiDataRequest(newState, 'B')).toBeUndefined();
    });
});

describe('CLEAR_API_DATA', () => {
    test('new state is correct', () => {
        const action: ClearApiDataAction = {
            type: 'CLEAR_API_DATA',
        };

        expect(reducer(invalidateAbleState, action)).toEqual(defaultState);
    });
});

describe('PURGE_ALL_API_DATA', () => {
    test('new state is correct', () => {
        const action: PurgeAllApiDataAction = {
            type: 'PURGE_ALL_API_DATA',
        };

        const newState = {
            ...invalidateAbleState,
            requests: {},
        };
        expect(reducer(invalidateAbleState, action)).toEqual(newState);
    });
});

describe('API_DATA_AFTER_REHYDRATE', () => {
    test('new state is correct', () => {
        const action: ApiDataAfterRehydrateAction = {
            type: 'API_DATA_AFTER_REHYDRATE',
        };

        const newState = {
            ...invalidateAbleState,
        };
        expect(reducer(invalidateAbleState, action)).toEqual(newState);
    });
});

const initialStateWithEntities = {
    ...initialState,
    entities: {
        articles: { 1: { id: 1, data: 'json' } },
    },
};
describe('addEntities function', () => {
    test('merged entities correctly', () => {
        const newEntities = { users: { 1: { id: 1, name: 'json', age: 12 } } };
        const addedEntities = {
            articles: { 1: { id: 1, data: 'json' } },
            users: { 1: { id: 1, name: 'json', age: 12 } },
        };
        expect(addEntities(initialStateWithEntities.entities, newEntities)).toEqual(addedEntities);
    });
    test('merged entities correctly', () => {
        const newEntities = { articles: { 2: { id: 2, data: 'moreJson' } } };
        const addedEntities = {
            articles: {
                1: { id: 1, data: 'json' },
                2: { id: 2, data: 'moreJson' },
            },
        };
        expect(addEntities(initialStateWithEntities.entities, newEntities)).toEqual(addedEntities);
    });

    test('merged entities correctly', () => {
        const newEntities = { articles: { 1: { id: 1, data: 'json', comments: ['nice'] } } };
        const addedEntities = {
            articles: { 1: { id: 1, data: 'json', comments: ['nice'] } },
        };
        expect(addEntities(initialStateWithEntities.entities, newEntities)).toEqual(addedEntities);
    });
});

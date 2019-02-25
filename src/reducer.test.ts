import reducer, {
    ApiDataState,
    ClearApiDataAction,
    defaultState,
    FetchApiDataAction,
    recoverNetworkStatuses
} from './reducer';
import { setPostHeaders, setPostRequestProperties } from './mocks/mockActions';
import { ConfigureApiDataAction } from './actions/configureApiData';
import { getRequestKey } from './helpers/getRequestKey';
import { ApiDataSuccessAction } from './actions/apiDataSuccess';
import { ApiDataFailAction } from './actions/apiDataFail';
import { InvalidateApiDataRequestAction } from './actions/invalidateApiDataRequest';
import { PurgeApiDataAction } from './actions/purgeApiData';
import { ApiDataAfterRehydrateAction } from './actions/afterRehydrate';

test('recoverNetworkStatuses should return a new requests map with loading states reset to ready', () => {
    const input = {
        a: {
            networkStatus: 'ready'
        },
        b: {
            networkStatus: 'loading'
        },
        c: {
            networkStatus: 'success'
        },
        d: {
            networkStatus: 'failed'
        },
        e: {
            networkStatus: 'loading',
            lastCall: 123
        }

    } as any;

    const output = recoverNetworkStatuses(input);

    expect(output).not.toBe(input);
    expect(output).toEqual({
        a: {
            networkStatus: 'ready'
        },
        b: {
            networkStatus: 'ready'
        },
        c: {
            networkStatus: 'success'
        },
        d: {
            networkStatus: 'failed'
        },
        e: {
            networkStatus: 'ready',
            lastCall: 123
        }
    });
});

const initialState: ApiDataState = {
    globalConfig: {
        setHeaders: setPostHeaders,
        setRequestProperties: setPostRequestProperties
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
        }
    },
    requests: {},
    entities: {}
};

describe('CONFIGURE_API_DATA', () => {
    test('initial state gets configured correctly', () => {
        const action: ConfigureApiDataAction = {
            type: 'CONFIGURE_API_DATA',
            payload: {
                globalConfig: {
                    setHeaders: setPostHeaders,
                    setRequestProperties: setPostRequestProperties
                },
                endpointConfig: {
                    getData: {
                        url: 'www.getdata.get',
                        method: 'GET',
                        timeout: 1000
                    },
                    postData: {
                        url: 'www.postdate.post',
                        method: 'POST',
                    }
                }
            }
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
        }
    }
};

describe('FETCH_API_DATA', () => {
    test('new stat is correct', () => {
        const params = { id: 'one' };
        const action: FetchApiDataAction = {
            type: 'FETCH_API_DATA',
            payload: {
                endpointKey: 'getData',
                requestKey: getRequestKey('getData', params),
                params
            },
        };
        const newState = {
            ...updatedState,
            requests: {
                [getRequestKey('getData', params)]: {
                    networkStatus: 'loading',
                    lastCall: Date.now(),
                    duration: 0,
                    endpointKey: 'getData',
                    params
                },
                [getRequestKey('postData')]: {
                    networkStatus: 'ready',
                    lastCall: 1000,
                    duration: 0,
                    endpointKey: 'postData',
                }
            }
        };
        expect(reducer(updatedState, action)).toEqual(newState);
    });
});

describe('API_DATA_SUCCESS', () => {
    test('new state is correct', () => {
        // @ts-ignore
        const action: ApiDataSuccessAction = {
            type: 'API_DATA_SUCCESS',
            payload: {
                requestKey: getRequestKey('postData'),
                response: {
                    body: { data: 'json', extraData: 'moreJson' },
                    ok: true,
                    redirected: false,
                    status: 200,
                    statusText: 'ok'
                },
                responseBody: { data: 'json', extraData: 'moreJson' }
            },
        };

        const newState = {
            ...updatedState,
            requests: {
                [getRequestKey('postData')]: {
                    networkStatus: 'success',
                    lastCall: 1000,
                    duration: Date.now() - 1000,
                    result: { data: 'json', extraData: 'moreJson' },
                    response: {
                        body: { data: 'json', extraData: 'moreJson' },
                        ok: true,
                        redirected: false,
                        status: 200,
                        statusText: 'ok'
                    },
                    errorBody: undefined,
                    endpointKey: 'postData',
                }
            }
        };
        expect(reducer(updatedState, action)).toEqual(newState);
    });
});

describe('API_DATA_FAIL', () => {
    test('new state is correct', () => {
        // @ts-ignore
        const action: ApiDataFailAction = {
            type: 'API_DATA_FAIL',
            payload: {
                requestKey: getRequestKey('postData'),
                response: {
                    body: { data: 'json', extraData: 'moreJson' },
                    ok: true,
                    redirected: false,
                    status: 200,
                    statusText: 'ok'
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
                        statusText: 'ok'
                    },
                    errorBody: 'oopsie',
                    result: undefined,
                    endpointKey: 'postData',
                }
            }
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
        }
    }
};

describe('INVALIDATE_API_DATA_REQUEST', () => {
    test('new state is correct', () => {
        const action: InvalidateApiDataRequestAction = {
            type: 'INVALIDATE_API_DATA_REQUEST',
            payload: {
                requestKey: getRequestKey('postData'),
            }
        };

        const newState = {
            ...invalidateAbleState,
            requests: {
                [getRequestKey('postData')]: {
                    networkStatus: 'ready',
                    lastCall: 1000,
                    duration: 0,
                    endpointKey: 'postData'
                }
            }
        };
        expect(reducer(invalidateAbleState, action)).toEqual(newState);
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

describe('PURGE_API_DATA', () => {
    test('new state is correct', () => {
        const action: PurgeApiDataAction = {
            type: 'PURGE_API_DATA',
        };

        const newState = {
            ...invalidateAbleState,
            requests: {}
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

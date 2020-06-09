import getState from '../mocks/mockState';
import { performRequest } from './performRequest';
import request, { HandledResponse } from '../request';
import { success } from './success';
import { getRequestKey } from '../helpers/getRequestKey';
import { fail } from './fail';
import { EndpointParams, ConfigBeforeProps } from '../types';
import { getResultData } from '..';
import { getRequest } from '..';
import thunk from 'redux-thunk';
import { applyMiddleware, createStore, combineReducers } from 'redux';
import reducer from '../reducer';
import { configure } from './configure';

const defaultState = {
    apiData: {
        globalConfig: {},
        endpointConfig: {},
        requests: {},
        entities: {},
    },
};

const dispatch = jest.fn();

jest.mock('../request', () =>
    jest.fn(
        () =>
            new Promise(resolve => {
                setTimeout(() => {
                    const rand = Math.random();
                    resolve({
                        response: {
                            ok: true,
                        },
                        body: {
                            rand,
                        },
                    });
                }, 500);
            })
    )
);

const response1 = {
    response: {
        body: { data: 'json' },
        ok: true,
        redirected: false,
        status: 200,
        statusText: 'ok',
    },
};

const response2 = {
    response: {
        body: { data: 'json' },
        ok: false,
        redirected: false,
        status: 200,
        statusText: 'ok',
    },
    body: { msg: 'error' },
};

const response3 = {
    response: {
        body: { data: 'json', extraData: 'moreJson' },
        ok: true,
        redirected: false,
        status: 200,
        statusText: 'ok',
    },
    body: {
        response: 3,
    },
};

const mockResponse = (response: any) => {
    (request as jest.Mock).mockImplementation(() => Promise.resolve(response));
};

describe('performRequest', () => {
    afterEach(() => {
        (request as jest.Mock).mockClear();
        dispatch.mockClear();
    });

    test('It gets an error message when config is empty', () => {
        const state = defaultState;
        return expect(performRequest('postData/', {}, { data: 'json' })(dispatch, () => state)).rejects.toBe(
            'apiData.performRequest: no config with key postData/ found!'
        );
    });

    test('The function resolves when request is loading with result data', () => {
        const store = createStore(combineReducers({ apiData: reducer }), applyMiddleware(thunk));
        store.dispatch(configure({}, {
            postData: {
                url: 'mockAction.get',
                method: 'POST',
            }
        }));

        const firstCall = performRequest(
            'postData',
            {},
            { data: 'json' }
        )(store.dispatch, store.getState);
        const secondCall = performRequest(
            'postData',
            {},
            { data: 'json' }
        )(store.dispatch, store.getState);
        return Promise.all([firstCall, secondCall]).then(([firstResult, secondResult]) => {
            expect(firstResult).toEqual(secondResult);
        });
    });

    test('The function resolves when request is success with result data', () => {
        const state = { apiData: getState('postData', true, {}, 'success', { method: 'POST' }) };
        const result = {
            data: getResultData(state.apiData, 'postData', {}),
            request: getRequest(state.apiData, 'postData', {}),
        };
        return performRequest(
            'postData',
            {},
            { data: 'json' }
        )(dispatch, () => state).then(output => {
            expect(output.data).toEqual(result.data);
            expect(output.request).toEqual(result.request);
            expect(typeof output.perform).toEqual('function');
        });
    });

    test('should dispatch FETCH_API_DATA if call does not have a valid cache', () => {
        mockResponse(response1);

        // call has already been triggered within cache duration
        const state = {
            apiData: getState('getData', true, {}, 'success', { method: 'GET', cacheDuration: 1000 }),
        };
        performRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'FETCH_API_DATA' }));

        // call has not been triggered before
        performRequest('getData', {}, { data: 'json' })(dispatch, () => ({ apiData: getState('getData') }));
        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', {}),
                endpointKey: 'getData',
                params: {},
                url: 'mockAction.get',
            },
        });

        // cache has expired
        const params = { test: 'a' }; // include test for params here
        performRequest('getData', params, { data: 'json' })(dispatch, () => ({
            apiData: getState('getData', true, { getData: params }, 'success', { cacheDuration: 500 }, {}, Date.now() - 1000),
        }));
        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', params),
                endpointKey: 'getData',
                params: { test: 'a' },
                url: 'mockAction.get?test=a',
            },
        });
    });

    test('The function resolves with custom response and calls success', async () => {
        const state = { apiData: getState('postData', true, {}, 'ready', { method: 'POST' }) };
        mockResponse(response1);
        await performRequest('postData', {}, { data: 'json' })(dispatch, () => state);
        return expect(dispatch).toHaveBeenCalledWith(
            // @ts-ignore
            success(getRequestKey('postData'), state.apiData.endpointConfig, response1.response, undefined)
        );
    });

    test('it calls Fail when ok = false', async () => {
        const requestKey = getRequestKey('postData');
        const state = { apiData: getState('postData', true, {}, 'ready', { method: 'POST' }) };
        mockResponse(response2);
        await performRequest('postData', {}, { data: 'json' })(dispatch, () => state);
        // @ts-ignore
        return expect(dispatch).toHaveBeenCalledWith(fail(requestKey, response2.body, response2.response));
    });

    test('The function resolves with cacheDuration but does not trigger the request function when the cacheDuration is not outdated yet', async () => {
        const state = { apiData: getState('getData', true, {}, 'success', { method: 'GET', cacheDuration: 1000 }) };
        mockResponse(response1);
        await performRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        const requestKey = getRequestKey('getData');
        return expect(dispatch).not.toHaveBeenCalledWith(
            // @ts-ignore
            success(getRequestKey('getData'), state.apiData.endpointConfig, response1.response, undefined),
            fail(requestKey, response1.response, undefined)
        );
    });

    test('should call beforeSuccess from endpointConfig and globalConfig', async () => {
        const postBody = { data: 'json' };
        const beforePropsMatch = {
            endpointKey: 'getData',
            request: expect.any(Object),
            requestBody: postBody,
        };

        const endpointBeforeSuccess = ({ response, body }: HandledResponse, beforeProps: ConfigBeforeProps) => {
            expect(beforeProps).toEqual(beforePropsMatch);
            return {
                response,
                body: {
                    ...body,
                    endpoint: true,
                },
            };
        };
        const globalBeforeSuccess = ({ response, body }: HandledResponse, beforeProps: ConfigBeforeProps) => {
            expect(beforeProps).toEqual(beforePropsMatch);
            return {
                response,
                body: {
                    ...body,
                    global: true,
                },
            };
        };

        // @ts-ignore (no Response mock)
        const state = {
            apiData: getState(
                'getData',
                true,
                {},
                'ready',
                { method: 'GET', cacheDuration: 1, beforeSuccess: endpointBeforeSuccess },
                { beforeSuccess: globalBeforeSuccess }
            ),
        };
        mockResponse(response3);
        await performRequest('getData', {}, postBody)(dispatch, () => state);

        expect(dispatch).toHaveBeenCalledWith(
                success(
                getRequestKey('getData'),
                state.apiData.endpointConfig,
                // @ts-ignore fake Response object
                response3.response,
                { ...response3.body, endpoint: true, global: true }
            )
        );
    });

    test('beforeSuccess should be able to turn success into fail', async () => {
        const beforeSuccess = (resp: HandledResponse) => ({
            response: { ...resp.response, ok: false },
            body: resp.body,
        });
        const state = {
            apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: 1, beforeSuccess }),
        };
        mockResponse(response3);
        await performRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        expect(dispatch)
            .toHaveBeenCalledWith(
                // @ts-ignore fake Response
                fail(getRequestKey('getData'), response3.body, { ...response3.response, ok: false })
            );
        expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'API_DATA_SUCCESS' }));
    });

    test('should call beforeFailed from endpointConfig and globalConfig', async () => {
        const postBody = { data: 'json' };
        const beforePropsMatch = {
            endpointKey: 'getData',
            request: expect.any(Object),
            requestBody: postBody,
        };

        const endpointbeforeFailed = ({ response, body }: HandledResponse, beforeProps: ConfigBeforeProps) => {
            expect(beforeProps).toEqual(beforePropsMatch);
            return {
                response,
                body: {
                    ...body,
                    endpoint: true,
                },
            };
        };
        const globalbeforeFailed = ({ response, body }: HandledResponse, beforeProps: ConfigBeforeProps) => {
            expect(beforeProps).toEqual(beforePropsMatch);
            return {
                response,
                body: {
                    ...body,
                    global: true,
                },
            };
        };

        // @ts-ignore (no Response mock)
        const state = {
            apiData: getState(
                'getData',
                true,
                {},
                'ready',
                { method: 'GET', cacheDuration: 1, beforeFailed: endpointbeforeFailed },
                { beforeFailed: globalbeforeFailed }
            ),
        };
        mockResponse(response2);
        await (performRequest('getData', {}, { data: 'json' })(dispatch, () => state));
        return expect(dispatch).toHaveBeenCalledWith(
            fail(
                getRequestKey('getData'),
                { ...response2.body, endpoint: true, global: true },
                // @ts-ignore fake Response object
                response2.response,
            )
        );
    });

    test('beforeFailed should be able to turn fail into success', async () => {
        const beforeFailed = (resp: HandledResponse) => ({
            response: { ...resp.response, ok: true },
            body: resp.body,
        });
        const state = {
            apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: 1, beforeFailed }),
        };
        mockResponse(response2);
        await performRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        expect(dispatch)
            .toHaveBeenCalledWith(success(
                getRequestKey('getData'),
                state.apiData.endpointConfig,
                // @ts-ignore fake Response
                { ...response2.response, ok: true },
                response2.body
            )
        );

        expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'API_DATA_FAIL' }));
    });

    test('should call afterSuccess if set in config', async () => {
        const endpointAfterSuccess = jest.fn();
        const globalAfterSuccess = jest.fn();
        const postBody = { data: 'json' };
        const state = {
            apiData: getState(
                'getData',
                true,
                {},
                'ready',
                { method: 'GET', cacheDuration: -1, afterSuccess: endpointAfterSuccess },
                { afterSuccess: globalAfterSuccess }
            ),
        };
        const getStateFn = () => state;
        mockResponse(response1);
        await performRequest('getData', {}, postBody)(dispatch, getStateFn);
        const afterProps = {
            endpointKey: 'getData',
            request: expect.any(Object),
            requestBody: postBody,
            resultData: undefined,
            dispatch,
            getState: getStateFn,
            actions: expect.any(Object),
        };
        expect(endpointAfterSuccess).toHaveBeenCalledWith(afterProps);
        expect(globalAfterSuccess).toHaveBeenCalledWith(afterProps);
    });

    test('should not call afterSuccess in globalConfig if afterSuccess in endpointConfig returns false', async () => {
        const endpointAfterSuccess = jest.fn();
        const globalAfterSuccess = jest.fn();
        endpointAfterSuccess.mockReturnValue(false);
        const state = {
            apiData: getState(
                'getData',
                true,
                {},
                'ready',
                { method: 'GET', cacheDuration: -1, afterSuccess: endpointAfterSuccess },
                { afterSuccess: globalAfterSuccess }
            ),
        };
        mockResponse(response1);
        await performRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        expect(endpointAfterSuccess).toHaveBeenCalled();
        expect(globalAfterSuccess).not.toHaveBeenCalled();
    });

    test('should dispatch a failure when a timeout gets exceeded', async () => {
        const state = {
            apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: -1, timeout: 2900 }),
        };
        jest.useFakeTimers();
        (request as jest.Mock).mockImplementation(() => {
            jest.advanceTimersByTime(3000);
            return Promise.resolve(response1);
        });
        await performRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        const error = new Error('Timeout');
        const requestKey = getRequestKey('getData');
        expect(dispatch).toHaveBeenCalledWith(fail(requestKey, error));
    });

    test('The function resolves with a result argument', () => {
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: 50000 }) };
        const result = {
            data: getResultData(state.apiData, 'getData', {}),
            request: getRequest(state.apiData, 'getData', {}),
            perform: (myParams: EndpointParams, body: any) => dispatch(performRequest('getData', myParams, body))
        };
        return performRequest(
            'getData',
            {},
            { data: 'json' }
        )(dispatch, () => state).then(output => {
            expect(output.data).toEqual(result.data);
            expect(output.request).toEqual(result.request);
            expect(typeof output.perform).toEqual('function');
            expect(typeof output.invalidateCache).toEqual('function');
        });
    });

    test('The function resolves with a result argument for an instance', () => {
        const state = {
            apiData: getState(
                'getData',
                true,
                {},
                'ready',
                { method: 'GET', cacheDuration: 50000 },
                undefined,
                Date.now(),
                'primary'
            )
        };
        const result = {
            data: getResultData(state.apiData, 'getData', {}, 'primary'),
            request: getRequest(state.apiData, 'getData', {}, 'primary'),
            perform: (myParams: EndpointParams, body: any) => dispatch(performRequest('getData', myParams, body))
        };
        return performRequest(
            'getData',
            {},
            { data: 'json' },
            'primary'
        )(dispatch, () => state).then(output => {
            expect(output.data).toEqual(result.data);
            expect(output.request).toEqual(result.request);
            expect(typeof output.perform).toEqual('function');
            expect(typeof output.invalidateCache).toEqual('function');
        });
    });

    test('The function resolves with a beforeFailed argument and triggers fail with the beforeFailed response', async () => {
        const beforeFailed = () => {
            return response2;
        };
        const state = {
            // @ts-ignore (no Response mock)
            apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: 1, beforeFailed }),
        };
        mockResponse(response2);
        await performRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        return expect(dispatch).toHaveBeenCalledWith(
            // @ts-ignore
            fail(getRequestKey('getData'), response2.body, response2.response)
        );
    });

    test('should call afterFailed if set in config', async () => {
        const afterFailed = jest.fn();
        const postBody = { data: 'json' };
        const state = {
            apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: -1, afterFailed }),
        };
        const getStateFn = () => state;
        mockResponse(response2);
        await performRequest('getData', {}, postBody)(dispatch, getStateFn);
        const afterProps = {
            endpointKey: 'getData',
            request: expect.any(Object),
            requestBody: postBody,
            resultData: undefined, // result data is not generated in our mock getState function
            dispatch,
            getState: getStateFn,
            actions: expect.any(Object),
        };
        return expect(afterFailed).toHaveBeenCalledWith(afterProps);
    });

    /* TEST CASES FOR DEFAULT PARAMS  */

    test('should use the default param set in the config', () => {
        const defaultParams = {
            language: 'nl',
        };

        performRequest(
            'getData',
            {},
            { data: 'json' }
        )(dispatch, () => ({
            apiData: getState('getData', true, {}, 'success', { defaultParams, cacheDuration: 500 }, {}),
        }));

        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', defaultParams),
                endpointKey: 'getData',
                params: defaultParams,
                url: 'mockAction.get?language=nl',
            },
        });
    });

    test('param set in the URL should overwrite the default param set in the config', () => {
        const defaultParams = {
            language: 'nl',
        };

        const inputParams = {
            language: 'en',
        };

        performRequest('getData', inputParams, { data: 'json' })(dispatch, () => ({
            apiData: getState(
                'getData',
                true,
                { getData: inputParams },
                'success',
                {
                    defaultParams,
                    cacheDuration: 500,
                },
                {}
            ),
        }));

        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', inputParams),
                endpointKey: 'getData',
                params: inputParams,
                url: 'mockAction.get?language=en',
            },
        });
    });

    test('should use multiple default params set in the config', () => {
        const defaultParams = {
            language: 'nl',
            test: 'b',
        };

        performRequest(
            'getData',
            {},
            { data: 'json' }
        )(dispatch, () => ({
            apiData: getState('getData', true, {}, 'success', { defaultParams, cacheDuration: 500 }, {}),
        }));

        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', defaultParams),
                endpointKey: 'getData',
                params: {
                    ...defaultParams,
                },
                url: 'mockAction.get?language=nl&test=b',
            },
        });
    });

    test('params set in the URL should overwrite the default params set in the config', () => {
        const defaultParams = {
            language: 'nl',
            test: 'b',
        };

        const inputParams = {
            language: 'en',
            test: 'c',
        };

        performRequest('getData', inputParams, { data: 'json' })(dispatch, () => ({
            apiData: getState(
                'getData',
                true,
                { getData: inputParams },
                'success',
                {
                    defaultParams,
                    cacheDuration: 500,
                },
                {}
            ),
        }));

        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', inputParams),
                endpointKey: 'getData',
                params: inputParams,
                url: 'mockAction.get?language=en&test=c',
            },
        });
    });

    test('params set in the URL should only overwrite the matching default params set in the config', () => {
        const defaultParams = {
            language: 'nl',
            test: 'b',
        };

        const inputParams = {
            language: 'en',
            number: 1,
        };

        performRequest('getData', inputParams, { data: 'json' })(dispatch, () => ({
            apiData: getState(
                'getData',
                true,
                { getData: inputParams },
                'success',
                {
                    defaultParams,
                    cacheDuration: 500,
                },
                {}
            ),
        }));

        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', { ...defaultParams, ...inputParams }),
                endpointKey: 'getData',
                params: {
                    ...defaultParams,
                    ...inputParams,
                },
                url: 'mockAction.get?language=en&number=1&test=b',
            },
        });
    });
});

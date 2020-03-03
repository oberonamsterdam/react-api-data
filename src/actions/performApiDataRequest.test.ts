import getState from '../mocks/mockState';
import { performApiRequest } from './performApiDataRequest';
import request, { HandledResponse } from '../request';
import { apiDataSuccess } from './apiDataSuccess';
import { getRequestKey } from '../helpers/getRequestKey';
import { apiDataFail } from './apiDataFail';
import { EndpointParams, ApiDataConfigBeforeProps } from '../types';
import { getResultData } from '../selectors/getResultData';
import { getApiDataRequest } from '../selectors/getApiDataRequest';

const defaultState = {
    apiData: {
        globalConfig: {},
        endpointConfig: {},
        requests: {},
        entities: {}
    }
};

const dispatch = jest.fn();

jest.mock('../request', () =>
    jest.fn(() =>
        Promise.resolve({
            response: {
                ok: true
            }
        })
    )
);

const response1 = {
    response: {
        body: { data: 'json' },
        ok: true,
        redirected: false,
        status: 200,
        statusText: 'ok'
    }
};

const response2 = {
    response: {
        body: { data: 'json' },
        ok: false,
        redirected: false,
        status: 200,
        statusText: 'ok'
    },
    body: { msg: 'error' }
};

const response3 = {
    response: {
        body: { data: 'json', extraData: 'moreJson' },
        ok: true,
        redirected: false,
        status: 200,
        statusText: 'ok'
    },
    body: {
        response: 3,
    }
};

const mockResponse = (response: any) => {
    (request as jest.Mock).mockImplementation(() =>
        Promise.resolve(response)
    );
};

describe('performApiDataRequest', () => {
    afterEach(() => {
        (request as jest.Mock).mockClear();
        dispatch.mockClear();
    });

    test('It gets an error message when config is empty', () => {
        const state = defaultState;
        return expect(performApiRequest('postData/', {}, { data: 'json' })(dispatch, () => state)).rejects.toBe('apiData.performApiRequest: no config with key postData/ found!');
    });

    test('The function resolves when request is loading with result data', () => {
        const state = { apiData: getState('postData', true, {}, 'loading', { method: 'POST' }) };
        const result = { data: getResultData(state.apiData, 'postData', {}), request: getApiDataRequest(state.apiData, 'postData', {}) };
        return performApiRequest('postData', {}, { data: 'json' })(dispatch, () => state).then(output => {
            expect(output.data).toEqual(result.data);
            expect(output.request).toEqual(result.request);
            expect(typeof output.perform).toEqual('function');
        });
    });

    test('should dispatch FETCH_API_DATA if call does not have a valid cache', () => {
        mockResponse(response1);

        // call has already been triggered within cache duration
        const state = {
            apiData: getState(
                'getData',
                true,
                {},
                'success',
                { method: 'GET', cacheDuration: 1000 },
            )
        };
        performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'FETCH_API_DATA' }));

        // call has not been triggered before
        performApiRequest('getData', {}, { data: 'json' })(
            dispatch,
            () => ({ apiData: getState('getData') })
        );
        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', {}),
                endpointKey: 'getData',
                endParams: {},
                url: 'mockAction.get',
            }
        });

        // cache has expired
        const endParams = { test: 'a' }; // include test for params here
        performApiRequest('getData', endParams, { data: 'json' })(
            dispatch,
            () => ({
                apiData: getState(
                    'getData',
                    true,
                    endParams,
                    'success',
                    { cacheDuration: 500 },
                    {},
                    Date.now() - 1000
                )
            })
        );
        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', endParams),
                endpointKey: 'getData',
                endParams: { test: 'a' },
                url: 'mockAction.get?test=a',
            }
        });
    });

    test('The function resolves with custom response and calls apiDataSuccess', async () => {
        const state = { apiData: getState('postData', true, {}, 'ready', { method: 'POST' }) };
        mockResponse(response1);
        await (performApiRequest('postData', {}, { data: 'json' })(dispatch, () => state));
        // @ts-ignore
        return expect(dispatch).toHaveBeenCalledWith(apiDataSuccess(getRequestKey('postData'), state.apiData.endpointConfig, response1.response, undefined));

    });

    test('it calls ApiDataFail when ok = false', async () => {
        const requestKey = getRequestKey('postData');
        const state = { apiData: getState('postData', true, {}, 'ready', { method: 'POST' }) };
        mockResponse(response2);
        await (performApiRequest('postData', {}, { data: 'json' })(dispatch, () => state));
        // @ts-ignore
        return expect(dispatch).toHaveBeenCalledWith(apiDataFail(requestKey, response2.body, response2.response));
    });

    test('The function resolves with cacheDuration but does not trigger the request function when the cacheDuration is not outdated yet', async () => {
        const state = { apiData: getState('getData', true, {}, 'success', { method: 'GET', cacheDuration: 1000 }) };
        mockResponse(response1);
        await performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        const requestKey = getRequestKey('getData');
        // @ts-ignore
        return expect(dispatch).not.toHaveBeenCalledWith(apiDataSuccess(getRequestKey('getData'), state.apiData.endpointConfig, response1.response, undefined), apiDataFail(requestKey, response1.response, undefined));
    });

    test('should call beforeSuccess from endpointConfig and globalConfig', async () => {
        const postBody = { data: 'json' };
        const beforePropsMatch = {
            endpointKey: 'getData',
            request: expect.any(Object),
            requestBody: postBody,
        };

        const endpointBeforeSuccess = ({ response, body }: HandledResponse, beforeProps: ApiDataConfigBeforeProps) => {
            expect(beforeProps).toEqual(beforePropsMatch);
            return {
                response,
                body: {
                    ...body,
                    endpoint: true,
                }
            };
        };
        const globalBeforeSuccess = ({ response, body }: HandledResponse, beforeProps: ApiDataConfigBeforeProps) => {
            expect(beforeProps).toEqual(beforePropsMatch);
            return {
                response,
                body: {
                    ...body,
                    global: true,
                }
            };
        };

        // @ts-ignore (no Response mock)
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: 1, beforeSuccess: endpointBeforeSuccess }, { beforeSuccess: globalBeforeSuccess }) };
        mockResponse(response3);
        await (performApiRequest('getData', {}, postBody)(dispatch, () => state));

        expect(dispatch)
            .toHaveBeenCalledWith(apiDataSuccess(
                getRequestKey('getData'),
                state.apiData.endpointConfig,
                // @ts-ignore fake Response object
                response3.response,
                { ...response3.body, endpoint: true, global: true }
            ));
    });

    test('beforeSuccess should be able to turn success into fail', async () => {
        const beforeSuccess = (resp: HandledResponse) => ({
            response: { ...resp.response, ok: false },
            body: resp.body
        });
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: 1, beforeSuccess }) };
        mockResponse(response3);
        await performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        expect(dispatch)
            // @ts-ignore fake Response
            .toHaveBeenCalledWith(apiDataFail(getRequestKey('getData'), response3.body, { ...response3.response, ok: false }));

        expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'API_DATA_SUCCESS' }));
    });

    test('should call beforeFailed from endpointConfig and globalConfig', async () => {
        const postBody = { data: 'json' };
        const beforePropsMatch = {
            endpointKey: 'getData',
            request: expect.any(Object),
            requestBody: postBody,
        };

        const endpointbeforeFailed = ({ response, body }: HandledResponse, beforeProps: ApiDataConfigBeforeProps) => {
            expect(beforeProps).toEqual(beforePropsMatch);
            return {
                response,
                body: {
                    ...body,
                    endpoint: true,
                }
            };
        };
        const globalbeforeFailed = ({ response, body }: HandledResponse, beforeProps: ApiDataConfigBeforeProps) => {
            expect(beforeProps).toEqual(beforePropsMatch);
            return {
                response,
                body: {
                    ...body,
                    global: true,
                }
            };
        };

        // @ts-ignore (no Response mock)
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: 1, beforeFailed: endpointbeforeFailed }, { beforeFailed: globalbeforeFailed }) };
        mockResponse(response2);
        await (performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state));
        return expect(dispatch)
            .toHaveBeenCalledWith(
                apiDataFail(
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
            body: resp.body
        });
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: 1, beforeFailed }) };
        mockResponse(response2);
        await performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        expect(dispatch)
            .toHaveBeenCalledWith(apiDataSuccess(
                getRequestKey('getData'),
                state.apiData.endpointConfig,
                // @ts-ignore fake Response
                { ...response2.response, ok: true },
                response2.body,
            ));

        expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'API_DATA_FAIL' }));
    });

    test('should call afterSuccess if set in config', async () => {
        const endpointAfterSuccess = jest.fn();
        const globalAfterSuccess = jest.fn();
        const postBody = { data: 'json' };
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: -1, afterSuccess : endpointAfterSuccess }, { afterSuccess: globalAfterSuccess }) };
        const getStateFn = () => state;
        mockResponse(response1);
        await performApiRequest('getData', {}, postBody)(dispatch, getStateFn);
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
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: -1, afterSuccess: endpointAfterSuccess }, { afterSuccess: globalAfterSuccess }) };
        mockResponse(response1);
        await (performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state));
        expect(endpointAfterSuccess).toHaveBeenCalled();
        expect(globalAfterSuccess).not.toHaveBeenCalled();
    });

    test('should dispatch a failure when a timeout gets exceeded', async () => {
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: -1, timeout: 2900 }) };
        jest.useFakeTimers();
        (request as jest.Mock).mockImplementation(() => {
            jest.advanceTimersByTime(3000);
            return Promise.resolve(response1);
        });
        await performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state);
        const error = new Error('Timeout');
        const requestKey = getRequestKey('getData');
        expect(dispatch).toHaveBeenCalledWith(apiDataFail(requestKey, error));
    });

    test('The function resolves with a result argument', () => {
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: 50000 }) };
        const result = { data: getResultData(state.apiData, 'getData', {}), request: getApiDataRequest(state.apiData, 'getData', {}), perform: (myParams: EndpointParams, body: any) => dispatch(performApiRequest('getData', myParams, body)) };
        return performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state).then(output => {
            expect(output.data).toEqual(result.data);
            expect(output.request).toEqual(result.request);
            expect(typeof output.perform).toEqual('function');
            expect(typeof output.invalidateCache).toEqual('function');
        });
    });

    test('The function resolves with a result argument for an instance', () => {
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: 50000 }, undefined, Date.now(), 'primary') };
        const result = { data: getResultData(state.apiData, 'getData', {}, 'primary'), request: getApiDataRequest(state.apiData, 'getData', {}, 'primary'), perform: (myParams: EndpointParams, body: any) => dispatch(performApiRequest('getData', myParams, body)) };
        return performApiRequest('getData', {}, { data: 'json' }, 'primary')(dispatch, () => state).then(output => {
            expect(output.data).toEqual(result.data);
            expect(output.request).toEqual(result.request);
            expect(typeof output.perform).toEqual('function');
            expect(typeof output.invalidateCache).toEqual('function');
        });
    });

    test('The function resolves with a beforeFailed argument and triggers apiDataFail with the beforeFailed response', async () => {
        const beforeFailed = () => {
            return response2;
        };
        // @ts-ignore (no Response mock)
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: 1, beforeFailed }) };
        mockResponse(response2);
        await (performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state));
        // @ts-ignore
        return expect(dispatch).toHaveBeenCalledWith(apiDataFail(getRequestKey('getData'), response2.body, response2.response));
    });

    test('should call afterFailed if set in config', async () => {
        const afterFailed = jest.fn();
        const postBody = { data: 'json' };
        const state = { apiData: getState('getData', true, {}, 'ready', { method: 'GET', cacheDuration: -1, afterFailed }) };
        const getStateFn = () => state;
        mockResponse(response2);
        await (performApiRequest('getData', {}, postBody)(dispatch, getStateFn));
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

    test('should use the default param set in the config', () => {
        const defaultParams = {
            language: 'nl'
        };

        performApiRequest('getData', {}, { data: 'json' })(
            dispatch,
            () => ({
                apiData: getState(
                    'getData',
                    true,
                    {},                 
                    'success',
                    { defaultParams, cacheDuration: 500 },
                    {},
                )
            })
        );

        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', defaultParams),
                endpointKey: 'getData',
                endParams: defaultParams,
                url: 'mockAction.get?language=nl',
            }
        });
    });

    test('param set in the URL should overwrite the default param set in the config', () => {
        const defaultParams = {
            language: 'nl'
        };

        const params = {
            language: 'en'
        };

        performApiRequest('getData', params, { data: 'json' })(
            dispatch,
            () => ({
                apiData: getState(
                    'getData',
                    true,
                    params,
                    'success',
                    {
                        defaultParams,
                        cacheDuration: 500
                    },
                    {},
                )
            })
        );

        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', params),
                endpointKey: 'getData',
                endParams: params,
                url: 'mockAction.get?language=en',
            }
        });
    });

    test('should use multiple default params set in the config', () => {
        const defaultParams = {
            language: 'nl',
            test: 'b'
        };

        performApiRequest('getData', {}, { data: 'json' })(
            dispatch,
            () => ({
                apiData: getState(
                    'getData',
                    true,
                    {},                 
                    'success',
                    { defaultParams, cacheDuration: 500 },
                    {},
                )
            })
        );

        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', defaultParams),
                endpointKey: 'getData',
                endParams: {
                    language: 'nl',
                    test: 'b'
                },
                url: 'mockAction.get?language=nl&test=b',
            }
        });
    });

    test('params set in the URL should overwrite the default params set in the config', () => {
        const defaultParams = {
            language: 'nl',
            test: 'b'
        };

        const params = {
            language: 'en',
            test: 'c'
        };

        performApiRequest('getData', params, { data: 'json' })(
            dispatch,
            () => ({
                apiData: getState(
                    'getData',
                    true,
                    params,
                    'success',
                    {
                        defaultParams,
                        cacheDuration: 500
                    },
                    {},
                )
            })
        );

        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', params),
                endpointKey: 'getData',
                endParams: params,
                url: 'mockAction.get?language=en&test=c',
            }
        });
    });

    test('params set in the URL should only overwrite the matching default params set in the config', () => {
        const defaultParams = {
            language: 'nl',
            test: 'b'
        };

        const params = {
            language: 'en',
            number: 1
        };

        performApiRequest('getData', params, { data: 'json' })(
            dispatch,
            () => ({
                apiData: getState(
                    'getData',
                    true,
                    params,
                    'success',
                    {
                        defaultParams,
                        cacheDuration: 500
                    },
                    {},
                )
            })
        );

        expect(dispatch).toHaveBeenCalledWith({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey: getRequestKey('getData', { ...defaultParams, ...params }),
                endpointKey: 'getData',
                endParams: { ...defaultParams, ...params },
                url: 'mockAction.get?language=en&test=b&number=1',
            }
        });
    });
});

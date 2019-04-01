import { getState } from '../mocks/mockActions';
import { performApiRequest } from './performApiDataRequest';
import request from '../request';
import { apiDataSuccess } from './apiDataSuccess';
import { getRequestKey } from '../helpers/getRequestKey';
import { apiDataFail } from './apiDataFail';

const defaultState = {
    apiData: {
        globalConfig: {},
        endpointConfig: {},
        requests: {},
        entities: {}
    }
};

let state = defaultState;

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
    }
};

const response3 = {
    response: {
        body: { data: 'json', extraData: 'moreJson' },
        ok: true,
        redirected: false,
        status: 200,
        statusText: 'ok'
    }
};

const mockResponse = (response: any) => {
    (request as jest.Mock).mockImplementation(() =>
        Promise.resolve(response)
    );
};

afterEach(() => {
    (request as jest.Mock).mockClear();
    dispatch.mockClear();
});

test('It gets an error message when config is empty', () => {
    return expect(performApiRequest('postData/', {}, { data: 'json' })(dispatch, () => state)).rejects.toBe('apiData.performApiRequest: no config with key postData/ found!');
});

test('The function resolves with custom response and calls apiDataSuccess', async () => {
    state = { apiData: getState('postData', true, {}, 'ready', 'POST') };
    mockResponse(response1);
    await (performApiRequest('postData', {}, { data: 'json' })(dispatch, () => state));
    // @ts-ignore
    return expect(dispatch).toHaveBeenCalledWith(apiDataSuccess(getRequestKey('postData'), state.apiData.endpointConfig, response1.response, undefined));

});

test('it calls ApiDataFail when ok = false', async () => {
    const requestKey = getRequestKey('postData');
    state = { apiData: getState('postData', true, {}, 'ready', 'POST') };
    mockResponse(response2);
    await (performApiRequest('postData', {}, { data: 'json' })(dispatch, () => state));
    // @ts-ignore
    return expect(dispatch).toHaveBeenCalledWith(apiDataFail(requestKey, response2.response, undefined));
});

test('The function resolves with cacheDuration but does not trigger the request function when the cacheDuration is not outdated yet', async () => {
    state = { apiData: getState('getData', true, {}, 'success', 'GET', 1000) };
    mockResponse(response1);
    await (performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state));
    const requestKey = getRequestKey('getData');
    // @ts-ignore
    return expect(dispatch).not.toHaveBeenCalledWith(apiDataSuccess(getRequestKey('getData'), state.apiData.endpointConfig, response1.response, undefined), apiDataFail(requestKey, response1.response, undefined));
});

test('The function resolves with cacheDuration but does not trigger the request function when the cacheDuration is not outdated yet', async () => {
    state = { apiData: getState('getData', true, {}, 'success', 'GET', 1000) };
    mockResponse(response1);
    await performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state);
    const requestKey = getRequestKey('getData');
    // @ts-ignore
    return expect(dispatch).not.toHaveBeenCalledWith(apiDataSuccess(getRequestKey('getData'), state.apiData.endpointConfig, response1.response, undefined), apiDataFail(requestKey, response1.response, undefined));
});

test('The function resolves with a beforeSuccess argument and triggers apiDataSuccess with the before success response', async () => {
    const beforeSuccess = () => {
        return response3;
    };
    state = { apiData: getState('getData', true, {}, 'ready', 'GET', 1, beforeSuccess) };
    mockResponse(response3);
    await (performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state));
    // @ts-ignore
    return expect(dispatch).toHaveBeenCalledWith(apiDataSuccess(getRequestKey('getData'), state.apiData.endpointConfig, response3.response, undefined));
});

test('The function resolves with an afterSuccess property the afterSuccess function gets called', async () => {
    const afterSuccessFunction = jest.fn();
    state = { apiData: getState('getData', true, {}, 'ready', 'GET', -1, undefined, afterSuccessFunction) };
    mockResponse(response1);
    await (performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state));
    return expect(afterSuccessFunction).toHaveBeenCalled();
});

test('The function resolves with a timeout argument', async () => {
    state = { apiData: getState('getData', true, {}, 'ready', 'GET', -1, undefined, undefined, 2900) };
    jest.useFakeTimers();
    (request as jest.Mock).mockImplementation(() => {
        jest.advanceTimersByTime(3000);
        return Promise.resolve(response1);
    }
    );
    await (performApiRequest('getData', {}, { data: 'json' })(dispatch, () => state));
    const error = new Error('Timeout');
    const requestKey = getRequestKey('getData');
    return expect(dispatch).toHaveBeenCalledWith(apiDataFail(requestKey, error));
});
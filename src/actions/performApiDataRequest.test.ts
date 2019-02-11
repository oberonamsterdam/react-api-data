import { getState } from '../mocks/mockActions';
import { performApiRequest } from './performApiDataRequest';
import thunk from 'redux-thunk';
import request from '../request';
import { apiDataSuccess } from './apiDataSuccess';
import configureMockStore from 'redux-mock-store';
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

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const store: any = mockStore(() => state);

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

test('It gets an error message when config is empty', () => {
    return expect(performApiRequest('postData/', {}, { data: 'json' })(dispatch, () => store.getState())).rejects.toBe('apiData.performApiRequest: no config with key postData/ found!');
});

test('The function resolves', () => {
    state = { apiData: getState('postData', true, {}, 'ready', 'POST') };
    return expect(performApiRequest('postData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
});

test('The function resolves with custom response', () => {
    state = { apiData: getState('postData', true, {}, 'ready', 'POST') };

    return expect(performApiRequest('postData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
});

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response1)
);
test('it calls ApiDataSuccess', async (done) => {
    state = { apiData: getState('postData', true, {}, 'ready', 'POST') };
    // @ts-ignore
    expect(dispatch).toHaveBeenCalledWith(apiDataSuccess(getRequestKey('postData'), state.apiData.endpointConfig, response1.response, undefined));
    done();
});

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response2)
);
test('it calls ApiDataFail', async (done) => {
    const requestKey = getRequestKey('postData');
    // @ts-ignore
    expect(dispatch).toHaveBeenCalledWith(apiDataFail(requestKey, response2.response, undefined));
    done();
});

test('The function resolves with cacheDuration', () => {
    state = { apiData: getState('getData', true, {}, 'success', 'GET', 1000) };

    return expect(performApiRequest('getData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
});

test('it does not trigger the request function with cacheDuration', async (done) => {
    (request as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve(response1)
    );

    const initialState = { apiData: getState('getData', true, {}, 'success', 'GET', 1000) };
    const requestKey = getRequestKey('getData');
    // @ts-ignore
    expect(dispatch).not.toHaveBeenCalledWith(apiDataSuccess(getRequestKey('getData'), initialState.apiData.endpointConfig, response1.response, undefined), apiDataFail(requestKey, response1.response, undefined));
    done();
});

test('The function resolves with cacheDuration', () => {
    state = { apiData: getState('getData', true, {}, 'success', 'GET', -1) };

    return expect(performApiRequest('getData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
});

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response1)
);

test('it triggers the request function and api data success when cacheDuration is expired and status: ok', async (done) => {
    const initialState = { apiData: getState('getData', true, {}, 'ready', 'GET', -1) };
    // @ts-ignore
    expect(dispatch).toHaveBeenCalledWith(apiDataSuccess(getRequestKey('getData'), initialState.apiData.endpointConfig, response1.response, undefined));
    done();
});

const response3 = {
    response: {
        body: { data: 'json', extraData: 'moreJson' },
        ok: true,
        redirected: false,
        status: 200,
        statusText: 'ok'
    }
};

const beforeSuccess = () => {
    return response3;
};

test('The function resolves with a beforeSuccess argument', () => {
    state = { apiData: getState('getData', true, {}, 'ready', 'GET', 1, beforeSuccess) };

    return expect(performApiRequest('getData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
});

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response1)
);

test('it calls apiDatasuccess with properties added by the beforeSuccess function', async (done) => {
    const initialState = { apiData: getState('getData', true, {}, 'ready', 'GET', 1, beforeSuccess) };
    // @ts-ignore
    expect(dispatch).toHaveBeenCalledWith(apiDataSuccess(getRequestKey('getData'), initialState.apiData.endpointConfig, response3.response, undefined));
    done();
});

const afterSuccessFunction = jest.fn();

const afterSuccess = () => {
    return afterSuccessFunction();
};

test('The function resolves with a beforeSuccess argument', () => {
    state = { apiData: getState('getData', true, {}, 'ready', 'GET', -1, undefined, afterSuccess) };

    return expect(performApiRequest('getData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
});

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response1)
);

test('it calls apiDatasuccess with properties added by the beforeSuccess function', async (done) => {
    // @ts-ignore
    expect(afterSuccessFunction).toHaveBeenCalled();
    done();
});

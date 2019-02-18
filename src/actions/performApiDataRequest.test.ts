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

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response1)
);

test('The function resolves with custom response and calls apiDataSuccess', async (done) => {
    state = { apiData: getState('postData', true, {}, 'ready', 'POST') };
    expect(performApiRequest('postData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
    done();
    // @ts-ignore
    expect(dispatch).toHaveBeenCalledWith(apiDataSuccess(getRequestKey('postData'), state.apiData.endpointConfig, response1.response, undefined))

});

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response2)
);
test('it calls ApiDataFail when ok = false', async (done) => {
    const requestKey = getRequestKey('postData');
    state = { apiData: getState('postData', true, {}, 'ready', 'POST') };
    expect(performApiRequest('postData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
    done();
    // @ts-ignore
    expect(dispatch).toHaveBeenCalledWith(apiDataFail(requestKey, response2.response, undefined));
});

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response1)
);

test('The function resolves with cacheDuration but does not trigger the request function when the cacheDuration is not outdated yet', async (done) => {
    state = { apiData: getState('getData', true, {}, 'success', 'GET', 1000) };
    expect(performApiRequest('getData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
    done();
    const requestKey = getRequestKey('getData');
    // @ts-ignore
    expect(dispatch).not.toHaveBeenCalledWith(apiDataSuccess(getRequestKey('getData'), state.apiData.endpointConfig, response1.response, undefined), apiDataFail(requestKey, response1.response, undefined));
});

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response1)
);

test('The function resolves when cacheDuration is outdated and triggers apiDataSuccess', async (done) => {
    state = { apiData: getState('getData', true, {}, 'success', 'GET', -1) };
    expect(performApiRequest('getData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
    done();
    // @ts-ignore
    expect(dispatch).toHaveBeenCalledWith(apiDataSuccess(getRequestKey('getData'), state.apiData.endpointConfig, response1.response, undefined));
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

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response3)
);

test('The function resolves with a beforeSuccess argument and triggers apiDataSuccess with the before success response', async (done) => {
    state = { apiData: getState('getData', true, {}, 'ready', 'GET', 1, beforeSuccess) };
    expect(performApiRequest('getData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
    done();
    // @ts-ignore
    expect(dispatch).toHaveBeenCalledWith(apiDataSuccess(getRequestKey('getData'), state.apiData.endpointConfig, response3.response, undefined));
});

const afterSuccessFunction = jest.fn();

const afterSuccess = () => {
    return afterSuccessFunction();
};

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response1)
);

test('The function resolves with an afterSuccess property the afterSuccess function gets called', async (done) => {
    state = { apiData: getState('getData', true, {}, 'ready', 'GET', -1, undefined, afterSuccess) };
    expect(performApiRequest('getData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
    done();
    expect(afterSuccessFunction).toHaveBeenCalled();
});

jest.useFakeTimers();

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response1).then(() => jest.advanceTimersByTime(4000))
);

test('The function resolves with a timeout argument', async (done) => {
    state = { apiData: getState('getData', true, {}, 'ready', 'GET', -1, undefined, undefined, 1000) };
    const requestKey = getRequestKey('getData');
    const error = new Error('Timeout');
    expect(performApiRequest('getData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
    done();
    expect(dispatch).toHaveBeenCalledWith(apiDataFail(requestKey, error));
});

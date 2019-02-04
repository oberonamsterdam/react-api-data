import { getState } from '../mocks/mockActions';
import { performApiRequest } from './performApiDataRequest';
import thunk from 'redux-thunk';
import request from '../request';
import { apiDataSuccess } from './apiDataSuccess';
import configureMockStore from 'redux-mock-store';
import { getRequestKey } from '../helpers/getRequestKey';
import {apiDataFail} from "./apiDataFail";

// TODO:
// - reject wanneer geen config is geset.

// - check of request functie wel/niet wordt aangeroepen. (aan de hand van cachduration)
// - Wanneer functie gecalled wordt, checken welke acties worden gedispatched (verschillende response statussen/ reject).
// - check of callbacks uit de config worden aangeroepen.
// -

//
// const bindings = {
//     postData: 'postData'
// };

const defaultState = {
    apiData: {
        globalConfig: {},
        endpointConfig: {},
        requests: {},
        entities: {}
    }
};

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const dispatch = jest.fn();
// const apiDataFail = jest.fn();

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
    const store: any = mockStore(defaultState);
    return expect(performApiRequest('postData/', {}, { data: 'json' })(dispatch, () => store.getState())).rejects.toBe('apiData.performApiRequest: no config with key postData/ found!');
});

test('The function resolves', () => {
    const initialState = { apiData: getState('postData', {}, 'ready', 'POST') };
    const store: any = mockStore(initialState);
    return expect(performApiRequest('postData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
});

test('The function resolves with custom response', () => {
    const initialState = { apiData: getState('postData', {}, 'ready', 'POST') };
    const store: any = mockStore(initialState);

    return expect(performApiRequest('postData', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
});

(request as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(response1)
);
test('it calls ApiDataSuccess', async (done) => {
    const initialState = { apiData: getState('postData', {}, 'ready', 'POST') };
    // @ts-ignore
    expect(dispatch).toHaveBeenCalledWith(apiDataSuccess(getRequestKey('postData'), initialState.apiData.endpointConfig, response1.response, undefined));
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

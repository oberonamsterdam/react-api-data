import { getState } from '../mocks/mockActions';
import { performApiRequest } from './performApiDataRequest';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
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
const request = jest.fn();
// const apiDataFail = jest.fn();

const mockPromise = (mockBody: object, mockResponse: object) => {
    return () => new Promise((resolve, reject) => {
        process.nextTick(() => {
            return resolve({
                response: mockResponse,
                body: mockBody
            });
        })
    });
};

test('It gets an error message when config is empty', () => {
    const store: any = mockStore(defaultState);
    return expect(performApiRequest('postData/', {}, {data: 'json'})(dispatch, () => store.getState())).rejects.toBe('apiData.performApiRequest: no config with key postData/ found!');
});

test('The request status or params has been changed', () => {
    request.mockClear();

    request.mockReturnValue(
        mockPromise({}, {ok: true})
    );

    const initialState = { apiData: getState('postData', {}, 'ready', 'POST') };
    const store: any = mockStore(initialState);
    return expect(performApiRequest('postData/', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeUndefined();
});

test('It rejects when response.ok is false', () => {
    request.mockClear();

    request.mockReturnValue(
        mockPromise({}, {ok: false})
    );

    const body = {
        // body: ReadableStream | null;
        // headers: Headers;
        // ok: boolean;
        // redirected: boolean;
        // status: number;
        // statusText: string;
        // type: ResponseType;
        // url: string;
        // clone(): Response;
    }
    
    const initialState = { apiData: getState('postData', {}, 'ready', 'POST') };
    const store: any = mockStore(initialState);

    performApiRequest('postData/', {}, body)(dispatch, () => store.getState());

    return expect(dispatch).toHaveBeenCalledWith(apiDataFail('postData', body, body));
});
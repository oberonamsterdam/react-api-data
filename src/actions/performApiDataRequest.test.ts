import { getState } from '../mocks/mockActions';
import { performApiRequest } from './performApiDataRequest';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

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

// const response1 = {
//     body: { data: 'json' },
//     ok: true,
//     redirected: false,
//     status: 200,
//     statusText: "ok"
// };
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const dispatch = jest.fn();

jest.mock('../request', () => {
    return () => new Promise((resolve, reject) => {
        process.nextTick(() => {
            return resolve(1);
        })
    });
});

test('Empty config', () => {
    const store: any = mockStore(defaultState);
    return expect(performApiRequest('postData/', {}, { data: 'json' })(dispatch, () => store.getState())).rejects.toBeTruthy();
});

test('The request status or params has been changed', () => {
    const initialState = { apiData: getState('postData', {}, 'ready', 'POST') };
    const store: any = mockStore(initialState);
    return expect(performApiRequest('postData/', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toBeTruthy();
});




// test('It sets the request properties correctly', () => {
//     const bodyOne = {};
//     const apiDataStateOne = getState(bindings, {}, 'ready', 'POST');
//     const testOne = getRequestProperties(apiDataStateOne.endpointConfig, apiDataStateOne.globalConfig, apiDataStateOne, bodyOne);
//     const propertiesOne = { body: '{}',
//         headers: { 'Content-Type': 'application/json' },
//         method: 'POST' };
//
//     expect(testOne.toEqual(propertiesOne));
// });
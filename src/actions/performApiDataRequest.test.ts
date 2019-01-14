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

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const dispatch = jest.fn();

jest.mock('../request', () => {
    return () => 10;
});

test('The request status or params has been changed', () => {

    const initialState = { apiData: getState('postData', {}, 'ready', 'POST') };
    const initialStateOne = { }
    const store: any = mockStore(initialState);
    // expect.assertions(1);
    return expect(performApiRequest('postData/', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toEqual(undefined);

    // const testOne = shouldPerformApiRequest(getProps(endpoint, {}, 'ready'), getProps(endpoint, {}, 'success'), bindings, 'getData');
    // expect(testOne).toBe(true);
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
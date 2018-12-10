import { getState } from '../mocks/mockActions';
import { performApiRequest } from './performApiDataRequest';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

//
const bindings = {
    postData: 'postData'
};
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const dispatch = jest.fn();

test('The request status or params has been changed', () => {

    const initialState = { apiData: getState('postData', {}, 'ready', 'POST') };
    const store: any = mockStore(initialState);
    // expect.assertions(1);
    return expect(performApiRequest('postData/', {}, { data: 'json' })(dispatch, () => store.getState())).resolves.toEqual(getState(bindings, {}, 'ready', 'POST'));

    // const testOne = shouldPerformApiRequest(getProps(endpoint, {}, 'ready'), getProps(endpoint, {}, 'success'), bindings, 'getData');
    // expect(testOne).toBe(true);
});
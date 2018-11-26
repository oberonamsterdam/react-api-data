import { getState } from '../../mocks/mockActions';
import {performApiRequest} from "./performApiDataRequest";
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
const bindings = {
    postData: 'postData'
};

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

test('The request status or params has been changed', () => {

    const initialState = {};
    const store = mockStore(initialState);

    const testOne = performApiRequest(getState(bindings, {}, 'ready', 'POST'));
    expect(testOne).toEqual()

    // const testOne = shouldPerformApiRequest(getProps(endpoint, {}, 'ready'), getProps(endpoint, {}, 'success'), bindings, 'getData');
    // expect(testOne).toBe(true);
});
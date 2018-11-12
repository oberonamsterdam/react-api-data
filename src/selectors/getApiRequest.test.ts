import { getApiDataRequest } from './getApiDataRequest'
import {getState} from '../../mocks/mockActions';

test('it gets the request status of a given endpoint', () => {
    const testOneEndpoint = 'data';
    const testTwoEndpoint = 'oberon';
    const params = { one: 'one', two: 'two' };

    const testOne = getApiDataRequest(getState('data', {}, 'ready'), testOneEndpoint);
    const testTwo = getApiDataRequest(getState('oberon', {oberon: params}, 'ready'), testTwoEndpoint, params);
    expect(testOne.networkStatus).toEqual('ready');
    expect(testTwo.networkStatus).not.toEqual('failed');
});

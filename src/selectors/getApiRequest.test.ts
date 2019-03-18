import { getApiDataRequest } from './getApiDataRequest';
import { getState } from '../mocks/mockActions';

test('it gets the request status of a given endpoint', () => {
    const testOneEndpoint = 'data';
    const testTwoEndpoint = 'oberon';
    const params = { one: 'one', two: 'two' };

    expect(getApiDataRequest(getState('data', true, {}, 'ready'), testOneEndpoint)).toEqual(
        {
            lastCall: 10,
            duration: 0,
            networkStatus: 'ready'
        }
        );
    expect(getApiDataRequest(getState('oberon', true, { oberon: params }, 'ready'), testTwoEndpoint, params)).not.toEqual(
        {
            lastCall: 10,
            duration: 0,
            networkStatus: 'success'
        }
    );
});

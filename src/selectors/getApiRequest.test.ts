import { getRequest } from './getRequest';
import { getState } from '../mocks/mockActions';

describe('function retrieves the request object of a given endpoint from the endpointConfig.', () => {

    test('it gets the request status of a given endpoint', () => {
        const testOneEndpoint = 'data';

        expect(getRequest(getState('data', true, {}, 'ready'), testOneEndpoint)).toEqual(
            {
                lastCall: 10,
                duration: 0,
                networkStatus: 'ready'
            }
        );
    });

    test('it gets the request status of a given endpoint', () => {
        const testTwoEndpoint = 'oberon';
        const params = { one: 'one', two: 'two' };
        expect(getRequest(getState('oberon', true, { oberon: params }, 'success'), testTwoEndpoint, params)).toEqual(
            {
                lastCall: 10,
                duration: 0,
                networkStatus: 'success'
            }
    );
    });
});

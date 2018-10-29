import { getApiDataRequest } from '../reducer';

test('it gets the request status of a given endpoint', () => {
    const testOneEndpoint = 'data';
    const testTwoEndpoint = 'oberon';
    const params = { one: 'one', two: 'two' };
    const state: any = {
        globalConfig: {},
        endpointConfig: {},
        requests: {
            'data/': {
                networkStatus: 'ready'
            },
            'oberon/one=one&two=two': {
                networkStatus: 'failed'
            }
        },
        entities: {}
    };
    const testOne = getApiDataRequest(state, testOneEndpoint);
    const testTwo = getApiDataRequest(state, testTwoEndpoint, params);
    expect(testOne).toEqual({ networkStatus: 'ready' });
    expect(testTwo).toEqual({ networkStatus: 'failed' });
});
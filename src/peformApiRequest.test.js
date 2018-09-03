import { getApiDataRequest } from './reducer';

test('it peforms and api request to a given endpoint and returns a promise', () => {
    const testOneEndpoint = 'data';
    const testTwoEndpoint = 'oberon';
    const params = {one: 'one', two: 'two'};
    const state = {
        globalConfig: {},
        endpointConfig: {},
        requests: {
            'data/': 'ready',
            'oberon/one=one&two=two': 'failed'},
        entities: {}
    };
    const testOne = getApiDataRequest(state, testOneEndpoint);
    const testTwo = getApiDataRequest(state, testTwoEndpoint, params);
    expect(testOne).toBe('ready');
    expect(testTwo).toBe('failed');
});
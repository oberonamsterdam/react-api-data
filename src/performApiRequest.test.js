import { performApiRequest } from './reducer';

const endpointKey = 'oberon';
const dispatch = () => {};
const getState = () => (
    {
        apiData: {
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
        }
    }
);

test('it performs an api request to a given endpoint and returns a promise', () => {

    // return performApiRequest(endpointKey)(dispatch, getState).then((data) => {
    expect.assertions(1);
    return expect(performApiRequest((dispatch, getState)).rejects.toMatch(`apiData.performApiRequest: no config with key ${endpointKey} found!`));
        // expect(data).toBe(`Failed: apiData.performApiRequest: no config with key ${endpointKey} found!`);
});

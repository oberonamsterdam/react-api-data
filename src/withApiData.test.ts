import { shouldPerformApiRequest } from './withApiData';
import { getRequestKey } from './reducer';

const getState: any = (binding: string, params: any, networkStatus: any) => (
{
    globalConfig: {},
    endpointConfig: {[getRequestKey(binding, params[binding])]: {
        url: '',
        method: 'GET'

    }
    },
    requests: {
        [getRequestKey(binding, params[binding])]: {
            networkStatus,
            lastCall: Date.now(),
            duration: 0,
        }
    },
    entities: {}
}
);

const getProps: any = (binding: string, params: any, networkStatus: any) => (
{
    apiData: getState(binding, params, networkStatus),
    params
}
    );

const bindings = {
    getData: 'getData'
};

test('the request have been changed', () => {
    // getProps(endpoint, {}, 'success'), getProps(endpoint, {}, 'ready')
    const endpoint = 'getData';
    const testOne = shouldPerformApiRequest(getProps(endpoint, {}, 'ready'), getProps(endpoint, {}, 'success'), bindings, 'getData');
    expect(testOne).toBe(true);

    const testTwo = shouldPerformApiRequest(getProps(endpoint, {}, 'success'), getProps(endpoint, {}, 'success'), bindings, 'getData');
    expect(testTwo).toBe(false);

    const testTree = shouldPerformApiRequest(getProps(endpoint, { getData: { one: 'one' } }, 'success'), getProps(endpoint, { getData: { two: 'two' } }, 'success'), bindings, 'getData');
    expect(testTree).toBe(true);

    const testFour = shouldPerformApiRequest(getProps(endpoint, { getData: { one: 'one' } }, 'ready'), getProps(endpoint, { getData: { one: 'one' } }, 'success'), bindings, 'getData');
    expect(testFour).toBe(true);

    const testFive = shouldPerformApiRequest(getProps(endpoint, { getData: { one: 'one' } }, 'success'), getProps(endpoint, { getData: { one: 'one' } }, 'success'), bindings, 'getData');
    expect(testFive).toBe(false);
});
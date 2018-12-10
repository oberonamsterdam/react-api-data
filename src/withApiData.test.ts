import { shouldPerformApiRequest } from './withApiData';
import { getProps } from '../mocks/mockActions';

const bindings = {
    getData: 'getData'
};

test('The request status or params has been changed', () => {
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
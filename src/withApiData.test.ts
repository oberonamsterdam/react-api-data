import { shouldPerformApiRequest } from './withApiData';
import { getProps } from '../mocks/mockActions';

const bindings = {
    getData: 'getData'
};

test('The request status or params has been changed', () => {
    const endpoint = 'getData';

    const testOne = shouldPerformApiRequest(getProps(endpoint, true, {}, 'ready'), getProps(endpoint, true, {}, 'success'), bindings, 'getData');
    expect(testOne).toBe(true);

    const testTwo = shouldPerformApiRequest(getProps(endpoint, true, {}, 'success'), getProps(endpoint, true, {}, 'success'), bindings, 'getData');
    expect(testTwo).toBe(false);

    const testTree = shouldPerformApiRequest(getProps(endpoint, true, { getData: { one: 'one' } }, 'success'), getProps(endpoint, true, { getData: { two: 'two' } }, 'success'), bindings, 'getData');
    expect(testTree).toBe(true);

    const testFour = shouldPerformApiRequest(getProps(endpoint, true, { getData: { one: 'one' } }, 'ready'), getProps(endpoint, true, { getData: { one: 'one' } }, 'success'), bindings, 'getData');
    expect(testFour).toBe(true);

    const testFive = shouldPerformApiRequest(getProps(endpoint, true, { getData: { one: 'one' } }, 'success'), getProps(endpoint, true, { getData: { one: 'one' } }, 'success'), bindings, 'getData');
    expect(testFive).toBe(false);

    const testSix = shouldPerformApiRequest(getProps(endpoint, true, { getData: { one: 'one' } }, 'ready'), getProps(endpoint, true, {}), bindings, 'getData');
    expect(testSix).toBe(true);

    const testSeven = shouldPerformApiRequest(getProps(endpoint, true, { getData: { one: 'one' } }), getProps(endpoint, false, {}), bindings, 'getData');
    expect(testSeven).toBe(true);

});
import { shouldPerformApiRequest } from './withApiData';
import { getProps } from './mocks/mockActions';

const bindings = {
    getData: 'getData'
};

test('The request status or params has been changed', () => {
    const endpoint = 'getData';
    // test binding are set correctly and status is ready
    const testOne = shouldPerformApiRequest(
        getProps(endpoint, true, {}, 'ready'),
        getProps(endpoint, true, {}, 'success'), bindings, 'getData');
    expect(testOne).toBe(true);
    // test or bindings are set correctly and status is not changed (should be false)
    const testTwo = shouldPerformApiRequest(
        getProps(endpoint, true, {}, 'success'),
        getProps(endpoint, true, {}, 'success'), bindings, 'getData');
    expect(testTwo).toBe(false);
    // test when new params are changed (should perform)
    const testTree = shouldPerformApiRequest(
        getProps(endpoint, true, { getData: { one: 'one' } }, 'success'),
        getProps(endpoint, true, { getData: { two: 'two' } }, 'success'), bindings, 'getData');
    expect(testTree).toBe(true);
    // test when params are set and status has changed
    const testFour = shouldPerformApiRequest(
        getProps(endpoint, true, { getData: { one: 'one' } }, 'ready'),
        getProps(endpoint, true, { getData: { one: 'one' } }, 'success'), bindings, 'getData');
    expect(testFour).toBe(true);
    // test when params are set but status hasn't changed
    const testFive = shouldPerformApiRequest(
        getProps(endpoint, true, { getData: { one: 'one' } }, 'success'),
        getProps(endpoint, true, { getData: { one: 'one' } }, 'success'), bindings, 'getData');
    expect(testFive).toBe(false);
    // test when status is undefined
    const testSix = shouldPerformApiRequest(
        getProps(endpoint, true, { getData: { one: 'one' } }, 'ready'),
        getProps(endpoint, true, {}), bindings, 'getData');
    expect(testSix).toBe(true);
    // test when config is undefined an old request is undefined
    const testSeven = shouldPerformApiRequest(
        getProps(endpoint, true, { getData: { one: 'one' } }),
        getProps(endpoint, false, {}, 'ready'), bindings, 'getData');
    expect(testSeven).toBe(true);

    // test when config is undefined and new config is created
    const testEight = shouldPerformApiRequest(
        getProps(endpoint, false, {}),
        getProps(endpoint, true, { getData: {} }), bindings, 'getData');
    expect(testEight).toBe(true);

});
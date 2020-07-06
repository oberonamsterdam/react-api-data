import { shouldPerformRequest, shouldAutoTrigger } from './withApiData';
import getState from './mocks/mockState';
import { Method } from './types';

export const getProps: any = (
    binding: string,
    hasRequest: boolean,
    params?: any,
    networkStatus?: any,
    config?: any,
    globalConfig?: any
) => ({
    apiData: getState(binding, hasRequest, params, networkStatus, config, globalConfig),
    params,
});

const bindings = {
    getData: 'getData',
};

const emptyParams = {
    getData: {},
};

const endpoint = 'getData';

describe('shouldPerformRequest', () => {
    test('The request status or params has been changed, binding are set correctly and status is ready', () => {
        const testOne = shouldPerformRequest(
            getProps(endpoint, true, {}, 'ready', { autoTrigger: true }),
            getProps(endpoint, true, {}, 'success', { autoTrigger: true }),
            bindings,
            'getData'
        );
        expect(testOne).toBe(true);
    });
    test('The request status or params has been changed, binding are set correctly and status is ready, but method is POST so autoTrigger is false', () => {
        const testOne = shouldPerformRequest(
            getProps(endpoint, true, {}, 'ready', { method: 'POST' }),
            getProps(endpoint, true, {}, 'success', { method: 'POST' }),
            bindings,
            'getData'
        );
        expect(testOne).toBe(false);
    });
    test('The request status or params has been changed, or bindings are set correctly and status is not changed (should be false)', () => {
        const testTwo = shouldPerformRequest(
            getProps(endpoint, true, {}, 'success', { method: 'GET' }),
            getProps(endpoint, true, {}, 'success', { method: 'GET' }),
            bindings,
            'getData'
        );
        expect(testTwo).toBe(false);
    });
    test('The request status or params has been changed, when new params are changed (should perform)', () => {
        const testTree = shouldPerformRequest(
            getProps(endpoint, true, { getData: { one: 'one' } }, 'success', { method: 'GET' }),
            getProps(endpoint, true, { getData: { two: 'two' } }, 'success'),
            bindings,
            'getData'
        );
        expect(testTree).toBe(true);
    });
    test('The request status or params has been changed, when params are set and status has changed', () => {
        const testFour = shouldPerformRequest(
            getProps(endpoint, true, { getData: { one: 'one' } }, 'ready', { autoTrigger: true }),
            getProps(endpoint, true, { getData: { one: 'one' } }, 'success', { autoTrigger: true }),
            bindings,
            'getData'
        );
        expect(testFour).toBe(true);
    });
    test("The request status or params has been changed, when params are set but status hasn't changed", () => {
        const testFive = shouldPerformRequest(
            getProps(endpoint, true, { getData: { one: 'one' } }, 'success', { method: 'GET' }),
            getProps(endpoint, true, { getData: { one: 'one' } }, 'success', { method: 'GET' }),
            bindings,
            'getData'
        );
        expect(testFive).toBe(false);
    });
    test('The request status or params has been changed, when status is undefined', () => {
        const testSix = shouldPerformRequest(
            getProps(endpoint, true, { getData: { one: 'one' } }, 'ready', { method: 'GET' }),
            getProps(endpoint, true, {}),
            bindings,
            'getData'
        );
        expect(testSix).toBe(true);
    });
    test('The request status or params has been changed, when config is undefined an old request is undefined', () => {
        const testSeven = shouldPerformRequest(
            getProps(endpoint, true, { getData: { one: 'one' } }),
            getProps(endpoint, false, {}, 'ready'),
            bindings,
            'getData'
        );
        expect(testSeven).toBe(false);
    });
    test('The request status or params has been changed, when config is undefined and new config is created', () => {
        const testEight = shouldPerformRequest(
            getProps(endpoint, false, {}),
            getProps(endpoint, true, { getData: {} }, 'ready', { method: 'GET' }),
            bindings,
            'getData'
        );
        expect(testEight).toBe(false);
    });
});

describe('shouldAutoTrigger', () => {
    test('GET triggered', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(endpoint, true, emptyParams, 'ready', { method: 'GET' }),
            'getData'
        );
        expect(testAutoTrigger).toBe(true);
    });
    test('POST/PUT/DELETE/PATCH does not trigger', () => {
        const methods: Method[] = ['POST', 'PUT', 'DELETE', 'PATCH'];
        methods.forEach(method => {
            const testAutoTrigger = shouldAutoTrigger(
                getState(endpoint, true, emptyParams, 'ready', { method }),
                'getData'
            );
            expect(testAutoTrigger).toBe(false);
        });
    });
    test('GET with endpointConfig autoTrigger false', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(endpoint, true, emptyParams, 'ready', { method: 'GET', autoTrigger: false }),
            'getData'
        );
        expect(testAutoTrigger).toBe(false);
    });
    test('POST with endpointConfig autoTrigger false', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(endpoint, true, emptyParams, 'ready', { method: 'POST', autoTrigger: true }),
            'getData'
        );
        expect(testAutoTrigger).toBe(true);
    });
    test('GET with globalConfig autoTrigger false', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(endpoint, true, emptyParams, 'ready', { method: 'GET' }, { autoTrigger: false }),
            'getData'
        );
        expect(testAutoTrigger).toBe(false);
    });
    test('POST with globalConfig autoTrigger false', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(endpoint, true, emptyParams, 'ready', { method: 'POST' }, { autoTrigger: false }),
            'getData'
        );
        expect(testAutoTrigger).toBe(false);
    });
    test('GET with globalConfig autoTrigger true and endpointConfig autoTrigger false', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(
                endpoint,
                true,
                emptyParams,
                'ready',
                { method: 'GET', autoTrigger: false },
                { autoTrigger: true }
            ),
            'getData'
        );
        expect(testAutoTrigger).toBe(false);
    });
    test('POST with globalConfig autoTrigger true and endpointConfig autoTrigger false', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(
                endpoint,
                true,
                emptyParams,
                'ready',
                { method: 'POST', autoTrigger: false },
                { autoTrigger: true }
            ),
            'getData'
        );
        expect(testAutoTrigger).toBe(false);
    });
    test('GET with globalConfig autoTrigger false and endpointConfig autoTrigger true', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(
                endpoint,
                true,
                emptyParams,
                'ready',
                { method: 'GET', autoTrigger: true },
                { autoTrigger: false }
            ),
            'getData'
        );
        expect(testAutoTrigger).toBe(true);
    });
    test('POST with globalConfig autoTrigger false and endpointConfig autoTrigger true', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(
                endpoint,
                true,
                emptyParams,
                'ready',
                { method: 'POST', autoTrigger: true },
                { autoTrigger: false }
            ),
            'getData'
        );
        expect(testAutoTrigger).toBe(true);
    });
    test('GET with globalConfig autoTrigger true and endpointConfig autoTrigger true', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(endpoint, true, emptyParams, 'ready', { method: 'GET', autoTrigger: true }, { autoTrigger: true }),
            'getData'
        );
        expect(testAutoTrigger).toBe(true);
    });
    test('POST with globalConfig autoTrigger true and endpointConfig autoTrigger true', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(
                endpoint,
                true,
                emptyParams,
                'ready',
                { method: 'POST', autoTrigger: true },
                { autoTrigger: true }
            ),
            'getData'
        );
        expect(testAutoTrigger).toBe(true);
    });
    test('GET with globalConfig autoTrigger false and endpointConfig autoTrigger false', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(
                endpoint,
                true,
                emptyParams,
                'ready',
                { method: 'GET', autoTrigger: false },
                { autoTrigger: false }
            ),
            'getData'
        );
        expect(testAutoTrigger).toBe(false);
    });
    test('POST with globalConfig autoTrigger false and endpointConfig autoTrigger false', () => {
        const testAutoTrigger = shouldAutoTrigger(
            getState(
                endpoint,
                true,
                emptyParams,
                'ready',
                { method: 'POST', autoTrigger: false },
                { autoTrigger: false }
            ),
            'getData'
        );
        expect(testAutoTrigger).toBe(false);
    });
});

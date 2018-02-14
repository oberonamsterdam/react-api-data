import { someParamsHaveChanged } from './withApiData';

describe('withApiData HOC', () => {
    test('someParamsHaveChanged should shallowly detect changes in params', () => {
        expect(someParamsHaveChanged({
            keyA: {
                param1: 1,
                param2: 'b'
            },
        }, {
            keyA: {
                param1: 1,
                param2: 'b'
            },
        })).toBe(false);

        expect(someParamsHaveChanged({
            keyA: {
                param1: 1,
                param2: 'b'
            },
        }, {
            keyA: {
                param1: '1',
                param2: 'b'
            },
        })).toBe(true);

        const obj = {};

        expect(someParamsHaveChanged({
            keyA: {
                param1: {},
            },
        }, {
            keyA: {
                param1: {},
            },
        })).toBe(true);

        expect(someParamsHaveChanged({
            keyA: {
                param1: obj,
            },
        }, {
            keyA: {
                param1: obj,
            },
        })).toBe(false);

        expect(someParamsHaveChanged({}, {})).toBe(false);
    });
});

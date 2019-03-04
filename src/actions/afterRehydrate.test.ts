import { afterRehydrate } from './afterRehydrate';

test('should set up the afterRehydrate action object with the correct type', () => {
    const action = afterRehydrate();

    expect(action).toEqual({
        type: 'API_DATA_AFTER_REHYDRATE'
    });
});
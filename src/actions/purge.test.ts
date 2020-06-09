import { purge } from './purge';

describe('Purge action creator', () => {

    test('should set up PurgeAction object', () => {
        const action = purge();

        expect(action).toEqual({
            type: 'PURGE_API_DATA'
        });
    });

});
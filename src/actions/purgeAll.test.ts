import { purgeAll } from './purgeAll';

describe('PurgeApiData action creator', () => {
    test('should set up PurgeAllApiDataAction object', () => {
        const action = purgeAll();

        expect(action).toEqual({
            type: 'PURGE_ALL_API_DATA',
        });
    });
});

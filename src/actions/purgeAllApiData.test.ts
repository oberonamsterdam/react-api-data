import { purgeAllApiData } from './purgeAllApiData';

describe('PurgeApiData action creator', () => {
    test('should set up PurgeAllApiDataAction object', () => {
        const action = purgeAllApiData();

        expect(action).toEqual({
            type: 'PURGE_ALL_API_DATA',
        });
    });
});

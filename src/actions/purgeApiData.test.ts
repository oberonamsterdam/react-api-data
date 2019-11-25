import { purgeApiData } from './purgeApiData';

describe('PurgeApiData action creator', () => {

    test('should set up PurgeApiDataAction object', () => {
        const action = purgeApiData();

        expect(action).toEqual({
            type: 'PURGE_API_DATA'
        });
    });

});
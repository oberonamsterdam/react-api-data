import { afterRehydrate } from './actions/afterRehydrate'
import { apiDataFail } from './actions/apiDataFail'
// import { getProps } from '../mocks/mockActions';

describe('actions', () => {
    it('should create an action for after rehydrate rehydrate', () => {
        let expectedAction = {
            type: 'API_DATA_AFTER_REHYDRATE'
        }
        expect(afterRehydrate()).toEqual(expectedAction)
    })

    it('should create an action for API data fail', () => {
        const requestKey = 'getData';
        const errorBody = `{error: 'error'}`;
        let expectedAction = {
            type: 'API_DATA_FAIL',
            payload: {
                requestKey,
                errorBody
            }
        }
        expect(apiDataFail(requestKey, errorBody)).toEqual(expectedAction)
    })
})
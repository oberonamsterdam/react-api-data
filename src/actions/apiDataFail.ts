import { ApiDataFailAction } from './index';

export const apiDataFail = (requestKey: string, errorBody: any, response?: Response): ApiDataFailAction => ({
    type: 'API_DATA_FAIL',
    payload: {
        requestKey,
        response,
        errorBody
    }
});
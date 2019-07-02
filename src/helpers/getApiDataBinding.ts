import { ApiDataState, EndpointParams, performApiRequest, getResultData, getApiDataRequest, ApiDataBinding, ApiDataRequest, invalidateApiDataRequest } from '..';
import { ActionCreator, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import createApiDataRequest from './createApiDataRequest';

export const getApiDataBinding = (
    apiData: ApiDataState, 
    endpointKey: string, 
    params: EndpointParams, 
    dispatch: ActionCreator<ThunkAction<{}, { apiData: ApiDataState; }, void, Action>>, 
    request?: ApiDataRequest
): ApiDataBinding<any> => {
    return ({
        data: getResultData(apiData, endpointKey, params),
        request: request || getApiDataRequest(apiData, endpointKey, params) || createApiDataRequest(endpointKey),
        perform: (myParams: EndpointParams, body: any) => dispatch(performApiRequest(endpointKey, params, body, myParams)),
        invalidateCache: () => dispatch(invalidateApiDataRequest(endpointKey, params)),
    });
};
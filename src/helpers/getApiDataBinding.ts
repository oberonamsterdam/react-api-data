import { ApiDataState, EndpointParams, performApiRequest, getResultData, getApiDataRequest, ApiDataBinding, ApiDataRequest, invalidateApiDataRequest } from '..';
import { ActionCreator, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import createApiDataRequest from './createApiDataRequest';

export const getApiDataBinding = (
    apiData: ApiDataState, 
    endpointKey: string, 
    params: EndpointParams, 
    dispatch: ActionCreator<ThunkAction<{}, { apiData: ApiDataState; }, void, Action>>, 
    request?: ApiDataRequest,
    instanceId: string = ''
): ApiDataBinding<any> => {
    return ({
        data: getResultData(apiData, endpointKey, params, instanceId),
        request: request || getApiDataRequest(apiData, endpointKey, params, instanceId) || createApiDataRequest(endpointKey),
        perform: (myParams: EndpointParams, body: any) => dispatch(performApiRequest(endpointKey, params, body, myParams, instanceId)),
        invalidateCache: () => dispatch(invalidateApiDataRequest(endpointKey, params, instanceId)),
        getInstance: (newInstanceId: string) => getApiDataBinding(apiData, endpointKey, params, dispatch, request, newInstanceId),
    });
};
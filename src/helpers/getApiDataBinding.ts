import { ApiDataState, EndpointParams, performApiRequest, getResultData, getApiDataRequest, ApiDataBinding, ApiDataRequest } from '..';
import { ActionCreator, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

export const getApiDataBinding = (
    apiData: ApiDataState, 
    endpointKey: string, 
    params: EndpointParams, 
    dispatch: ActionCreator<ThunkAction<{}, { apiData: ApiDataState; }, void, Action>>, 
    request?: ApiDataRequest
): ApiDataBinding<any> => {
    return ({
        data: getResultData(apiData, endpointKey, params),
        request: request || getApiDataRequest(apiData, endpointKey, params) || {
            networkStatus: 'ready',
            lastCall: 0,
            duration: 0,
            endpointKey,
        },
        perform: (myParams: EndpointParams, body: any) => dispatch(performApiRequest(endpointKey, myParams, body)),
    });
};
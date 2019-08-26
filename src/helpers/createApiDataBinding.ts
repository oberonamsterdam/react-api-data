import { ApiDataState, EndpointParams, performApiRequest, getResultData, getApiDataRequest, ApiDataBinding, ApiDataRequest, invalidateApiDataRequest } from '..';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import createApiDataRequest from './createApiDataRequest';

type BindingInstances = {
    [instanceId in string]: (apiData: ApiDataState, newApiDataRequest?: ApiDataRequest) => ApiDataBinding<any>;
};

export class BindingsStore {
    bindingInstances: BindingInstances = {} as BindingInstances;

    getBinding(endpointKey: string, 
        params: EndpointParams = {}, 
        dispatch: ThunkDispatch<{ apiData: ApiDataState }, void, Action>, 
        instanceId: string = '') {
        if (!this.bindingInstances[instanceId]) {
            this.bindingInstances[instanceId] = createApiDataBinding(
                endpointKey, 
                params, 
                dispatch, 
                (apiData: ApiDataState, newApiDataRequest?: ApiDataRequest, getInstanceId: string = instanceId) =>
                    this.getBinding(endpointKey, params, dispatch, getInstanceId)(apiData, newApiDataRequest),
                instanceId
            );
        }
        return this.bindingInstances[instanceId];
    }
}

export const createApiDataBinding = (
    endpointKey: string, 
    bindingParams: EndpointParams = {}, 
    dispatch: ThunkDispatch<{ apiData: ApiDataState; }, void, Action>,
    getApiDataBindingInstance: (apiData: ApiDataState, newApiDataRequest?: ApiDataRequest, instanceId?: string) => ApiDataBinding<any>,
    instanceId: string = ''
): (apiData: ApiDataState, request?: ApiDataRequest) => ApiDataBinding<any> => {
    let params: EndpointParams = bindingParams;

    return (apiData: ApiDataState, request?: ApiDataRequest) => ({
        data: getResultData(apiData, endpointKey, params, instanceId),
        request: request || getApiDataRequest(apiData, endpointKey, params, instanceId) || createApiDataRequest(endpointKey),
        perform: (performParams: EndpointParams, body: any) => {
            params = { ...bindingParams, ...performParams };
            return dispatch(performApiRequest(endpointKey, params, body, instanceId, getApiDataBindingInstance));
        },
        invalidateCache: () => dispatch(invalidateApiDataRequest(endpointKey, params, instanceId)),
        getInstance: (newInstanceId: string) => getApiDataBindingInstance(apiData, request, newInstanceId),
    });
};
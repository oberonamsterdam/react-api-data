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
        instanceId: string = '',
        apiData: ApiDataState, 
        request?: ApiDataRequest
    ) {
        if (!this.bindingInstances[instanceId]) {
            this.bindingInstances[instanceId] = createApiDataBinding(
                endpointKey, 
                params, 
                dispatch, 
                this,
                instanceId
            );
        }
        return this.bindingInstances[instanceId](apiData, request);
    }
}

export const createApiDataBinding = (
    endpointKey: string, 
    bindingParams: EndpointParams = {}, 
    dispatch: ThunkDispatch<{ apiData: ApiDataState; }, void, Action>,
    bindingsStore: BindingsStore,
    instanceId: string = ''
): ((apiData: ApiDataState, request?: ApiDataRequest) => ApiDataBinding<any>) => {
    let params: EndpointParams = bindingParams;

    return (apiData: ApiDataState, request?: ApiDataRequest) => ({
        data: getResultData(apiData, endpointKey, params, instanceId),
        request: request || getApiDataRequest(apiData, endpointKey, params, instanceId) || createApiDataRequest(endpointKey),
        perform: (performParams?: EndpointParams, body?: any) => {
            params = { ...bindingParams, ...performParams };
            return dispatch(performApiRequest(endpointKey, params, body, instanceId, bindingsStore));
        },
        invalidateCache: () => dispatch(invalidateApiDataRequest(endpointKey, params, instanceId)),
        getInstance: (newInstanceId: string) => bindingsStore.getBinding(endpointKey, params, dispatch, newInstanceId, apiData),
    });
};
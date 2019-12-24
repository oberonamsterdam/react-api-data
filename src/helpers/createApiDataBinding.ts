import { EndpointParams, ApiDataBinding, ApiDataRequest } from '../types';
import createApiDataRequest from './createApiDataRequest';
import { getRequestKey } from './getRequestKey';
import { ApiDataState } from '../reducer';
import { getApiDataRequest } from '../selectors/getApiDataRequest';
import { getResultData } from '../selectors/getResultData';
import { Actions } from '../types';

type BindingInstances = {
    [requestKey in string]: (apiData: ApiDataState, newApiDataRequest?: ApiDataRequest) => ApiDataBinding<any>;
};

export class BindingsStore {
    bindingInstances: BindingInstances = {} as BindingInstances;
    actions: Actions;

    constructor(actions: Actions) {
        this.actions = actions;
    }

    getBinding(endpointKey: string, 
               params: EndpointParams = {}, 
               instanceId: string = '',
               apiData: ApiDataState, 
               request?: ApiDataRequest
    ) {
        const requestKey = getRequestKey(endpointKey, params, instanceId);
        if (!this.bindingInstances[requestKey]) {
            this.bindingInstances[requestKey] = createApiDataBinding(
                endpointKey, 
                params,
                this,
                instanceId,
            );
        }
        return this.bindingInstances[requestKey](apiData, request);
    }
}

const createApiDataBinding = (
    endpointKey: string, 
    bindingParams: EndpointParams = {}, 
    bindingsStore: BindingsStore,
    instanceId: string = '',
): ((apiData: ApiDataState, request?: ApiDataRequest) => ApiDataBinding<any>) => {
    let params: EndpointParams = bindingParams;

    return (apiData: ApiDataState, request?: ApiDataRequest) => ({
        data: getResultData(apiData, endpointKey, params, instanceId),
        request: request || getApiDataRequest(apiData, endpointKey, params, instanceId) || createApiDataRequest(endpointKey),
        perform: (performParams?: EndpointParams, body?: any) => {
            params = { ...bindingParams, ...performParams };
            return bindingsStore.actions.perform(endpointKey, params, body, instanceId, bindingsStore);
        },
        invalidateCache: () => bindingsStore.actions.invalidateCache(endpointKey, params, instanceId),
        getInstance: (newInstanceId: string) => bindingsStore.getBinding(endpointKey, params, newInstanceId, apiData),
    });
};
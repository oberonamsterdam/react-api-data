import { EndpointParams, ApiDataBinding, ApiDataRequest } from '../types';
import createApiDataRequest from './createApiDataRequest';
import { getRequestKey } from './getRequestKey';
import { getLoadingState } from '../selectors/getLoadingState';
import { getFailedData } from '../selectors/getFailedData';
import { ApiDataState, Action } from '../reducer';
import { getApiDataRequest } from '../selectors/getApiDataRequest';
import { getResultData } from '../selectors/getResultData';
import { ThunkDispatch } from 'redux-thunk';
import { performApiRequest } from '../actions/performApiDataRequest';
import { invalidateApiDataRequest } from '../actions/invalidateApiDataRequest';

type BindingInstances = {
    [requestKey in string]: (apiData: ApiDataState, newApiDataRequest?: ApiDataRequest) => ApiDataBinding<any, any>;
};

export class BindingsStore {
    bindingInstances: BindingInstances = {} as BindingInstances;

    getBinding(
        endpointKey: string,
        params: EndpointParams = {},
        dispatch: ThunkDispatch<{ apiData: ApiDataState }, void, Action>,
        instanceId: string = '',
        apiData: ApiDataState,
        request?: ApiDataRequest
    ) {
        const requestKey = getRequestKey(endpointKey, params, instanceId);
        if (!this.bindingInstances[requestKey]) {
            this.bindingInstances[requestKey] = createApiDataBinding(endpointKey, params, dispatch, this, instanceId);
        }
        return this.bindingInstances[requestKey](apiData, request);
    }
}

const createApiDataBinding = (
    endpointKey: string,
    bindingParams: EndpointParams = {},
    dispatch: ThunkDispatch<{ apiData: ApiDataState }, void, Action>,
    bindingsStore: BindingsStore,
    instanceId: string = ''
): ((apiData: ApiDataState, request?: ApiDataRequest) => ApiDataBinding<any, any>) => {
    let params: EndpointParams = bindingParams;

    return (apiData: ApiDataState, request?: ApiDataRequest) => ({
        data: getResultData(apiData, endpointKey, params, instanceId),
        request: request || getApiDataRequest(apiData, endpointKey, params, instanceId) || createApiDataRequest(endpointKey),
        loading: getLoadingState(apiData, endpointKey, params, instanceId),
        dataFailed: getFailedData(apiData, endpointKey, params, instanceId),
        perform: (performParams?: EndpointParams, body?: any) => {
            params = { ...bindingParams, ...performParams };
            return dispatch(performApiRequest(endpointKey, params, body, instanceId, bindingsStore));
        },
        invalidateCache: () => dispatch(invalidateApiDataRequest(endpointKey, params, instanceId)),
        getInstance: (newInstanceId: string) =>
            bindingsStore.getBinding(endpointKey, params, dispatch, newInstanceId, apiData),
    });
};

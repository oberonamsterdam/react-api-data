import { EndpointParams, Binding, DataRequest, EndpointConfig } from '../types';
import createRequest from './createRequest';
import { getRequestKey } from './getRequestKey';
import { State, Action } from '../reducer';
import { getRequest } from '../selectors/getRequest';
import { getResultData } from '../selectors/getResultData';
import { ThunkDispatch } from 'redux-thunk';
import { performRequest } from '../actions/performRequest';
import { invalidateRequest } from '../actions/invalidateRequest';
import { getFailedData } from '../selectors/getFailedData';
import { getLoadingState } from '../selectors/getLoadingState';
import { purgeRequest } from '../actions/purgeRequest';

type BindingInstances = {
    [requestKey in string]: (apiData: State, newRequest?: DataRequest) => Binding<any, any, EndpointParams, any>;
};

export class BindingsStore {
    bindingInstances: BindingInstances = {} as BindingInstances;

    getBinding(
        endpointKey: string,
        params: EndpointParams = {},
        dispatch: ThunkDispatch<{ apiData: State }, void, Action>,
        instanceId: string = '',
        apiData: State,
        request?: DataRequest,
        config?: Partial<EndpointConfig>
    ) {
        const requestKey = getRequestKey(endpointKey, params, instanceId);
        if (!this.bindingInstances[requestKey]) {
            this.bindingInstances[requestKey] = createBinding(endpointKey, params, dispatch, this, instanceId, config);
        }
        return this.bindingInstances[requestKey](apiData, request);
    }
}

const createBinding = (
    endpointKey: string,
    bindingParams: EndpointParams = {},
    dispatch: ThunkDispatch<{ apiData: State }, void, Action>,
    bindingsStore: BindingsStore,
    instanceId: string = '',
    config?: Partial<EndpointConfig>
): ((apiData: State, request?: DataRequest) => Binding<any, any, EndpointParams, any>) => {
    let params: EndpointParams = bindingParams;

    return (apiData: State, request?: DataRequest) => ({
        data: getResultData(apiData, endpointKey, params, instanceId),
        dataFailed: getFailedData(apiData, endpointKey, params, instanceId),
        loading: getLoadingState(apiData, endpointKey, params, instanceId),
        request:
            request || getRequest(apiData, endpointKey, params, instanceId) || createRequest(endpointKey),
        perform: (performParams?: EndpointParams, body?: any) => {
            params = { ...bindingParams, ...performParams };
            return dispatch(performRequest(endpointKey, params, body, instanceId, bindingsStore, config));
        },
        invalidateCache: () => dispatch(invalidateRequest(endpointKey, params, instanceId)),
        purge: () => dispatch(purgeRequest(endpointKey, params, instanceId)),
        getInstance: (newInstanceId: string) =>
            bindingsStore.getBinding(endpointKey, params, dispatch, newInstanceId, apiData),
    });
};

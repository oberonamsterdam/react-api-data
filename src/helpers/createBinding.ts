import { EndpointParams, Binding, Request } from '../types';
import createRequest from './createRequest';
import { getRequestKey } from './getRequestKey';
import { State, Action } from '../reducer';
import { getRequest } from '../selectors/getRequest';
import { getResultData } from '../selectors/getResultData';
import { ThunkDispatch } from 'redux-thunk';
import { performApiRequest } from '../actions/performRequest';
import { invalidateRequest } from '../actions/invalidateRequest';

type BindingInstances = {
    [requestKey in string]: (apiData: State, newRequest?: Request) => Binding<any>;
};

export class BindingsStore {
    bindingInstances: BindingInstances = {} as BindingInstances;

    getBinding(
        endpointKey: string,
        params: EndpointParams = {},
        dispatch: ThunkDispatch<{ apiData: State }, void, Action>,
        instanceId: string = '',
        apiData: State,
        request?: Request
    ) {
        const requestKey = getRequestKey(endpointKey, params, instanceId);
        if (!this.bindingInstances[requestKey]) {
            this.bindingInstances[requestKey] = createBinding(endpointKey, params, dispatch, this, instanceId);
        }
        return this.bindingInstances[requestKey](apiData, request);
    }
}

const createBinding = (
    endpointKey: string, 
    bindingParams: EndpointParams = {}, 
    dispatch: ThunkDispatch<{ apiData: State; }, void, Action>,
    bindingsStore: BindingsStore,
    instanceId: string = '',
): ((apiData: State, request?: Request) => Binding<any>) => {
    let params: EndpointParams = bindingParams;

    return (apiData: State, request?: Request) => ({
        data: getResultData(apiData, endpointKey, params, instanceId),
        request:
            request || getRequest(apiData, endpointKey, params, instanceId) || createRequest(endpointKey),
        perform: (performParams?: EndpointParams, body?: any) => {
            params = { ...bindingParams, ...performParams };
            return dispatch(performApiRequest(endpointKey, params, body, instanceId, bindingsStore));
        },
        invalidateCache: () => dispatch(invalidateRequest(endpointKey, params, instanceId)),
        getInstance: (newInstanceId: string) =>
            bindingsStore.getBinding(endpointKey, params, dispatch, newInstanceId, apiData),
    });
};

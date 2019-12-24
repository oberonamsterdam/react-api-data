import { ActionCreator, Dispatch } from 'redux';
import { EndpointParams, Actions, ApiDataBinding } from '../types';
import { invalidateApiDataRequest } from '../actions/invalidateApiDataRequest';
import { purgeApiData } from '../actions/purgeApiData';
import { BindingsStore } from './createApiDataBinding';
import { ApiDataState } from '../reducer';

type PerformApiRequest = (endpointKey: string, params?: EndpointParams, body?: any, instanceId?: string, bindingsStore?: BindingsStore) => 
    (dispatch: Dispatch, getState: () => { apiData: ApiDataState }) => Promise<ApiDataBinding<any>>;

type getActionsWithPerform = (performApiRequest: PerformApiRequest) => (dispatch: ActionCreator<any>) => Actions;

// getActions is defined in performApiDataRequest, where performApiRequest is also inserted. This setup prevents a require loop between the two files.
export const getActionsWithPerform: getActionsWithPerform = (performApiRequest: PerformApiRequest) => (dispatch) => {
    return {
        invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId: string = '') => 
            dispatch(invalidateApiDataRequest(endpointKey, params, instanceId)),
        perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId: string = '', bindingsStore: BindingsStore = new BindingsStore(getActionsWithPerform(performApiRequest)(dispatch))) => 
            dispatch(performApiRequest(endpointKey, params, body, instanceId, bindingsStore)),
        purgeAll: () => dispatch(purgeApiData())
    };
};
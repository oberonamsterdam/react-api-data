import { ActionCreator, Dispatch } from 'redux';
import { EndpointParams, Actions, ApiDataBinding } from '../types';
import { invalidateApiDataRequest } from '../actions/invalidateApiDataRequest';
import { purgeApiData } from '../actions/purgeApiData';
import { BindingsStore } from './createApiDataBinding';
import { ApiDataState } from '../reducer';

type PerformApiDataRequestType = (endpointKey: string, params?: EndpointParams, body?: any, instanceId?: string, bindingsStore?: BindingsStore) => 
    (dispatch: Dispatch, getState: () => { apiData: ApiDataState }) => Promise<ApiDataBinding<any>>;

type getActionsWithPerform = (performApiRequest: PerformApiDataRequestType) => (dispatch: ActionCreator<any>) => Actions;

export const getActionsWithPerform: getActionsWithPerform = (performApiRequest: PerformApiDataRequestType) => (dispatch) => {
    return {
        invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId: string = '') => 
            dispatch(invalidateApiDataRequest(endpointKey, params, instanceId)),
        perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId: string = '', bindingsStore: BindingsStore = new BindingsStore(getActionsWithPerform(performApiRequest)(dispatch))) => 
            dispatch(performApiRequest(endpointKey, params, body, instanceId, bindingsStore)),
        purgeAll: () => dispatch(purgeApiData())
    };
};